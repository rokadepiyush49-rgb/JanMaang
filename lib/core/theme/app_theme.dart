import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import 'app_spacing.dart';
import 'janmaang_colors.dart';
import 'janmaang_typography.dart';

/// Builds the Material 3 themes from the Stitch tokens.
///
/// The design system is explicit that hierarchy comes from tonal layers and
/// 1px hairlines rather than shadows, so surface tint and elevation overlays
/// are switched off and cards carry an outline instead.
abstract final class AppTheme {
  static ThemeData get light => _build(_lightScheme, Brightness.light);
  static ThemeData get dark => _build(_darkScheme, Brightness.dark);

  static const _lightScheme = ColorScheme(
    brightness: Brightness.light,
    primary: JanMaangColors.primary,
    onPrimary: JanMaangColors.onPrimary,
    primaryContainer: JanMaangColors.primaryContainer,
    onPrimaryContainer: JanMaangColors.onPrimaryContainer,
    primaryFixed: JanMaangColors.primaryFixed,
    primaryFixedDim: JanMaangColors.primaryFixedDim,
    onPrimaryFixed: JanMaangColors.onPrimaryFixed,
    onPrimaryFixedVariant: JanMaangColors.onPrimaryFixedVariant,
    secondary: JanMaangColors.secondary,
    onSecondary: JanMaangColors.onSecondary,
    secondaryContainer: JanMaangColors.secondaryContainer,
    onSecondaryContainer: JanMaangColors.onSecondaryContainer,
    secondaryFixed: JanMaangColors.secondaryFixed,
    secondaryFixedDim: JanMaangColors.secondaryFixedDim,
    onSecondaryFixed: JanMaangColors.onSecondaryFixed,
    onSecondaryFixedVariant: JanMaangColors.onSecondaryFixedVariant,
    tertiary: JanMaangColors.tertiary,
    onTertiary: JanMaangColors.onTertiary,
    tertiaryContainer: JanMaangColors.tertiaryContainer,
    onTertiaryContainer: JanMaangColors.onTertiaryContainer,
    tertiaryFixed: JanMaangColors.tertiaryFixed,
    tertiaryFixedDim: JanMaangColors.tertiaryFixedDim,
    onTertiaryFixed: JanMaangColors.onTertiaryFixed,
    onTertiaryFixedVariant: JanMaangColors.onTertiaryFixedVariant,
    error: JanMaangColors.error,
    onError: JanMaangColors.onError,
    errorContainer: JanMaangColors.errorContainer,
    onErrorContainer: JanMaangColors.onErrorContainer,
    surface: JanMaangColors.surface,
    onSurface: JanMaangColors.onSurface,
    surfaceDim: JanMaangColors.surfaceDim,
    surfaceBright: JanMaangColors.surfaceBright,
    surfaceContainerLowest: JanMaangColors.surfaceContainerLowest,
    surfaceContainerLow: JanMaangColors.surfaceContainerLow,
    surfaceContainer: JanMaangColors.surfaceContainer,
    surfaceContainerHigh: JanMaangColors.surfaceContainerHigh,
    surfaceContainerHighest: JanMaangColors.surfaceContainerHighest,
    onSurfaceVariant: JanMaangColors.onSurfaceVariant,
    inverseSurface: JanMaangColors.inverseSurface,
    onInverseSurface: JanMaangColors.inverseOnSurface,
    inversePrimary: JanMaangColors.inversePrimary,
    outline: JanMaangColors.outline,
    outlineVariant: JanMaangColors.outlineVariant,
    surfaceTint: JanMaangColors.surfaceTint,
    shadow: Color(0xFF000000),
    scrim: Color(0xFF000000),
  );

