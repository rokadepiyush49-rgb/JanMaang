import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../core/routing/routes.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/janmaang_typography.dart';
import '../../../shared/widgets/jm_card.dart';
import '../../../shared/widgets/jm_logo.dart';

/// The Stitch "JanMaang — Mobile Landing Page".
///
/// Hero, the four-step explainer with its vertical connector, the pilot-impact
/// card, and the recently-fixed proof cards.
class OnboardingScreen extends StatelessWidget {
  const OnboardingScreen({super.key});

  static const _steps = <(String, String)>[
    ('You Speak', 'Report an issue by voice, in your own language.'),
    ('We Analyze', 'AI structures your complaint for officials.'),
    ('Government Funds', 'Prioritised issues receive budget allocation.'),
    ('Community Verifies', 'Citizens confirm the work is actually done.'),
  ];

  static const _recentlyFixed = <(IconData, String, String)>[
    (Icons.lightbulb, 'Streetlights Fixed', 'Ward 4, Main Road'),
    (Icons.water_drop, 'Handpump Restored', 'Ward 7, Kalyan Nagar'),
    (Icons.cleaning_services, 'Drains Desilted', 'Ward 1, Market Block'),
  ];

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;

    return Scaffold(
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(
            Insets.marginMobile,
            Insets.lg,
            Insets.marginMobile,
            Insets.xl,
          ),
          children: <Widget>[
            Center(
              child: JmLogo.full(
                width: MediaQuery.of(context).size.width.clamp(280.0, 420.0) * 0.62,
              ),
            ),
            const SizedBox(height: Insets.xl),

            Text(
              'Civic action starts here.',
              style: JanMaangTypography.displayLgMobile
                  .copyWith(color: scheme.onSurface),
            ),
            const SizedBox(height: Insets.md),
            Text(
              'No forms. No queues. Just your voice. Report local issues '
              'instantly and follow them through to a fix.',
              style: JanMaangTypography.bodyLg
                  .copyWith(color: scheme.onSurfaceVariant),
            ),
            const SizedBox(height: Insets.lg),
            FilledButton.icon(
              onPressed: () => context.goNamed(AppRoute.login.name),
              icon: const Icon(Icons.mic, size: 22),
              label: const Text("Tell us what's wrong"),
            ),
            const SizedBox(height: Insets.sm),
            Center(
              child: Text(
                'Voice or text • Available 24/7',
                style: JanMaangTypography.labelMd
                    .copyWith(color: scheme.onSurfaceVariant),
              ),
            ),

            const SizedBox(height: Insets.xl),
            Text(
              'How it works',
              style:
                  JanMaangTypography.headlineSm.copyWith(color: scheme.onSurface),
            ),
            const SizedBox(height: Insets.lg),
            for (var i = 0; i < _steps.length; i++)
              _Step(
                index: i + 1,
                title: _steps[i].$1,
                body: _steps[i].$2,
                isLast: i == _steps.length - 1,
              ),

            const SizedBox(height: Insets.lg),
            JmCard(
              backgroundColor: scheme.primary,
              borderColor: scheme.primary,
              padding: const EdgeInsets.all(Insets.lg),
              child: Row(
                children: <Widget>[
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: <Widget>[
                        Text(
                          'PILOT IMPACT',
                          style: JanMaangTypography.labelMd
                              .copyWith(color: scheme.primaryFixedDim),
                        ),
                        const SizedBox(height: Insets.sm),
                        Text(
                          '95%',
                          style: JanMaangTypography.displayLgMobile
                              .copyWith(color: scheme.onPrimary),
                        ),
                        Text(
                          'reduction in pending civic demands in Yadgir.',
                          style: JanMaangTypography.bodyMd
                              .copyWith(color: scheme.primaryFixed),
                        ),
                      ],
                    ),
                  ),
                  Icon(
                    Icons.insights,
                    size: 64,
                    color: scheme.onPrimary.withValues(alpha: 0.25),
                  ),
                ],
              ),
            ),

            const SizedBox(height: Insets.xl),
            Row(
              children: <Widget>[
                Icon(Icons.check_circle,
                    size: 20, color: scheme.onTertiaryContainer),
                const SizedBox(width: Insets.sm),
                Text(
                  'Recently Fixed',
                  style: JanMaangTypography.titleLg
                      .copyWith(color: scheme.onSurface),
                ),
              ],
            ),
            const SizedBox(height: Insets.md),
            for (final (icon, title, place) in _recentlyFixed) ...<Widget>[
              JmCard(
                padding: const EdgeInsets.all(Insets.md),
                child: Row(
                  children: <Widget>[
                    Container(
                      width: 40,
                      height: 40,
                      decoration: BoxDecoration(
                        color: scheme.tertiaryFixed,
                        shape: BoxShape.circle,
                      ),
                      child: Icon(icon,
                          size: 18, color: scheme.onTertiaryFixed),
                    ),
                    const SizedBox(width: Insets.md),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: <Widget>[
                          Text(
                            title,
                            style: JanMaangTypography.withWeight(
                              JanMaangTypography.bodyMd,
                              FontWeight.w600,
                            ).copyWith(color: scheme.onSurface),
                          ),
                          Text(
                            place,
                            style: JanMaangTypography.bodySm
                                .copyWith(color: scheme.onSurfaceVariant),
                          ),
                        ],
                      ),
                    ),
                    Icon(Icons.verified_user,
                        size: 18, color: scheme.onTertiaryContainer),
                  ],
                ),
              ),
              const SizedBox(height: Insets.sm),
            ],
          ],
        ),
      ),
    );
  }
}

class _Step extends StatelessWidget {
  const _Step({
    required this.index,
    required this.title,
    required this.body,
    required this.isLast,
  });

  final int index;
  final String title;
  final String body;
  final bool isLast;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;

    return IntrinsicHeight(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Column(
            children: <Widget>[
              Container(
                width: 32,
                height: 32,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: scheme.primaryContainer,
                  shape: BoxShape.circle,
                ),
                child: Text(
                  '$index',
                  style: JanMaangTypography.tabularNums
                      .copyWith(color: scheme.onPrimary),
                ),
              ),
              if (!isLast)
                Expanded(
                  child: Container(width: 2, color: scheme.outlineVariant),
                ),
            ],
          ),
          const SizedBox(width: Insets.md),
          Expanded(
            child: Padding(
              padding: EdgeInsets.only(bottom: isLast ? 0 : Insets.lg),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  Text(
                    title,
                    style: JanMaangTypography.withWeight(
                      JanMaangTypography.bodyLg,
                      FontWeight.w600,
                    ).copyWith(color: scheme.onSurface),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    body,
                    style: JanMaangTypography.bodyMd
                        .copyWith(color: scheme.onSurfaceVariant),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
