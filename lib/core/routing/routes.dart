/// Every named route in the app. Using an enum keeps `goNamed` call sites
/// typo-proof and gives one place to see the whole navigation surface.
enum AppRoute {
  splash('/splash'),
  onboarding('/onboarding'),
  login('/login'),
  otp('/login/otp'),
  home('/home'),
  track('/track'),
  report('/report'),
  leaderboard('/leaderboard'),
  ledger('/ledger'),
  demandDetail('/demand/:id'),
  cluster('/cluster/:id'),
  questionRanking('/demand/:id/question'),
  verify('/verify/:id'),
  fieldVerification('/field-verification/:id'),
  map('/map'),
  method('/method'),
  profile('/profile'),
  notifications('/notifications');

  const AppRoute(this.path);

  final String path;
}
