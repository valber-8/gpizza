import 'package:flutter/foundation.dart';
import '../models/menu_item.dart';
import '../services/api_service.dart';

class MenuProvider extends ChangeNotifier {
  final ApiService _api;

  MenuProvider(this._api);

  List<MenuItem> _items = [];
  List<String> _categories = [];
  bool _loading = false;
  String? _error;
  bool _loaded = false;

  List<MenuItem> get items => _items;
  List<String> get categories => _categories;
  bool get loading => _loading;
  String? get error => _error;

  Future<void> load({bool force = false}) async {
    if (_loaded && !force) return;

    _loading = true;
    _error = null;
    notifyListeners();

    try {
      final data = await _api.getMenu();
      _items = data.items;
      _categories = data.categories;
      _loaded = true;
    } on ApiException catch (e) {
      _error = e.message;
    } catch (e) {
      _error = 'Failed to load menu';
    } finally {
      _loading = false;
      notifyListeners();
    }
  }

  List<MenuItem> itemsByCategory(String category) {
    return _items.where((item) => item.category == category).toList()
      ..sort((a, b) => a.sortOrder.compareTo(b.sortOrder));
  }
}
