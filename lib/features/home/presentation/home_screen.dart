import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/config/app_config.dart';
import '../../../core/providers.dart';
import '../../../core/routing/routes.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/janmaang_typography.dart';
import '../../../core/theme/motion.dart';
import '../../../shared/models/demand_enums.dart';
import '../../../shared/models/provenance.dart';
import '../../../shared/widgets/jm_app_bar.dart';
import '../../../shared/widgets/jm_location_chip.dart';
import '../../../shared/widgets/jm_photo_gallery.dart';
import '../../../shared/widgets/jm_provenance_badge.dart';
import '../../../shared/widgets/jm_section_header.dart';
import '../../../shared/widgets/jm_stat_tile.dart';
import '../../../shared/widgets/jm_states.dart';
import '../../demands/domain/demands_repository.dart';
import '../../demands/presentation/widgets/demand_list_card.dart';
import 'home_providers.dart';
import 'widgets/home_map_preview.dart';
import 'widgets/report_hero_card.dart';

/// Citizen Home.
///
/// Keeps the Stitch information architecture — greeting, location, the hero
/// reporting card, Community Pulse, Near You — and adds the live OpenStreetMap
/// preview, animated impact figures, the infrastructure gallery, and a
/// provenance line so no figure on this screen appears without its source.
///
/// The list scrolls edge to edge and each section supplies its own horizontal
/// padding, which lets the gallery bleed to the screen edges while everything
/// else stays on the margin.
class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  static const _gutter = EdgeInsets.symmetric(horizontal: Insets.marginMobile);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(currentUserProvider);
    final pulse = ref.watch(communityPulseProvider);
    final nearby = ref.watch(nearbyDemandsProvider);
    final isWide = MediaQuery.of(context).size.width >= Breakpoints.medium;

    return Scaffold(
      appBar: JmAppBar(
        showBrand: true,
        onProfile: () => context.pushNamed(AppRoute.profile.name),
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(communityPulseProvider);
          ref.invalidate(nearbyDemandsProvider);
          await ref.read(communityPulseProvider.future);
        },
        child: ListView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.only(top: Insets.lg, bottom: Insets.xl * 2),
          children: <Widget>[
            Padding(
              padding: _gutter,
              child: JmEnter(child: _Greeting(name: user?.greetingName ?? '')),
            ),
            const SizedBox(height: Insets.md),
            Padding(
              padding: _gutter,
              child: JmEnter(
                index: 1,
                child: JmLocationChip(
                  label: user?.locationLabel.isNotEmpty == true
                      ? user!.locationLabel
                      : '${AppConfig.defaultDistrict}, ${AppConfig.defaultState}',
                  onTap: () => context.pushNamed(AppRoute.map.name),
                ),
              ),
            ),
            const SizedBox(height: Insets.lg),

            Padding(
              padding: _gutter,
              // Deliberately not IntrinsicHeight: the pulse panel contains a
              // shrink-wrapped GridView, and a viewport cannot report an
              // intrinsic height. Top-aligning the two columns gives the same
              // bento reading without asking for a measurement Flutter cannot
              // provide.
              child: isWide
                  ? Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: <Widget>[
                        Expanded(
                          flex: 8,
                          child: JmEnter(
                            index: 2,
                            child: ReportHeroCard(
                              onStartReport: (c) => _startReport(context, c),
                            ),
                          ),
                        ),
                        const SizedBox(width: Insets.lg),
                        Expanded(
                          flex: 4,
                          child: JmEnter(
                            index: 3,
                            child: _CommunityPulse(pulse: pulse),
                          ),
                        ),
                      ],
                    )
                  : Column(
                      children: <Widget>[
                        JmEnter(
                          index: 2,
                          child: ReportHeroCard(
                            onStartReport: (c) => _startReport(context, c),
                          ),
                        ),
                        const SizedBox(height: Insets.lg),
                        JmEnter(index: 3, child: _CommunityPulse(pulse: pulse)),
                      ],
                    ),
            ),

            const SizedBox(height: Insets.xl),

            Padding(
              padding: _gutter,
              child: JmSectionHeader(
                title: 'Near You',
                icon: Icons.near_me_outlined,
                actionLabel: 'Open map',
                onAction: () => context.pushNamed(AppRoute.map.name),
              ),
            ),
            const SizedBox(height: Insets.md),

            Padding(
              padding: _gutter,
              child: JmEnter(
                index: 4,
                child: SizedBox(
                  height: 200,
                  child: HomeMapPreview(
                    onTap: () => context.pushNamed(AppRoute.map.name),
                  ),
                ),
              ),
            ),
            const SizedBox(height: Insets.md),

            Padding(
              padding: _gutter,
              child: nearby.when(
                loading: () => const Padding(
                  padding: EdgeInsets.symmetric(vertical: Insets.xl),
                  child: JmInlineLoader(message: 'Loading demands near you…'),
                ),
                error: (error, _) => JmErrorView(
                  error: error,
                  onRetry: () => ref.invalidate(nearbyDemandsProvider),
                ),
                data: (demands) {
                  if (demands.isEmpty) {
                    return JmEmptyState(
                      icon: Icons.explore_off_outlined,
                      title: 'Nothing reported near you yet',
                      message:
                          'Be the first to tell us what your community needs.',
                      actionLabel: 'Report a need',
                      onAction: () =>
                          _startReport(context, ReportChannel.voice),
                    );
                  }
                  return Column(
                    children: <Widget>[
                      for (var i = 0; i < demands.length; i++) ...<Widget>[
                        JmEnter(
                          index: 5 + i,
                          child: DemandListCard(
                            demand: demands[i],
                            onTap: () => context.pushNamed(
                              AppRoute.demandDetail.name,
                              pathParameters: <String, String>{
                                'id': demands[i].id,
                              },
                            ),
                          ),
                        ),
                        const SizedBox(height: Insets.sm),
                      ],
                    ],
                  );
                },
              ),
            ),

            const SizedBox(height: Insets.xl),

            const Padding(
              padding: _gutter,
              child: JmSectionHeader(
                title: 'What gets built',
                icon: Icons.photo_library_outlined,
              ),
            ),
            const SizedBox(height: Insets.md),
            // Bleeds past the gutter deliberately.
            const JmPhotoGallery(),

            const SizedBox(height: Insets.xl),
            const Padding(padding: _gutter, child: _HomeFooter()),
          ],
        ),
      ),
    );
  }

  void _startReport(BuildContext context, ReportChannel channel) {
    context.pushNamed(
      AppRoute.report.name,
      queryParameters: <String, String>{'channel': channel.name},
    );
  }
}

