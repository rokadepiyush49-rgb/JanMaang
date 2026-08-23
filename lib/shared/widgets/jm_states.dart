import 'package:flutter/material.dart';

import '../../core/errors/failure.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/theme/janmaang_typography.dart';

/// Inline loading banner — "Finding similar requests in this area…" — a
/// spinning icon beside a body-sm line, exactly as the report screen shows it.
class JmInlineLoader extends StatelessWidget {
  const JmInlineLoader({super.key, required this.message});

  final String message;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: Insets.md),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: <Widget>[
          SizedBox(
            width: 18,
            height: 18,
            child: CircularProgressIndicator(
              strokeWidth: 2,
              color: scheme.onSurfaceVariant,
            ),
          ),
          const SizedBox(width: Insets.sm),
          Flexible(
            child: Text(
              message,
              style: JanMaangTypography.bodySm
                  .copyWith(color: scheme.onSurfaceVariant),
            ),
          ),
        ],
      ),
    );
  }
}

/// Full-surface loader for a screen that has nothing to show yet.
class JmLoader extends StatelessWidget {
  const JmLoader({super.key, this.message});

  final String? message;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: <Widget>[
          CircularProgressIndicator(color: scheme.primary),
          if (message != null) ...<Widget>[
            const SizedBox(height: Insets.md),
            Text(
              message!,
              style: JanMaangTypography.bodySm
                  .copyWith(color: scheme.onSurfaceVariant),
            ),
          ],
        ],
      ),
    );
  }
}

/// Empty state — a muted icon, a title and a supporting line, optionally with
/// the action that would fill it.
class JmEmptyState extends StatelessWidget {
  const JmEmptyState({
    super.key,
    required this.icon,
    required this.title,
    required this.message,
    this.actionLabel,
    this.onAction,
  });

  final IconData icon;
  final String title;
  final String message;
  final String? actionLabel;
  final VoidCallback? onAction;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(Insets.lg),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: <Widget>[
            Container(
              width: 64,
              height: 64,
              decoration: BoxDecoration(
                color: scheme.surfaceContainerHigh,
                shape: BoxShape.circle,
              ),
              child: Icon(icon, size: 30, color: scheme.onSurfaceVariant),
            ),
            const SizedBox(height: Insets.md),
            Text(
              title,
              textAlign: TextAlign.center,
              style: JanMaangTypography.titleLg.copyWith(color: scheme.onSurface),
            ),
            const SizedBox(height: Insets.xs),
            Text(
              message,
              textAlign: TextAlign.center,
              style: JanMaangTypography.bodySm
                  .copyWith(color: scheme.onSurfaceVariant),
            ),
            if (actionLabel != null) ...<Widget>[
              const SizedBox(height: Insets.lg),
              FilledButton(
                onPressed: onAction,
                style: FilledButton.styleFrom(
                  minimumSize: const Size(180, 48),
                ),
                child: Text(actionLabel!),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

/// Error state. Shows the human sentence carried by a [Failure] and offers a
/// retry; anything else is reported with the generic line.
class JmErrorView extends StatelessWidget {
  const JmErrorView({super.key, required this.error, this.onRetry});

  final Object error;
  final VoidCallback? onRetry;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final message = error is Failure
        ? (error as Failure).message
        : 'Something went wrong. Please try again.';

    return Center(
      child: Padding(
        padding: const EdgeInsets.all(Insets.lg),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: <Widget>[
            Container(
              width: 64,
              height: 64,
              decoration: BoxDecoration(
                color: scheme.errorContainer,
                shape: BoxShape.circle,
              ),
              child: Icon(
                Icons.error_outline,
                size: 30,
                color: scheme.onErrorContainer,
              ),
            ),
            const SizedBox(height: Insets.md),
            Text(
              message,
              textAlign: TextAlign.center,
              style: JanMaangTypography.bodyMd.copyWith(color: scheme.onSurface),
            ),
            if (onRetry != null) ...<Widget>[
              const SizedBox(height: Insets.lg),
              OutlinedButton.icon(
                onPressed: onRetry,
                icon: const Icon(Icons.refresh, size: 18),
                label: const Text('Try again'),
                style: OutlinedButton.styleFrom(
                  minimumSize: const Size(160, 48),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
