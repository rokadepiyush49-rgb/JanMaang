import 'package:flutter/material.dart';

import '../../core/theme/app_spacing.dart';
import '../../core/theme/janmaang_typography.dart';
import '../../core/theme/motion.dart';
import '../../core/utils/formatters.dart';

/// A Community Pulse tile: a large tabular figure over a small caption.
class JmStatTile extends StatelessWidget {
  const JmStatTile({
    super.key,
    required this.value,
    required this.label,
    this.valueColor,
    this.backgroundColor,
    this.labelColor,
    this.compactValue = true,
  });

  final int value;
  final String label;
  final Color? valueColor;
  final Color? backgroundColor;
  final Color? labelColor;

  /// Formats 4281 as "4,281" using Indian digit grouping.
  final bool compactValue;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Semantics(
      label: '$label: ${Formatters.count(value)}',
      child: Container(
      padding: const EdgeInsets.all(Insets.md),
      decoration: BoxDecoration(
        color: backgroundColor ?? scheme.surfaceContainerLowest,
        borderRadius: BorderRadius.circular(Corners.base),
        border: Border.all(
          color: backgroundColor == null
              ? scheme.outlineVariant
              : Colors.transparent,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        mainAxisSize: MainAxisSize.min,
        children: <Widget>[
          // Counts up on first paint, so the impact figures land rather than
          // simply appear. Screen readers get the final value, not the count.
          // Flexible + scaleDown so the figure gives way before the tile
          // overflows: these sit in a fixed-aspect grid, and a long number or a
          // large text scale must shrink rather than blow the layout.
          Flexible(
            child: JmAnimatedCount(
              value: value,
              builder: (context, animated) => FittedBox(
                fit: BoxFit.scaleDown,
                alignment: Alignment.centerLeft,
                child: Text(
                  compactValue ? Formatters.count(animated) : '$animated',
                  maxLines: 1,
                  style: JanMaangTypography.statNumber.copyWith(
                    color: valueColor ?? scheme.primary,
                  ),
                ),
              ),
            ),
          ),
          const SizedBox(height: 2),
          Flexible(
            child: Text(
              label,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: JanMaangTypography.labelMd.copyWith(
                color: labelColor ?? scheme.onSurfaceVariant,
              ),
            ),
          ),
        ],
      ),
      ),
    );
  }
}
