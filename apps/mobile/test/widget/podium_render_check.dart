library;

import 'dart:io';
import 'dart:ui' as ui;

import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:janmaang/core/theme/app_theme.dart';
import 'package:janmaang/features/leaderboard/domain/contributor.dart';
import 'package:janmaang/features/leaderboard/presentation/widgets/podium.dart';

void main() {
  setUpAll(() async {
    for (final family in <String>['DMSans', 'Inter']) {
      final loader = FontLoader(family)
        ..addFont(
          File('assets/fonts/$family.ttf').readAsBytes().then(
            (b) => b.buffer.asByteData(),
          ),
        );
      await loader.load();
    }
  });

  Contributor at(int rank, String name, String ward) => Contributor(
    id: 'c$rank',
    displayName: name,
    ward: ward,
    rank: rank,
    previousRank: rank + 1,
    reportsFiled: 12,
    reportsVerified: 7,
    demandsJoined: 20,
    verificationsGiven: 9,
  );

  testWidgets('render the podium', (tester) async {
    tester.view.physicalSize = const Size(390 * 3, 520 * 3);
    tester.view.devicePixelRatio = 3;
    addTearDown(tester.view.reset);

    await tester.pumpWidget(
      ProviderScope(
        child: MaterialApp(
          theme: AppTheme.light,
          home: Scaffold(
            body: Padding(
              padding: const EdgeInsets.all(16),
              child: Align(
                alignment: Alignment.topCenter,
                child: RepaintBoundary(
                  key: const ValueKey<String>('shot'),
                  child: Podium(
                    top: <Contributor>[
                      at(1, 'Lakshmi Devi', 'Ward 12 · Yadgir'),
                      at(2, 'Ramesh Naik', 'Ward 4 · Yadgir'),
                      at(3, 'Sunita Rathod', 'Ward 9 · Yadgir'),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
    await tester.pump(const Duration(seconds: 2));
    expect(tester.takeException(), isNull);

    final boundary =
        tester.renderObject(find.byKey(const ValueKey<String>('shot')))
            as RenderRepaintBoundary;
    final image = await boundary.toImage(pixelRatio: 3);
    final bytes = await image.toByteData(format: ui.ImageByteFormat.png);
    File(
      const String.fromEnvironment('OUT', defaultValue: 'podium.png'),
    ).writeAsBytesSync(bytes!.buffer.asUint8List());
    // ignore: avoid_print
    print('WROTE ${bytes.lengthInBytes} bytes');
  });
}
