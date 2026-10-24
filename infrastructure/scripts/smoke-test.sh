#!/usr/bin/env bash
# Post-deploy verification. Fails the deploy (and triggers rollback) if the
# service is up but not actually working.
#
#   smoke-test.sh <api-base-url> [web-base-url]
set -euo pipefail

BASE_URL="${1:?usage: smoke-test.sh <api-base-url> [web-base-url]}"
# The web app may sit on its own host. When it does not, it shares the API's.
WEB_URL="${2:-$BASE_URL}"
fail() { echo "✗ $1" >&2; exit 1; }

# HTTP status of a GET, or 000 if nothing answered. No --fail: with it, curl
# exits non-zero on a 4xx *after* printing the code, and an `|| echo 000`
# fallback then glues the two together ("401000").
status() { curl -sS -o /dev/null -w '%{http_code}' --max-time 15 "$1" 2>/dev/null || true; }

echo "→ smoke testing $BASE_URL (web: $WEB_URL)"

# ─── api ─────────────────────────────────────────────────────────────────────
code=$(status "$BASE_URL/health")
[ "$code" = "200" ] || fail "health returned $code"
echo "  ✓ health"

# The OpenAPI schema serving proves routing and app construction, not just that
# a process is listening.
code=$(status "$BASE_URL/api/v1/openapi.json")
[ "$code" = "200" ] || fail "openapi schema returned $code"
echo "  ✓ api routes registered"

# An unauthenticated call to a protected endpoint must be rejected. If this ever
# returns 200, authorisation is off and the deploy must not proceed.
code=$(status "$BASE_URL/api/v1/audit")
case "$code" in
  401|403|404) echo "  ✓ protected endpoints reject anonymous callers" ;;
  *) fail "protected endpoint returned $code — authorisation may be disabled" ;;
esac

# ─── web ─────────────────────────────────────────────────────────────────────
code=$(status "$WEB_URL/api/health")
[ "$code" = "200" ] || fail "web health returned $code"
echo "  ✓ web health"

code=$(status "$WEB_URL/login")
[ "$code" = "200" ] || fail "web login page returned $code"
echo "  ✓ web renders"

# A role dashboard must bounce an anonymous visitor to /login. A 200 here means
# the role proxy is not running and every dashboard shell is open.
code=$(status "$WEB_URL/admin")
case "$code" in
  307|308) echo "  ✓ role dashboards redirect anonymous visitors" ;;
  *) fail "/admin returned $code to an anonymous visitor — the role proxy may be off" ;;
esac

echo "✓ smoke tests passed"
