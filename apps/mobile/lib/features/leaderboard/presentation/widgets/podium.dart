import 'package:flutter/material.dart';

import '../../../../core/theme/app_spacing.dart';
import '../../../../core/theme/janmaang_colors.dart';
import '../../../../core/theme/janmaang_typography.dart';
import '../../../../core/theme/motion.dart';
import '../../domain/contributor.dart';

/// Top three, on a podium.
///
/// Ordered 2 · 1 · 3 across the screen so the winner sits centre and tallest,
/// which reads instantly without needing to parse the rank numbers.
class Podium extends StatelessWidget {
  const Podium({super.key, required this.top});

  final List<Contributor> top;

  @override
  Widget build(BuildContext context) {
    if (top.isEmpty) return const SizedBox.shrink();

    final first = top.first;
    final second = top.length > 1 ? top[1] : null;
    final third = top.length > 2 ? top[2] : null;

    // No fixed frame: the row takes the height of the tallest plinth, and
    // `CrossAxisAlignment.end` sits the three of them on a common baseline.
    // A hard-coded height here cannot survive a longer name or a larger text
    // scale — it just clips the winner, who is the one card that must read.
    return Row(
      crossAxisAlignment: CrossAxisAlignment.end,
      children: <Widget>[
        Expanded(
          child: second == null
              ? const SizedBox.shrink()
              : _Plinth(contributor: second, plinthHeight: 96, delay: 2),
        ),
        const SizedBox(width: Insets.sm),
        Expanded(
          child: _Plinth(contributor: first, plinthHeight: 132, delay: 0),
        ),
        const SizedBox(width: Insets.sm),
        Expanded(
          child: third == null
              ? const SizedBox.shrink()
              : _Plinth(contributor: third, plinthHeight: 74, delay: 3),
        ),
      ],
    );
  }
}

class _Plinth extends StatelessWidget {
  const _Plinth({
    required this.contributor,
    required this.plinthHeight,
    required this.delay,
  });

  final Contributor contributor;

  /// How tall the plinth block stands at rest. It is a floor the animation
  /// grows towards, never a ceiling on the rank and points inside it.
  final double plinthHeight;

  final int delay;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final isFirst = contributor.rank == 1;

    final medal = switch (contributor.rank) {
      1 => JanMaangColors.brandAmber,
      2 => const Color(0xFFA8B2BF),
      _ => JanMaangColors.brandOrange,
    };

    return Column(
      mainAxisSize: MainAxisSize.min,
      children: <Widget>[
        if (isFirst)
          Icon(Icons.emoji_events, size: 22, color: medal)
        else
          const SizedBox(height: 22),
        const SizedBox(height: Insets.xs),

        Container(
          width: isFirst ? 60 : 48,
          height: isFirst ? 60 : 48,
          alignment: Alignment.center,
          decoration: BoxDecoration(
            color: medal.withValues(alpha: 0.16),
            shape: BoxShape.circle,
            border: Border.all(color: medal, width: 2),
          ),
          child: Text(
            contributor.initials,
            style: JanMaangTypography.withWeight(
              JanMaangTypography.titleLg,
              FontWeight.w700,
            ).copyWith(color: scheme.onSurface, fontSize: isFirst ? 20 : 16),
          ),
        ),
        const SizedBox(height: Insets.sm),

        Text(
          contributor.displayName,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          textAlign: TextAlign.center,
          style: JanMaangTypography.withWeight(
            JanMaangTypography.bodySm,
            FontWeight.w600,
          ).copyWith(color: scheme.onSurface),
        ),
        Text(
          contributor.ward,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: JanMaangTypography.labelMd.copyWith(
            color: scheme.onSurfaceVariant,
            fontSize: 10,
          ),
        ),
        const SizedBox(height: Insets.sm),

        // The plinth grows into place, which is the one moment on this screen
        // where a flourish is warranted.
        TweenAnimationBuilder<double>(
          tween: Tween<double>(begin: 0, end: 1),
          duration: Motion.reduced(context)
              ? Duration.zero
              : Motion.slow + Motion.stagger * delay,
          curve: Motion.enter,
          // `minHeight`, not a fixed height: the block grows to the height the
          // design calls for, but never shrinks below the rank and points it
          // has to hold — including early in the reveal, and at large text
          // scales where those two lines alone are taller than the plinth.
          builder: (context, t, child) => ConstrainedBox(
            constraints: BoxConstraints(
              minWidth: double.infinity,
              minHeight: plinthHeight * t,
            ),
            child: child,
          ),
          child: Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: <Color>[
                  medal.withValues(alpha: 0.22),
                  medal.withValues(alpha: 0.06),
                ],
              ),
              borderRadius: const BorderRadius.vertical(
                top: Radius.circular(Corners.base),
              ),
              border: Border.all(color: medal.withValues(alpha: 0.4)),
            ),
            child: Padding(
              padding: const EdgeInsets.symmetric(vertical: Insets.sm),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: <Widget>[
                  Text(
                    '#${contributor.rank}',
                    style: JanMaangTypography.withWeight(
                      JanMaangTypography.titleLg,
                      FontWeight.w700,
                    ).copyWith(color: scheme.onSurface),
                  ),
                  JmAnimatedCount(
                    value: contributor.impactScore,
                    builder: (context, value) => Text(
                      '$value pts',
                      style: JanMaangTypography.labelMd.copyWith(
                        color: scheme.onSurfaceVariant,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }
}
