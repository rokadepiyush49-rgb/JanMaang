import 'package:flutter/material.dart';

import '../../core/theme/app_spacing.dart';
import '../../core/theme/janmaang_typography.dart';

/// The mobile bottom navigation from the Stitch designs.
///
/// Four destinations — Home · Track · Report · Ledger — where Report is a
/// raised primary circle that overlaps the bar with a 4px surface-coloured
/// ring. The selected destination becomes a `primary-container` pill with a
/// filled icon; the rest sit in `on-surface-variant` with outlined icons.
class JmBottomNav extends StatelessWidget {
  const JmBottomNav({
    super.key,
    required this.currentIndex,
    required this.onDestinationSelected,
  });

  final int currentIndex;
  final ValueChanged<int> onDestinationSelected;

  static const destinations = <JmNavDestination>[
    JmNavDestination(
      label: 'Home',
      icon: Icons.home_outlined,
      selectedIcon: Icons.home,
    ),
    JmNavDestination(
      label: 'Track',
      icon: Icons.analytics_outlined,
      selectedIcon: Icons.analytics,
    ),
    JmNavDestination(
      label: 'Report',
      icon: Icons.mic_none,
      selectedIcon: Icons.mic,
      raised: true,
    ),
    JmNavDestination(
      label: 'Ranks',
      icon: Icons.emoji_events_outlined,
      selectedIcon: Icons.emoji_events,
    ),
    JmNavDestination(
      label: 'Ledger',
      icon: Icons.receipt_long_outlined,
      selectedIcon: Icons.receipt_long,
    ),
  ];

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final bottomInset = MediaQuery.of(context).padding.bottom;

    return Container(
      decoration: BoxDecoration(
        color: scheme.surface,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(Corners.xl)),
        border: Border(top: BorderSide(color: scheme.outlineVariant)),
        boxShadow: const <BoxShadow>[
          BoxShadow(
            color: Color(0x14000000),
            offset: Offset(0, -4),
            blurRadius: 16,
          ),
        ],
      ),
      // The raised Report button overflows the top edge of the bar.
      child: Padding(
        padding: EdgeInsets.only(
          top: Insets.sm,
          bottom: Insets.sm + bottomInset,
          left: Insets.sm,
          right: Insets.sm,
        ),
        // Each destination takes an equal share. With five of them plus the
        // raised action, intrinsic widths overflow on a narrow phone.
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.end,
          children: <Widget>[
            for (var i = 0; i < destinations.length; i++)
              Expanded(
                child: _NavItem(
                  destination: destinations[i],
                  selected: i == currentIndex,
                  onTap: () => onDestinationSelected(i),
                ),
              ),
          ],
        ),
      ),
    );
  }
}

class JmNavDestination {
  const JmNavDestination({
    required this.label,
    required this.icon,
    required this.selectedIcon,
    this.raised = false,
  });

  final String label;
  final IconData icon;
  final IconData selectedIcon;

  /// Report is drawn as an elevated circle above the bar.
  final bool raised;
}

class _NavItem extends StatelessWidget {
  const _NavItem({
    required this.destination,
    required this.selected,
    required this.onTap,
  });

  final JmNavDestination destination;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;

    if (destination.raised) {
      return Semantics(
        button: true,
        selected: selected,
        label: destination.label,
        child: InkResponse(
          onTap: onTap,
          radius: 40,
          child: SizedBox(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: <Widget>[
                Transform.translate(
                  offset: const Offset(0, -18),
                  child: Container(
                    width: 56,
                    height: 56,
                    decoration: BoxDecoration(
                      color: scheme.primary,
                      shape: BoxShape.circle,
                      border: Border.all(color: scheme.surface, width: 4),
                      boxShadow: const <BoxShadow>[
                        BoxShadow(
                          color: Color(0x2600152A),
                          offset: Offset(0, 4),
                          blurRadius: 12,
                        ),
                      ],
                    ),
                    child: Icon(
                      destination.selectedIcon,
                      color: scheme.onPrimary,
                      size: 26,
                    ),
                  ),
                ),
                Transform.translate(
                  offset: const Offset(0, -14),
                  child: Text(
                    destination.label,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: JanMaangTypography.labelMd.copyWith(
                      color: selected ? scheme.primary : scheme.onSurfaceVariant,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      );
    }

    final foreground =
        selected ? scheme.onPrimaryContainer : scheme.onSurfaceVariant;

    return Semantics(
      button: true,
      selected: selected,
      label: destination.label,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(Corners.xl),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 180),
          padding: const EdgeInsets.symmetric(
            horizontal: Insets.sm,
            vertical: Insets.xs,
          ),
          decoration: BoxDecoration(
            color: selected ? scheme.primaryContainer : Colors.transparent,
            borderRadius: BorderRadius.circular(Corners.xl),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: <Widget>[
              Icon(
                selected ? destination.selectedIcon : destination.icon,
                size: 24,
                color: foreground,
              ),
              const SizedBox(height: Insets.xs),
              Text(
                destination.label,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: JanMaangTypography.labelMd.copyWith(color: foreground),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
