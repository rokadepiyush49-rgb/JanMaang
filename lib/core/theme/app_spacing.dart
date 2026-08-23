/// Spacing and shape tokens from the Stitch design system.
///
/// Everything is a multiple of the 4px baseline grid that gives the interface
/// its vertical rhythm.
abstract final class Insets {
  static const double xs = 4;
  static const double sm = 8;
  static const double md = 16;
  static const double lg = 24;
  static const double xl = 48;

  static const double gutter = 24;
  static const double marginMobile = 16;
  static const double marginDesktop = 32;
  static const double containerMax = 1280;
}

/// Restrained, precise shape language. No pills on primary UI — circles are
/// reserved for avatars and status pips.
abstract final class Corners {
  /// Checkboxes, small buttons, tags, status badges.
  static const double sm = 4;

  /// Standard buttons, input fields, small cards.
  static const double base = 8;

  /// Primary containers and large modals.
  static const double lg = 12;

  /// Sheets and the docked bottom bar.
  static const double xl = 16;
}

/// Layout breakpoint. Below this the Stitch designs collapse the side nav into
/// the bottom navigation bar and stack the bento grid into a single column.
abstract final class Breakpoints {
  static const double medium = 768;
  static const double expanded = 1024;
}