  static const _darkScheme = ColorScheme(
    brightness: Brightness.dark,
    primary: JanMaangDarkColors.primary,
    onPrimary: JanMaangDarkColors.onPrimary,
    primaryContainer: JanMaangDarkColors.primaryContainer,
    onPrimaryContainer: JanMaangDarkColors.onPrimaryContainer,
    primaryFixed: JanMaangColors.primaryFixed,
    primaryFixedDim: JanMaangColors.primaryFixedDim,
    onPrimaryFixed: JanMaangColors.onPrimaryFixed,
    onPrimaryFixedVariant: JanMaangColors.onPrimaryFixedVariant,
    secondary: JanMaangDarkColors.secondary,
    onSecondary: JanMaangDarkColors.onSecondary,
    secondaryContainer: JanMaangDarkColors.secondaryContainer,
    onSecondaryContainer: JanMaangDarkColors.onSecondaryContainer,
    secondaryFixed: JanMaangColors.secondaryFixed,
    secondaryFixedDim: JanMaangColors.secondaryFixedDim,
    onSecondaryFixed: JanMaangColors.onSecondaryFixed,
    onSecondaryFixedVariant: JanMaangColors.onSecondaryFixedVariant,
    tertiary: JanMaangDarkColors.tertiary,
    onTertiary: JanMaangDarkColors.onTertiary,
    tertiaryContainer: JanMaangDarkColors.tertiaryContainer,
    onTertiaryContainer: JanMaangDarkColors.onTertiaryContainer,
    tertiaryFixed: JanMaangColors.tertiaryFixed,
    tertiaryFixedDim: JanMaangColors.tertiaryFixedDim,
    onTertiaryFixed: JanMaangColors.onTertiaryFixed,
    onTertiaryFixedVariant: JanMaangColors.onTertiaryFixedVariant,
    error: JanMaangDarkColors.error,
    onError: JanMaangDarkColors.onError,
    errorContainer: JanMaangDarkColors.errorContainer,
    onErrorContainer: JanMaangDarkColors.onErrorContainer,
    surface: JanMaangDarkColors.surface,
    onSurface: JanMaangDarkColors.onSurface,
    surfaceDim: JanMaangDarkColors.surfaceDim,
    surfaceBright: JanMaangDarkColors.surfaceBright,
    surfaceContainerLowest: JanMaangDarkColors.surfaceContainerLowest,
    surfaceContainerLow: JanMaangDarkColors.surfaceContainerLow,
    surfaceContainer: JanMaangDarkColors.surfaceContainer,
    surfaceContainerHigh: JanMaangDarkColors.surfaceContainerHigh,
    surfaceContainerHighest: JanMaangDarkColors.surfaceContainerHighest,
    onSurfaceVariant: JanMaangDarkColors.onSurfaceVariant,
    inverseSurface: JanMaangDarkColors.inverseSurface,
    onInverseSurface: JanMaangDarkColors.inverseOnSurface,
    inversePrimary: JanMaangColors.primary,
    outline: JanMaangDarkColors.outline,
    outlineVariant: JanMaangDarkColors.outlineVariant,
    surfaceTint: JanMaangColors.surfaceTint,
    shadow: Color(0xFF000000),
    scrim: Color(0xFF000000),
  );

