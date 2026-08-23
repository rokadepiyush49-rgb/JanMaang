import 'package:flutter/material.dart';

import '../../core/theme/app_spacing.dart';

/// Level-1 surface from the design system: pure `surface-container-lowest`,
/// a 1px `outline-variant` hairline, 12px radius, and **no shadow**.
class JmCard extends StatelessWidget {
  const JmCard({
    super.key,
    required this.child,
    this.padding = const EdgeInsets.all(Insets.md),
    this.onTap,
    this.borderColor,
    this.backgroundColor,
    this.radius = Corners.lg,
    this.emphasised = false,
    this.leadingAccent = false,
  });

  final Widget child;
  final EdgeInsetsGeometry padding;
  final VoidCallback? onTap;
  final Color? borderColor;
  final Color? backgroundColor;
  final double radius;

  /// Draws the card with a primary border and the level-2 ambient shadow —
  /// the treatment the top-ranked demand card gets on Home.
  final bool emphasised;

  /// The 4px primary bar down the left edge of the emphasised card.
  final bool leadingAccent;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final border = borderColor ??
        (emphasised ? scheme.primary : scheme.outlineVariant);

    final content = Padding(padding: padding, child: child);

    return DecoratedBox(
      decoration: BoxDecoration(
        color: backgroundColor ?? scheme.surfaceContainerLowest,
        borderRadius: BorderRadius.circular(radius),
        border: Border.all(color: border),
        boxShadow: emphasised
            ? const <BoxShadow>[
                BoxShadow(
                  color: Color(0x0A000000),
                  offset: Offset(0, 2),
                  blurRadius: 4,
                ),
              ]
            : null,
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(radius),
        child: Material(
          color: Colors.transparent,
          child: InkWell(
            onTap: onTap,
            child: leadingAccent
                ? Stack(
                    children: <Widget>[
                      Positioned(
                        left: 0,
                        top: 0,
                        bottom: 0,
                        child: Container(width: 4, color: scheme.primary),
                      ),
                      Padding(
                        padding: const EdgeInsets.only(left: 8),
                        child: content,
                      ),
                    ],
                  )
                : content,
          ),
        ),
      ),
    );
  }
}
