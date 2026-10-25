"""HTTP hardening shared by every route: response headers and a body-size cap.

Plain ASGI rather than BaseHTTPMiddleware, so the body limit can watch a
streamed request byte by byte instead of trusting Content-Length.
"""

from collections.abc import Awaitable, Callable, MutableMapping
from typing import Any

Scope = MutableMapping[str, Any]
Message = MutableMapping[str, Any]
Receive = Callable[[], Awaitable[Message]]
Send = Callable[[Message], Awaitable[None]]
ASGIApp = Callable[[Scope, Receive, Send], Awaitable[None]]

# Swagger and ReDoc load their UI from a CDN; they only exist outside
# production (see main.py), and get the relaxed policy that needs.
_DOCS_PREFIXES = ("/docs", "/redoc")

_API_CSP = b"default-src 'none'; frame-ancestors 'none'; base-uri 'none'"


class SecurityHeadersMiddleware:
    """Headers for a JSON API that is never meant to be rendered or framed."""

    def __init__(self, app: ASGIApp, *, hsts: bool) -> None:
        self.app = app
        self.hsts = hsts

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        is_docs = str(scope.get("path", "")).startswith(_DOCS_PREFIXES)

        async def send_with_headers(message: Message) -> None:
            if message["type"] == "http.response.start":
                headers: list[tuple[bytes, bytes]] = list(message.get("headers", []))
                present = {name.lower() for name, _ in headers}

                def add(name: bytes, value: bytes) -> None:
                    if name not in present:
                        headers.append((name, value))

                add(b"x-content-type-options", b"nosniff")
                add(b"x-frame-options", b"DENY")
                add(b"referrer-policy", b"no-referrer")
                # Responses carry citizen and officer data; no shared cache
                # or browser back-button cache should keep a copy.
                add(b"cache-control", b"no-store")
                if not is_docs:
                    add(b"content-security-policy", _API_CSP)
                if self.hsts:
                    add(b"strict-transport-security", b"max-age=63072000; includeSubDomains")
                message["headers"] = headers
            await send(message)

        await self.app(scope, receive, send_with_headers)


class _BodyTooLargeError(Exception):
    pass


async def _reject(send: Send, status: int, detail: bytes) -> None:
    body = b'{"code":"request_rejected","detail":"' + detail + b'"}'
    await send(
        {
            "type": "http.response.start",
            "status": status,
            "headers": [
                (b"content-type", b"application/json"),
                (b"content-length", str(len(body)).encode()),
            ],
        }
    )
    await send({"type": "http.response.body", "body": body})


class BodySizeLimitMiddleware:
    """Refuse request bodies over ``max_bytes`` before a handler buffers them.

    Checks Content-Length up front, then counts the bytes actually received,
    because a client can omit the header (chunked) or lie in it.
    """

    def __init__(self, app: ASGIApp, *, max_bytes: int) -> None:
        self.app = app
        self.max_bytes = max_bytes

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        for name, value in scope.get("headers", []):
            if name.lower() == b"content-length":
                try:
                    declared = int(value)
                except ValueError:
                    await _reject(send, 400, b"Invalid Content-Length")
                    return
                if declared > self.max_bytes:
                    await _reject(send, 413, b"Request body too large")
                    return

        received = 0
        response_started = False

        async def counting_receive() -> Message:
            nonlocal received
            message = await receive()
            if message["type"] == "http.request":
                received += len(message.get("body", b""))
                if received > self.max_bytes:
                    raise _BodyTooLargeError
            return message

        async def tracking_send(message: Message) -> None:
            nonlocal response_started
            if message["type"] == "http.response.start":
                response_started = True
            await send(message)

        try:
            await self.app(scope, counting_receive, tracking_send)
        except _BodyTooLargeError:
            if not response_started:
                await _reject(send, 413, b"Request body too large")
