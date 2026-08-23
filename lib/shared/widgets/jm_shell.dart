import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import 'jm_bottom_nav.dart';

/// Holds the four tab destinations and the bottom navigation.
///
/// The Report destination is not a tab in the usual sense: the design treats
/// it as a dominant action, so selecting it pushes the transactional report
/// flow on top of the shell rather than swapping the body.
class JmShell extends StatelessWidget {
  const JmShell({super.key, required this.navigationShell});

  final StatefulNavigationShell navigationShell;

  static const reportIndex = 2;

  @override
  Widget build(BuildContext context) {
    // The shell holds three branches; index 2 in the bar is the report action,
    // so bar indices above it map one lower onto the branches.
    final barIndex = navigationShell.currentIndex >= reportIndex
        ? navigationShell.currentIndex + 1
        : navigationShell.currentIndex;

    return Scaffold(
      body: navigationShell,
      bottomNavigationBar: JmBottomNav(
        currentIndex: barIndex,
        onDestinationSelected: (index) => _onSelected(context, index),
      ),
    );
  }

  void _onSelected(BuildContext context, int index) {
    if (index == reportIndex) {
      context.push('/report');
      return;
    }
    final branch = index > reportIndex ? index - 1 : index;
    navigationShell.goBranch(
      branch,
      initialLocation: branch == navigationShell.currentIndex,
    );
  }
}
