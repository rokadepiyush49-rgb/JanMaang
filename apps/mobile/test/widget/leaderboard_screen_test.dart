import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:janmaang/features/leaderboard/presentation/leaderboard_screen.dart';
import 'package:janmaang/features/leaderboard/presentation/widgets/podium.dart';
import 'package:janmaang/features/leaderboard/domain/contributor.dart';

/// The podium once hard-coded a 210px frame around plinths whose content came
/// to 267px, so the top three cards shipped with RenderFlex overflow stripes.
/// These tests pump the podium through its whole growth animation at several
/// text scales, because a fixed frame only fails once the content grows.
void main() {
  Contributor at(int rank) => Contributor(
    id: 'c$rank',
    displayName: 'Contributor Number $rank',
    ward: 'Ward $rank · Yadgir Municipality',
    rank: rank,
    previousRank: rank + 1,
    reportsFiled: 12,
    reportsVerified: 7,
    demandsJoined: 20,
    verificationsGiven: 9,
  );

  Future<void> pump(
    WidgetTester tester,
    Widget child, {
    Size size = const Size(390, 2400),
    double textScale = 1,
  }) async {
    tester.view.physicalSize = size;
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.reset);

    await tester.pumpWidget(
      ProviderScope(
        child: MaterialApp(
          home: MediaQuery(
            data: MediaQueryData(textScaler: TextScaler.linear(textScale)),
            child: Scaffold(body: SingleChildScrollView(child: child)),
          ),
        ),
      ),
    );
  }

  /// Steps through the plinth growth animation frame by frame. An overflow at
  /// any intermediate size is just as visible to a user as one at rest.
  Future<void> stepThroughAnimation(WidgetTester tester) async {
    for (var i = 0; i < 24; i++) {
      await tester.pump(const Duration(milliseconds: 25));
      expect(tester.takeException(), isNull);
    }
    await tester.pump(const Duration(seconds: 2));
    expect(tester.takeException(), isNull);
  }

  testWidgets('podium lays out the top three without overflow', (tester) async {
    await pump(tester, Podium(top: <Contributor>[at(1), at(2), at(3)]));
    await stepThroughAnimation(tester);
  });

  testWidgets('podium survives large accessibility text', (tester) async {
    await pump(
      tester,
      Podium(top: <Contributor>[at(1), at(2), at(3)]),
      textScale: 1.6,
    );
    await stepThroughAnimation(tester);
  });

  testWidgets('podium copes with a partial top three', (tester) async {
    await pump(tester, Podium(top: <Contributor>[at(1), at(2)]));
    await stepThroughAnimation(tester);

    await pump(tester, Podium(top: <Contributor>[at(1)]));
    await stepThroughAnimation(tester);
  });

  testWidgets('the plinths keep their designed heights and baseline', (
    tester,
  ) async {
    await pump(tester, Podium(top: <Contributor>[at(1), at(2), at(3)]));
    await tester.pump(const Duration(seconds: 2));

    // The gradient blocks, in the 2 · 1 · 3 order they are laid out in. They
    // are the only full-width min-height boxes on the podium.
    final blocks = find.byWidgetPredicate(
      (w) =>
          w is ConstrainedBox &&
          w.constraints.minWidth == double.infinity &&
          w.constraints.minHeight > 0 &&
          w.constraints.minHeight.isFinite,
    );
    expect(blocks, findsNWidgets(3));

    final rects = <Rect>[
      for (var i = 0; i < 3; i++) tester.getRect(blocks.at(i)),
    ];

    // 132 for the winner in the middle, 96 and 74 either side — the design's
    // numbers, unchanged by the fix.
    expect(rects[0].height, 96);
    expect(rects[1].height, 132);
    expect(rects[2].height, 74);

    // All three sit on one baseline.
    expect(rects[1].bottom, rects[0].bottom);
    expect(rects[2].bottom, rects[0].bottom);
  });

  testWidgets('the whole leaderboard screen renders clean', (tester) async {
    tester.view.physicalSize = const Size(390, 2600);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.reset);

    await tester.pumpWidget(
      const ProviderScope(child: MaterialApp(home: LeaderboardScreen())),
    );
    await tester.pump();

    // The mock repository fakes 450ms of latency and the entrance animations
    // stagger behind it, so the podium is not on screen until well after the
    // first frame. Clear the loader first, then watch every frame of the
    // reveal — the stripes only ever showed up mid-animation and at rest.
    await tester.pump(const Duration(milliseconds: 600));
    expect(find.byType(Podium), findsOneWidget);
    await stepThroughAnimation(tester);

    expect(find.text('Leaderboard'), findsOneWidget);
    expect(find.text('#1'), findsOneWidget);
  });
}
