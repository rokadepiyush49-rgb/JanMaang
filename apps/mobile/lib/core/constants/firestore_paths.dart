/// Single source of truth for Firestore collection names, so a rename never has
/// to be hunted through string literals.
abstract final class FirestorePaths {
  static const users = 'users';
  static const demands = 'demands';
  static const clusters = 'clusters';
  static const verifications = 'verifications';
  static const ledgerEntries = 'ledgerEntries';
  static const allocations = 'allocations';

  // Sub-collections
  static const supporters = 'supporters';
  static const timeline = 'timeline';

  // Storage buckets
  static String reportPhoto(String uid, String demandId, String fileName) =>
      'reports/$uid/$demandId/$fileName';

  /// Keyed by the uploader's uid, like [reportPhoto], so storage.rules can
  /// tell whose evidence a file is and nobody can write into another
  /// person's verification folder.
  static String verificationPhoto(
    String uid,
    String verificationId,
    String fileName,
  ) => 'verifications/$uid/$verificationId/$fileName';

  // Callable Cloud Functions
  static const fnAnalyzeReport = 'analyzeReport';
  static const fnFindSimilarDemands = 'findSimilarDemands';
  static const fnSubmitVerification = 'submitVerification';
  static const fnJoinDemand = 'joinDemand';
}
