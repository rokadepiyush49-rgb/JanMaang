# 0006. PostgreSQL is the system of record for demands

Date: 2026-10-25
Status: accepted

## Context

[ADR 0002](0002-postgres-over-firestore.md) chose PostgreSQL as the primary
datastore and kept Firebase for Auth, FCM and Storage only. The code then
drifted: the citizen flow that actually exists writes demands to **Firestore**
through Cloud Functions, the FastAPI service has no tables, and the web
dashboards read neither. A demand raised on the phone can never appear on a
panchayat's screen.

Two ways to close the gap were weighed (roadmap P0-2):

- **(a)** PostgreSQL holds demands; the mobile app calls the API.
- **(b)** Firestore stays the citizen-facing store; a Function mirrors demands
  into PostgreSQL for ranking, funding and dashboards.

## Decision

**(a). PostgreSQL is the single system of record for demands and everything
that hangs off them** — supporters, clusters, verifications, scores, funding,
audit. ADR 0002 stands; this ADR records that the drift is resolved in its
favour rather than by a permanent mirror.

Concretely:

1. **Identity.** Firebase Auth remains the identity provider. The API verifies
   Firebase ID tokens and maps the Firebase `uid` to a row in `users`. **Roles
   and scope (district, panchayat, department, institute) live in PostgreSQL**,
   not in Firebase custom claims, so one place grants and audits them.
2. **Self-registration creates citizens only.** Any verified Firebase account
   can create its own `citizen` row. Every other role is granted by an admin
   through the API and written to the audit log.
3. **Mobile** moves from Firestore to the API behind its existing repository
   interfaces (the datasource swap ADR 0002 describes).
4. **Cloud Functions** shrink to Firebase-native work. `submitVerification`
   and `analyzeReport` move behind API endpoints; their decision logic
   (`verificationPolicy.ts`, `consumeQuota`) is the specification the API
   versions are tested against.
5. **Firestore demand collections are retired** once the mobile app no longer
   writes them. Until then `firestore.rules` and its tests stay in force.
   `storage.rules` stays permanently — evidence photos remain in Firebase
   Storage.
6. **Append-only audit.** Every privileged write is recorded in
   `audit_events`, hash-chained, with UPDATE and DELETE refused by a trigger.

## Consequences

**Easier.** One authorisation model — `require(Permission)` plus row scope —
for web and mobile alike. Dashboards query the same rows citizens wrote. The
PostGIS 150 m → pgvector → LLM dedup cascade runs where the data is.

**Harder.** The mobile app needs network access to the API to file a report;
the offline outbox it already has becomes load-bearing. Officer status moves
from a custom claim to a database role, so the Firebase rules' `officer`
check is transitional.

**Accepted cost.** A period in which Firestore rules and PostgreSQL both guard
demands. It ends when the mobile datasource swap ships; the roadmap tracks it.

## Alternatives considered

**(b) Firestore as citizen store + mirror.** Rejected. Two sources of truth for
one record means two authorisation models to keep in step, a mirror Function
whose failure silently forks the data, and dedup that cannot use PostGIS or
pgvector on the copy citizens actually write. ADR 0002 already named this a
scheduling compromise, not an architecture.

**Roles in Firebase custom claims.** Rejected. Claims are capped in size,
propagate only on token refresh (up to an hour), and are invisible to SQL — a
panchayat's scope would have to be joined against data the database cannot see.
