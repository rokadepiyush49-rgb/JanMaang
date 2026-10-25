"""The production TokenVerifier: Firebase Admin SDK.

``verify_id_token`` checks the signature against Google's rotating public
keys, the audience (this project's id), the issuer and expiry. With
``check_revoked`` it also asks Firebase whether the user's refresh tokens were
revoked or the account disabled since the token was minted — that is what
makes sign-out and admin deactivation take effect before the token's hour is
up. The Admin SDK is synchronous, so every call runs in a worker thread.
"""

import json
from typing import Any

import firebase_admin
from firebase_admin import auth, credentials, exceptions
from google.auth import exceptions as google_auth_exceptions
from starlette.concurrency import run_in_threadpool

from app.core.config import Settings
from app.core.logging import get_logger
from app.core.security import AuthUnavailableError, InvalidTokenError, VerifiedToken

logger = get_logger(__name__)

_APP_NAME = "janmaang-api"


class FirebaseTokenVerifier:
    def __init__(self, settings: Settings) -> None:
        self._settings = settings
        self._app: firebase_admin.App | None = None

    def _get_app(self) -> firebase_admin.App:
        """Initialise lazily, so importing the API never needs credentials."""
        if self._app is not None:
            return self._app
        try:
            self._app = firebase_admin.get_app(_APP_NAME)
            return self._app
        except ValueError:
            pass

        s = self._settings
        cred: Any = None
        if s.firebase_credentials_json:
            cred = credentials.Certificate(json.loads(s.firebase_credentials_json))
        elif s.firebase_credentials_path:
            cred = credentials.Certificate(s.firebase_credentials_path)
        # With no explicit credential the SDK falls back to Application Default
        # Credentials, which is what Cloud Run and GKE workload identity provide.
        self._app = firebase_admin.initialize_app(
            credential=cred, options={"projectId": s.firebase_project_id}, name=_APP_NAME
        )
        return self._app

    async def verify(self, token: str) -> VerifiedToken:
        app = self._get_app()
        try:
            decoded: dict[str, Any] = await run_in_threadpool(
                auth.verify_id_token,
                token,
                app=app,
                check_revoked=self._settings.firebase_check_revoked,
            )
        except (auth.InvalidIdTokenError, auth.UserDisabledError, ValueError) as exc:
            # The class name says why (expired, revoked, wrong project, …);
            # the token itself is never logged.
            logger.info("auth.token_rejected", reason=type(exc).__name__)
            raise InvalidTokenError(type(exc).__name__) from None
        except (
            exceptions.FirebaseError,
            # check_revoked calls the Auth API; with no credential available
            # that fails here rather than as a FirebaseError.
            google_auth_exceptions.GoogleAuthError,
        ) as exc:
            logger.warning("auth.provider_unavailable", reason=type(exc).__name__)
            raise AuthUnavailableError(type(exc).__name__) from None

        return VerifiedToken(
            uid=str(decoded["uid"]),
            email=decoded.get("email"),
            phone_number=decoded.get("phone_number"),
            name=decoded.get("name"),
            claims=decoded,
        )

    async def revoke(self, uid: str) -> None:
        """Invalidate every refresh token for this user: sign out everywhere."""
        try:
            await run_in_threadpool(auth.revoke_refresh_tokens, uid, app=self._get_app())
        except (exceptions.FirebaseError, google_auth_exceptions.GoogleAuthError) as exc:
            logger.warning("auth.revoke_failed", reason=type(exc).__name__)
            raise AuthUnavailableError(type(exc).__name__) from None
