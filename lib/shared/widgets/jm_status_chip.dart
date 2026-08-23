import 'package:flutter/material.dart';

import '../../core/theme/app_spacing.dart';
import '../../core/theme/janmaang_colors.dart';
import '../../core/theme/janmaang_typography.dart';
import '../models/demand_enums.dart';

/// 4px-radius status badge — never pill-shaped, per the design system.
///
/// Teal = funded/verified, amber = in review, navy = prioritised,
/// surface-variant = pending, error-container = high severity.
class JmStatusChip extends StatelessWidget {
  const JmStatusChip({
    super.key,
    required this.label,
    required this.background,
    required this.foreground,
    this.icon,
    this.dense = false,
  });

  factory JmStatusChip.forStatus(DemandStatus status, {bool dense = false}) {
    return switch (status) {
      DemandStatus.reported => JmStatusChip(
          label: 'Reported',
          background: JanMaangColors.surfaceVariant,
          foreground: JanMaangColors.onSurfaceVariant,
          dense: dense,
        ),
      DemandStatus.verified => JmStatusChip(
          label: 'Under Review',
          background: JanMaangColors.warningContainer,
          foreground: JanMaangColors.onWarningContainer,
          icon: Icons.hourglass_top,
          dense: dense,
        ),
      DemandStatus.clustered => JmStatusChip(
          label: 'Clustered',
          background: JanMaangColors.secondaryFixed,
          foreground: JanMaangColors.onSecondaryFixed,
          icon: Icons.merge,
          dense: dense,
        ),
      DemandStatus.prioritised => JmStatusChip(
          label: 'Prioritised',
          background: JanMaangColors.primary,
          foreground: JanMaangColors.onPrimary,
          icon: Icons.trending_up,
          dense: dense,
        ),
      DemandStatus.funded => JmStatusChip(
          label: 'Funded',
          background: JanMaangColors.tertiaryFixed,
          foreground: JanMaangColors.onTertiaryFixed,
          icon: Icons.payments,
          dense: dense,
        ),
      DemandStatus.inProgress => JmStatusChip(
          label: 'In Progress',
          background: JanMaangColors.secondaryFixed,
          foreground: JanMaangColors.onSecondaryFixed,
          icon: Icons.construction,
          dense: dense,
        ),
      DemandStatus.citizenVerified => JmStatusChip(
          label: 'Funded & Fixed',
          background: JanMaangColors.tertiaryFixed,
          foreground: JanMaangColors.onTertiaryFixed,
          icon: Icons.verified,
          dense: dense,
        ),
    };
  }

  factory JmStatusChip.forSeverity(Severity severity, {bool dense = false}) {
    return switch (severity) {
      Severity.low => JmStatusChip(
          label: 'LOW PRIORITY',
          background: JanMaangColors.surfaceVariant,
          foreground: JanMaangColors.onSurfaceVariant,
          dense: dense,
        ),
      Severity.medium => JmStatusChip(
          label: 'MEDIUM PRIORITY',
          background: JanMaangColors.warningContainer,
          foreground: JanMaangColors.onWarningContainer,
          dense: dense,
        ),
      Severity.high => JmStatusChip(
          label: 'HIGH PRIORITY',
          background: JanMaangColors.errorContainer,
          foreground: JanMaangColors.onErrorContainer,
          icon: Icons.warning_amber_rounded,
          dense: dense,
        ),
      Severity.critical => JmStatusChip(
          label: 'CRITICAL',
          background: JanMaangColors.error,
          foreground: JanMaangColors.onError,
          icon: Icons.warning_rounded,
          dense: dense,
        ),
    };
  }

  /// A neutral outline chip, used for category tags.
  factory JmStatusChip.category(DemandCategory category, {bool dense = false}) =>
      JmStatusChip(
        label: category.label,
        background: JanMaangColors.surfaceContainerHigh,
        foreground: JanMaangColors.onSurfaceVariant,
        dense: dense,
      );

  final String label;
  final Color background;
  final Color foreground;
  final IconData? icon;
  final bool dense;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: dense ? 6 : Insets.sm,
        vertical: dense ? 2 : Insets.xs,
      ),
      decoration: BoxDecoration(
        color: background,
        borderRadius: BorderRadius.circular(Corners.sm),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: <Widget>[
          if (icon != null) ...<Widget>[
            Icon(icon, size: dense ? 11 : 13, color: foreground),
            const SizedBox(width: Insets.xs),
          ],
          Text(
            label,
            style: JanMaangTypography.labelMd.copyWith(color: foreground),
          ),
        ],
      ),
    );
  }
}
