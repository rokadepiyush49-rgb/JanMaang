import 'package:flutter/material.dart';

import '../../core/theme/app_spacing.dart';
import '../../core/theme/janmaang_typography.dart';
import 'jm_logo.dart';

/// The flat top app bar from the designs: surface background, a 1px bottom
/// hairline, no shadow. Either the JanMaang wordmark (tab screens) or a back
/// arrow with a screen title (transactional screens).
class JmAppBar extends StatelessWidget implements PreferredSizeWidget {
  const JmAppBar({
    super.key,
    this.title,
    this.showBrand = false,
    this.showBack = false,
    this.onBack,
    this.actions,
    this.hasUnreadNotifications = true,
    this.onNotifications,
    this.onProfile,
  });

  /// A transactional bar: back arrow, title, no trailing icons.
  const JmAppBar.task({
    super.key,
    required this.title,
    this.onBack,
    this.actions,
  })  : showBrand = false,
        showBack = true,
        hasUnreadNotifications = false,
        onNotifications = null,
        onProfile = null;

  final String? title;
  final bool showBrand;
  final bool showBack;
  final VoidCallback? onBack;
  final List<Widget>? actions;
  final bool hasUnreadNotifications;
  final VoidCallback? onNotifications;
  final VoidCallback? onProfile;

  @override
  Size get preferredSize => const Size.fromHeight(56);

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;

    return DecoratedBox(
      decoration: BoxDecoration(
        color: scheme.surface,
        border: Border(bottom: BorderSide(color: scheme.surfaceContainerHighest)),
      ),
      child: SafeArea(
        bottom: false,
        child: SizedBox(
          height: 56,
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: Insets.sm),
            child: Row(
              children: <Widget>[
                if (showBack)
                  IconButton(
                    icon: const Icon(Icons.arrow_back),
                    color: scheme.onSurface,
                    tooltip: 'Back',
                    onPressed: onBack ?? () => Navigator.of(context).maybePop(),
                  )
                else
                  const SizedBox(width: Insets.sm),
                if (showBrand)
                  const JmBrandRow()
                else if (title != null)
                  Expanded(
                    child: Text(
                      title!,
                      overflow: TextOverflow.ellipsis,
                      style: JanMaangTypography.titleLg
                          .copyWith(color: scheme.onSurface),
                    ),
                  ),
                const Spacer(),
                if (actions != null)
                  ...actions!
                else if (!showBack) ...<Widget>[
                  _NotificationButton(
                    hasUnread: hasUnreadNotifications,
                    onPressed: onNotifications,
                  ),
                  IconButton(
                    icon: const Icon(Icons.account_circle_outlined),
                    color: scheme.onSurfaceVariant,
                    tooltip: 'Profile',
                    onPressed: onProfile,
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _NotificationButton extends StatelessWidget {
  const _NotificationButton({required this.hasUnread, this.onPressed});

  final bool hasUnread;
  final VoidCallback? onPressed;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Stack(
      alignment: Alignment.center,
      children: <Widget>[
        IconButton(
          icon: const Icon(Icons.notifications_outlined),
          color: scheme.onSurfaceVariant,
          tooltip: 'Notifications',
          onPressed: onPressed,
        ),
        if (hasUnread)
          Positioned(
            top: 10,
            right: 10,
            child: Container(
              width: 8,
              height: 8,
              decoration: BoxDecoration(
                color: scheme.error,
                shape: BoxShape.circle,
              ),
            ),
          ),
      ],
    );
  }
}
