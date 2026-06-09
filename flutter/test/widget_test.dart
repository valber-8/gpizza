import 'package:flutter_test/flutter_test.dart';
import 'package:gpizza/app.dart';

void main() {
  testWidgets('App renders without crashing', (WidgetTester tester) async {
    await tester.pumpWidget(const GPizzaApp());
    expect(find.byType(GPizzaApp), findsOneWidget);
  });
}
