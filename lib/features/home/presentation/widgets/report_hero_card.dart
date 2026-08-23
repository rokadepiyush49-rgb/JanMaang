import 'package:flutter/material.dart';

import '../../../../core/theme/app_spacing.dart';
import '../../../../core/theme/janmaang_typography.dart';
import '../../../../shared/models/demand_enums.dart';
import '../../../../shared/widgets/jm_card.dart';

/// The hero card on Home: the question, the dominant voice action, and the
/// three secondary entry points beneath it.
class ReportHeroCard extends StatelessWidget {
  const ReportHeroCard({super.key, required this.onStartReport});

  final void Function(ReportChannel channel) onStartReport;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;

    return JmCard(
      padding: const EdgeInsets.all(Insets.lg),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Text(
            'What does your community need?',
            style:
                JanMaangTypography.headlineSm.copyWith(color: scheme.onSurface),
          ),
          const SizedBox(height: Insets.lg),
          _VoiceAction(onTap: () => onStartReport(ReportChannel.voice)),
          const SizedBox(height: Insets.md),
          Row(
            children: <Widget>[
              Expanded(
                child: _SecondaryAction(
                  icon: Icons.keyboard_outlined,
                  label: 'Type request',
                  onTap: () => onStartReport(ReportChannel.text),
                ),
              ),
              const SizedBox(width: Insets.md),
              Expanded(
                child: _SecondaryAction(
                  icon: Icons.photo_camera_outlined,
                  label: 'Upload photo',
                  onTap: () => onStartReport(ReportChannel.photo),
                ),
              ),
              const SizedBox(width: Insets.md),
              Expanded(
                child: _SecondaryAction(
                  icon: Icons.my_location_outlined,
                  label: 'Use location',
                  onTap: () => onStartReport(ReportChannel.location),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _VoiceAction extends StatelessWidget {
  const _VoiceAction({required this.onTap});

  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;

    return Semantics(
      button: true,
      label: 'Report by voice',
      child: Material(
        color: scheme.primary,
        borderRadius: BorderRadius.circular(Corners.lg),
        clipBehavior: Clip.antiAlias,
        child: InkWell(
          onTap: onTap,
          child: Container(
            width: double.infinity,
            constraints: const BoxConstraints(minHeight: 160),
            padding: const EdgeInsets.symmetric(vertical: Insets.lg),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: <Widget>[
                Icon(Icons.mic, size: 40, color: scheme.onPrimary),
                const SizedBox(height: Insets.sm),
                Text(
                  'Report by Voice',
                  style: JanMaangTypography.headlineSm
                      .copyWith(color: scheme.onPrimary),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _SecondaryAction extends StatelessWidget {
  const _SecondaryAction({
    required this.icon,
    required this.label,
    required this.onTap,
  });

  final IconData icon;
  final String label;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;

    return Material(
      color: scheme.surface,
      borderRadius: BorderRadius.circular(Corners.base),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(Corners.base),
        child: Container(
          decoration: BoxDecoration(
            border: Border.all(color: scheme.outlineVariant),
            borderRadius: BorderRadius.circular(Corners.base),
          ),
          padding: const EdgeInsets.symmetric(
            vertical: Insets.md,
            horizontal: Insets.xs,
          ),
          child: Column(
            children: <Widget>[
              Icon(icon, size: 22, color: scheme.onSurfaceVariant),
              const SizedBox(height: Insets.sm),
              Text(
                label,
                textAlign: TextAlign.center,
                style: JanMaangTypography.labelMd
                    .copyWith(color: scheme.onSurface),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
