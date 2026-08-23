import 'package:flutter/material.dart';

/// Colour system derived from the JanMaang brand mark.
///
/// The logo carries its own palette and the product's meaning is already
/// encoded in it: a deep navy wordmark for institutional weight, a lotus of
/// five petals, and — under the wordmark — five colour bars running green,
/// blue, orange, red, amber. Those five bars are reused verbatim as the
/// severity ramp and the issue-category spectrum, so the map legend and the
/// brand mark are the same set of colours.
///
/// Structure (surfaces, tonal steps, hairline outlines, the flat elevation
/// recipe) is inherited from the Stitch design system; only the hues change.
abstract final class JanMaangColors {
  // ---------------------------------------------------------------------
  // Brand — sampled from the mark
  // ---------------------------------------------------------------------

  /// The wordmark navy. Carries every institutional surface.
  static const brandNavy = Color(0xFF16325F);

  /// "मांग" and the leftmost bar. Resolved work, verified impact.
  static const brandGreen = Color(0xFF17984A);

  /// Second bar and the cool petals. Interactive and AI-driven states.
  static const brandBlue = Color(0xFF2E7FD4);

  /// Third bar. High severity.
  static const brandOrange = Color(0xFFEE6B22);

  /// Fourth bar. Critical severity.
  static const brandRed = Color(0xFFDE3B32);

  /// Fifth bar. Moderate severity, work under review.
  static const brandAmber = Color(0xFFF4B223);

  // ---------------------------------------------------------------------
  // Primary — Deep Navy
  // ---------------------------------------------------------------------
  static const primary = brandNavy;
  static const onPrimary = Color(0xFFFFFFFF);
  static const primaryContainer = Color(0xFF24467C);
  static const onPrimaryContainer = Color(0xFFD5E3FB);
  static const primaryFixed = Color(0xFFD9E6FC);
  static const primaryFixedDim = Color(0xFFAFC8EC);
  static const onPrimaryFixed = Color(0xFF0A1B36);
  static const onPrimaryFixedVariant = Color(0xFF2F4E80);
  static const inversePrimary = Color(0xFFAFC8EC);

  // ---------------------------------------------------------------------
  // Secondary — Civic Blue
  // ---------------------------------------------------------------------
  static const secondary = Color(0xFF1B67BE);
  static const onSecondary = Color(0xFFFFFFFF);
  static const secondaryContainer = brandBlue;
  static const onSecondaryContainer = Color(0xFFFFFFFF);
  static const secondaryFixed = Color(0xFFDCEAFD);
  static const secondaryFixedDim = Color(0xFFA9CBF3);
  static const onSecondaryFixed = Color(0xFF0A2547);
  static const onSecondaryFixedVariant = Color(0xFF12508F);

  // ---------------------------------------------------------------------
  // Tertiary — Lotus Green (resolved / verified)
  // ---------------------------------------------------------------------
  static const tertiary = Color(0xFF0F7538);
  static const onTertiary = Color(0xFFFFFFFF);
  static const tertiaryContainer = brandGreen;
  static const onTertiaryContainer = Color(0xFF0A3D1E);
  static const tertiaryFixed = Color(0xFFCFF0DC);
  static const tertiaryFixedDim = Color(0xFF9EDCB8);
  static const onTertiaryFixed = Color(0xFF07301A);
  static const onTertiaryFixedVariant = Color(0xFF0F7538);

  // ---------------------------------------------------------------------
  // Error / warning
  // ---------------------------------------------------------------------
  static const error = Color(0xFFC22A22);
  static const onError = Color(0xFFFFFFFF);
  static const errorContainer = Color(0xFFFCDAD7);
  static const onErrorContainer = Color(0xFF7A1610);

  static const warning = Color(0xFF9A6B00);
  static const warningContainer = Color(0xFFFDECC4);
  static const onWarningContainer = Color(0xFF3D2800);

  // ---------------------------------------------------------------------
  // Surfaces — cool blue-greys, tuned to sit under the navy
  // ---------------------------------------------------------------------
  static const background = Color(0xFFF7FAFD);
  static const onBackground = Color(0xFF151A21);
  static const surface = Color(0xFFF7FAFD);
  static const surfaceDim = Color(0xFFD7DCE3);
  static const surfaceBright = Color(0xFFFFFFFF);
  static const surfaceContainerLowest = Color(0xFFFFFFFF);
  static const surfaceContainerLow = Color(0xFFF1F5FA);
  static const surfaceContainer = Color(0xFFEAEFF6);
  static const surfaceContainerHigh = Color(0xFFE3EAF2);
  static const surfaceContainerHighest = Color(0xFFDCE4ED);
  static const surfaceVariant = Color(0xFFDCE4ED);
  static const onSurface = Color(0xFF151A21);
  static const onSurfaceVariant = Color(0xFF454C57);
  static const inverseSurface = Color(0xFF283039);
  static const inverseOnSurface = Color(0xFFEEF2F7);
  static const surfaceTint = Color(0xFF3C5B8C);