class _Greeting extends StatelessWidget {
  const _Greeting({required this.name});

  final String name;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: <Widget>[
        Text(
          name.isEmpty ? 'Namaste 👋' : 'Namaste, $name 👋',
          style: JanMaangTypography.displayLgMobile
              .copyWith(color: scheme.onSurface),
        ),
        const SizedBox(height: Insets.sm),
        Text(
          'Make your community heard.',
          style: JanMaangTypography.headlineSm
              .copyWith(color: scheme.onSurfaceVariant),
        ),
      ],
    );
  }
}

/// The 2×2 impact grid. Figures count up on first paint.
class _CommunityPulse extends StatelessWidget {
  const _CommunityPulse({required this.pulse});

  final AsyncValue<CommunityPulse> pulse;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: <Widget>[
        const JmSectionHeader(
          title: 'Community Pulse',
          icon: Icons.insights_outlined,
        ),
        const SizedBox(height: Insets.md),
        pulse.when(
          loading: () => const SizedBox(
            height: 180,
            child: JmInlineLoader(message: 'Counting your district…'),
          ),
          error: (error, _) => SizedBox(
            height: 180,
            child: JmErrorView(error: error),
          ),
          data: (data) => GridView.count(
            crossAxisCount: 2,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            crossAxisSpacing: Insets.md,
            mainAxisSpacing: Insets.md,
            childAspectRatio: 1.6,
            children: <Widget>[
              JmStatTile(
                value: data.activeDemands,
                label: 'Active Demands',
                valueColor: scheme.primary,
              ),
              JmStatTile(
                value: data.peopleAffected,
                label: 'People Affected',
                valueColor: scheme.secondary,
              ),
              JmStatTile(
                value: data.underReview,
                label: 'Under Review',
                valueColor: scheme.onTertiaryContainer,
              ),
              JmStatTile(
                value: data.funded,
                label: 'Funded',
                backgroundColor: scheme.tertiaryFixed,
                valueColor: scheme.onTertiaryFixed,
                labelColor: scheme.onTertiaryFixed,
              ),
            ],
          ),
        ),
      ],
    );
  }
}

/// Closing line, plus the provenance stamp and a route into the methodology.
///
/// The figures above are modelled, and saying so here — rather than in a
/// footnote nobody opens — is the point.
class _HomeFooter extends StatelessWidget {
  const _HomeFooter();

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;

    return Column(
      children: <Widget>[
        Text(
          'Every demand is public. Every rupee is traceable.',
          textAlign: TextAlign.center,
          style:
              JanMaangTypography.bodySm.copyWith(color: scheme.onSurfaceVariant),
        ),
        const SizedBox(height: Insets.sm),
        const JmProvenanceBadge(
          stamp: ProvenanceStamp(
            provenance: Provenance.syntheticRural,
            precision: LocationPrecision.approximateCentroid,
          ),
        ),
        const SizedBox(height: Insets.sm),
        TextButton.icon(
          onPressed: () => context.pushNamed(AppRoute.method.name),
          icon: const Icon(Icons.science_outlined, size: 16),
          label: const Text('Methodology & data sources'),
        ),
      ],
    );
  }
}