  static ThemeData _build(ColorScheme scheme, Brightness brightness) {
    final textTheme =
        JanMaangTypography.textTheme(scheme.onSurface, scheme.onSurfaceVariant);
    final isLight = brightness == Brightness.light;

    return ThemeData(
      useMaterial3: true,
      colorScheme: scheme,
      brightness: brightness,
      scaffoldBackgroundColor: scheme.surface,
      canvasColor: scheme.surface,
      textTheme: textTheme,
      fontFamily: JanMaangTypography.bodyFamily,
      // The system defines depth through tonal layers, not elevation overlays.
      applyElevationOverlayColor: false,
      splashFactory: InkSparkle.splashFactory,
      visualDensity: VisualDensity.standard,

      appBarTheme: AppBarTheme(
        backgroundColor: scheme.surface,
        foregroundColor: scheme.onSurface,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        scrolledUnderElevation: 0,
        centerTitle: false,
        titleTextStyle: JanMaangTypography.headlineSm.copyWith(color: scheme.primary),
        systemOverlayStyle: isLight
            ? SystemUiOverlayStyle.dark.copyWith(
                statusBarColor: Colors.transparent,
                systemNavigationBarColor: scheme.surface,
                systemNavigationBarIconBrightness: Brightness.dark,
              )
            : SystemUiOverlayStyle.light.copyWith(
                statusBarColor: Colors.transparent,
                systemNavigationBarColor: scheme.surface,
                systemNavigationBarIconBrightness: Brightness.light,
              ),
      ),

      // Level 1: pure surface + 1px hairline, no shadow.
      cardTheme: CardThemeData(
        color: scheme.surfaceContainerLowest,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        margin: EdgeInsets.zero,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(Corners.lg),
          side: BorderSide(color: scheme.outlineVariant),
        ),
      ),

      dividerTheme: DividerThemeData(
        color: scheme.outlineVariant,
        thickness: 1,
        space: 1,
      ),

      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          backgroundColor: scheme.primary,
          foregroundColor: scheme.onPrimary,
          disabledBackgroundColor: scheme.primary.withValues(alpha: 0.5),
          disabledForegroundColor: scheme.onPrimary.withValues(alpha: 0.7),
          minimumSize: const Size.fromHeight(52),
          padding: const EdgeInsets.symmetric(
            horizontal: Insets.md,
            vertical: Insets.sm,
          ),
          textStyle: JanMaangTypography.titleLg,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(Corners.base),
          ),
          elevation: 0,
        ),
      ),

      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: scheme.onSurface,
          backgroundColor: scheme.surfaceContainerLowest,
          minimumSize: const Size.fromHeight(48),
          padding: const EdgeInsets.symmetric(
            horizontal: Insets.md,
            vertical: Insets.sm,
          ),
          textStyle: JanMaangTypography.labelMd,
          side: BorderSide(color: scheme.outline),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(Corners.base),
          ),
        ),
      ),

      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: scheme.secondary,
          textStyle: JanMaangTypography.labelMd,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(Corners.sm),
          ),
        ),
      ),

      // Soft 8px radius, persistent labels above the field, 2px blue focus ring.
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: scheme.surfaceContainerLowest,
        contentPadding: const EdgeInsets.symmetric(
          horizontal: Insets.md,
          vertical: Insets.md,
        ),
        hintStyle: JanMaangTypography.bodyMd.copyWith(color: scheme.outline),
        labelStyle: JanMaangTypography.labelMd.copyWith(color: scheme.onSurface),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(Corners.base),
          borderSide: BorderSide(color: scheme.outlineVariant),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(Corners.base),
          borderSide: BorderSide(color: scheme.outlineVariant),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(Corners.base),
          borderSide: BorderSide(color: scheme.secondary, width: 2),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(Corners.base),
          borderSide: BorderSide(color: scheme.error),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(Corners.base),
          borderSide: BorderSide(color: scheme.error, width: 2),
        ),
      ),

      // 4px radius, never pill-shaped, to match the institutional aesthetic.
      chipTheme: ChipThemeData(
        backgroundColor: scheme.surfaceContainerHigh,
        labelStyle: JanMaangTypography.labelMd.copyWith(color: scheme.onSurface),
        side: BorderSide.none,
        padding: const EdgeInsets.symmetric(horizontal: Insets.sm, vertical: Insets.xs),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(Corners.sm),
        ),
      ),

      navigationBarTheme: NavigationBarThemeData(
        backgroundColor: scheme.surface,
        indicatorColor: scheme.primaryContainer,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        height: 72,
        labelTextStyle: WidgetStateProperty.resolveWith(
          (states) => states.contains(WidgetState.selected)
              ? JanMaangTypography.labelMd.copyWith(color: scheme.onPrimaryContainer)
              : JanMaangTypography.labelMd.copyWith(color: scheme.onSurfaceVariant),
        ),
      ),

      progressIndicatorTheme: ProgressIndicatorThemeData(
        color: scheme.primary,
        linearTrackColor: scheme.surfaceContainerHighest,
        circularTrackColor: scheme.surfaceContainerHighest,
      ),

      snackBarTheme: SnackBarThemeData(
        backgroundColor: scheme.inverseSurface,
        contentTextStyle:
            JanMaangTypography.bodySm.copyWith(color: scheme.onInverseSurface),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(Corners.base),
        ),
      ),

      bottomSheetTheme: BottomSheetThemeData(
        backgroundColor: scheme.surfaceContainerLowest,
        surfaceTintColor: Colors.transparent,
        shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(Corners.xl)),
        ),
      ),

      dialogTheme: DialogThemeData(
        backgroundColor: scheme.surfaceContainerLowest,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(Corners.lg),
        ),
      ),

      switchTheme: SwitchThemeData(
        thumbColor: WidgetStateProperty.resolveWith(
          (states) => states.contains(WidgetState.selected)
              ? scheme.onPrimary
              : scheme.surfaceContainerLowest,
        ),
        trackColor: WidgetStateProperty.resolveWith(
          (states) => states.contains(WidgetState.selected)
              ? scheme.primary
              : scheme.surfaceContainerHighest,
        ),
        trackOutlineColor: WidgetStateProperty.resolveWith(
          (states) => states.contains(WidgetState.selected)
              ? Colors.transparent
              : scheme.outlineVariant,
        ),
      ),

      listTileTheme: ListTileThemeData(
        titleTextStyle: JanMaangTypography.bodyMd.copyWith(color: scheme.onSurface),
        subtitleTextStyle:
            JanMaangTypography.bodySm.copyWith(color: scheme.onSurfaceVariant),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(Corners.base),
        ),
      ),
    );
  }
}