  static const outline = Color(0xFF737B87);
  static const outlineVariant = Color(0xFFC4CBD6);

  // ---------------------------------------------------------------------
  // Elevation — the design system defines depth with hairlines, not shadows
  // ---------------------------------------------------------------------
  static const shadowAmbient = Color(0x0A000000);
  static const shadowModal = Color(0x14000000);
  static const micShadow = Color(0x2616325F);
}

/// Dark counterparts, derived by lifting each brand hue for dark surfaces.
abstract final class JanMaangDarkColors {
  static const primary = Color(0xFFAFC8EC);
  static const onPrimary = Color(0xFF0A1B36);
  static const primaryContainer = Color(0xFF2F4E80);
  static const onPrimaryContainer = Color(0xFFD9E6FC);

  static const secondary = Color(0xFFA9CBF3);
  static const onSecondary = Color(0xFF0A2547);
  static const secondaryContainer = Color(0xFF12508F);
  static const onSecondaryContainer = Color(0xFFDCEAFD);

  static const tertiary = Color(0xFF7FD9A4);
  static const onTertiary = Color(0xFF07301A);
  static const tertiaryContainer = Color(0xFF0F7538);
  static const onTertiaryContainer = Color(0xFFCFF0DC);

  static const error = Color(0xFFFFB4AA);
  static const onError = Color(0xFF690003);
  static const errorContainer = Color(0xFF93110B);
  static const onErrorContainer = Color(0xFFFCDAD7);

  static const background = Color(0xFF0E1319);
  static const onBackground = Color(0xFFE0E4EA);
  static const surface = Color(0xFF0E1319);
  static const surfaceDim = Color(0xFF0E1319);
  static const surfaceBright = Color(0xFF343B44);
  static const surfaceContainerLowest = Color(0xFF090D12);
  static const surfaceContainerLow = Color(0xFF161B22);
  static const surfaceContainer = Color(0xFF1A2029);
  static const surfaceContainerHigh = Color(0xFF252C36);
  static const surfaceContainerHighest = Color(0xFF303841);
  static const surfaceVariant = Color(0xFF454C57);
  static const onSurface = Color(0xFFE0E4EA);
  static const onSurfaceVariant = Color(0xFFC4CBD6);
  static const inverseSurface = Color(0xFFE0E4EA);
  static const inverseOnSurface = Color(0xFF283039);

  static const outline = Color(0xFF8C939F);
  static const outlineVariant = Color(0xFF454C57);

  static const warning = Color(0xFFF4B223);
  static const warningContainer = Color(0xFF5C3F00);
  static const onWarningContainer = Color(0xFFFDECC4);
}

/// How many reports at one place, and how loudly the map should say so.
///
/// The spec is explicit that colour alone must not carry this — every tier
/// also changes pin size, ring weight and the count badge, so the ranking
/// survives greyscale and colour-blindness.
enum DensityTier {
  low('Low', 1, JanMaangColors.brandGreen, Color(0xFF07301A), 34),
  moderate('Moderate', 5, JanMaangColors.brandAmber, Color(0xFF3D2800), 42),
  high('High', 20, JanMaangColors.brandOrange, Color(0xFF411500), 52),
  critical('Critical', 50, JanMaangColors.brandRed, Color(0xFFFFFFFF), 64);

  const DensityTier(this.label, this.minReports, this.color, this.onColor,
      this.markerSize);

  final String label;

  /// Lower bound of the tier, inclusive.
  final int minReports;
  final Color color;
  final Color onColor;

  /// Diameter in logical pixels, so density reads without relying on hue.
  final double markerSize;

  /// Ring thickness — a second non-colour cue that grows with the tier.
  double get ringWidth => switch (this) {
        DensityTier.low => 2,
        DensityTier.moderate => 2.5,
        DensityTier.high => 3,
        DensityTier.critical => 4,
      };

  /// Only the top tier pulses. Animating every marker makes the map noisy,
  /// which the brief calls out explicitly.
  bool get pulses => this == DensityTier.critical;

  static DensityTier forReports(int reports) {
    if (reports >= DensityTier.critical.minReports) return DensityTier.critical;
    if (reports >= DensityTier.high.minReports) return DensityTier.high;
    if (reports >= DensityTier.moderate.minReports) return DensityTier.moderate;
    return DensityTier.low;
  }
}
