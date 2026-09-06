# JanMaang — citizen app

Flutter. The citizen experience: report a local need by voice or photo, track it
through clustering, ranking and funding, and verify the fix.

Run everything from the repository root with `make mobile`, or from here with
`flutter run`.

## Stack

Flutter · Dart · Material 3 · Riverpod 3 · go_router · flutter_map +
OpenStreetMap · Firebase (Auth, Firestore, Storage, Functions, Messaging,
Analytics, Crashlytics) · Google Sign-In · Gemini (server-side only)

The brief asked for Framer Motion and Leaflet. Both are React libraries and
cannot run in Flutter, so their roles are filled by the platform equivalents:
**flutter_map** renders the same OpenStreetMap tiles under the same ODbL
attribution, and the motion system in `lib/core/theme/motion.dart` provides the
page transitions, staggered entrances, counters and press feedback. Every
animation honours the platform reduce-motion setting.

## Running it

The app runs out of the box against in-memory repositories seeded with the same
figures the designs were reviewed with, so no Firebase project is needed to see
or test the whole UI:

```bash
flutter run
```

For demos and screenshots, skip the OTP step:

```bash
flutter run --dart-define=DEMO_SIGNED_IN=true
```

Against live Firebase:

```bash
flutterfire configure --project=<your-project-id>
# then follow the TODO in lib/bootstrap.dart
flutter run --dart-define=USE_MOCKS=false
```

Google Maps surfaces stay as styled placeholders until a platform key is
provisioned; enable them with `--dart-define=MAPS_ENABLED=true`.

## Architecture

```
lib/
  core/        config · constants · theme · routing · services · errors · utils
  features/    onboarding auth home report demands ledger verification profile
                 each with data/ domain/ presentation/
  shared/      models · widgets (the design-system component library)
```

Presentation never imports `cloud_firestore`. Repositories are interfaces in
`domain/`, implemented twice in `data/` — against Firebase and in memory — and
selected at the composition root in `lib/core/providers.dart`. Swapping one out
is a one-line override, which is also how the tests inject fakes.

See [../../docs/architecture/mobile.md](../../docs/architecture/mobile.md) for the data model,
the Firestore collections and the Cloud Function boundaries.

> **Migration in progress.** Per
> [ADR 0002](../../docs/architecture/decisions/0002-postgres-over-firestore.md), the
> domain is moving from Firestore to the Postgres-backed API. The repository
> interfaces in `domain/` do not change — only the datasource behind
> `data/*_repository_impl.dart`. The mock implementations stay, and remain the
> offline demo path.

## Brand and photography

Two asset slots, both with graceful fallbacks so the build never breaks on a
missing file:

- `assets/brand/` — the logo lockup and square mark. `JmLogo` falls back to a
  typographic lockup. Launcher icons, favicon and splash are generated from the
  mark via `flutter_launcher_icons.yaml` and `flutter_native_splash.yaml`.
- `assets/gallery/` — the four infrastructure photographs behind the
  auto-scrolling gallery on Home (`roads.jpg`, `transit.jpg`, `civic.jpg`,
  `water.jpg`). Until they land, each slide renders a designed gradient card
  with its icon and caption.

See the README in each directory for sizes and export settings.

## Security

No server-side credential ships in the app. The Gemini key lives in Secret
Manager and is reachable only through the `analyzeReport` callable; ranking,
clustering, funding and verification are all server-write-only, enforced by
`firebase/firestore.rules`. See [../../SECURITY.md](../../SECURITY.md).

## Checks

```bash
flutter analyze
flutter test

# or, from the repository root:
make test-mobile
```

## Platform status

| Target | State |
|---|---|
| Android | builds; toolchain configured against SDK 36.1.0 + JDK 17 |
| Web | builds and runs; used for UI verification in this environment |
| iOS | needs a full Xcode install (only Command Line Tools present) plus CocoaPods |
