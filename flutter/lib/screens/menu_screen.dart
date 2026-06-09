import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../l10n/app_localizations.dart';
import '../providers/menu_provider.dart';
import '../widgets/menu_item_card.dart';

class MenuScreen extends StatefulWidget {
  const MenuScreen({super.key});

  @override
  State<MenuScreen> createState() => _MenuScreenState();
}

class _MenuScreenState extends State<MenuScreen> {
  String? _selectedCategory;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<MenuProvider>().load();
    });
  }

  @override
  Widget build(BuildContext context) {
    final l = AppLocalizations.of(context);

    return Scaffold(
      appBar: AppBar(title: Text(l.menuTitle)),
      body: Consumer<MenuProvider>(
        builder: (context, menu, _) {
          if (menu.loading) {
            return const Center(child: CircularProgressIndicator());
          }

          if (menu.error != null) {
            return Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.error_outline, size: 48, color: Colors.red),
                  const SizedBox(height: 12),
                  Text(menu.error!, style: const TextStyle(color: Colors.red)),
                  const SizedBox(height: 12),
                  FilledButton.icon(
                    onPressed: () => menu.load(force: true),
                    icon: const Icon(Icons.refresh),
                    label: Text(l.tryAgain),
                  ),
                ],
              ),
            );
          }

          if (menu.items.isEmpty) {
            return Center(child: Text(l.noItemsAvailable));
          }

          final selected = _selectedCategory ?? menu.categories.firstOrNull;
          final filteredItems =
              selected != null ? menu.itemsByCategory(selected) : menu.items;

          return Column(
            children: [
              _CategoryChips(
                categories: menu.categories,
                selected: selected,
                onSelect: (cat) => setState(() => _selectedCategory = cat),
              ),
              Expanded(
                child: GridView.builder(
                  padding: const EdgeInsets.all(12),
                  gridDelegate:
                      const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    mainAxisSpacing: 12,
                    crossAxisSpacing: 12,
                    childAspectRatio: 0.72,
                  ),
                  itemCount: filteredItems.length,
                  itemBuilder: (context, index) =>
                      MenuItemCard(item: filteredItems[index]),
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}

class _CategoryChips extends StatelessWidget {
  final List<String> categories;
  final String? selected;
  final ValueChanged<String> onSelect;

  const _CategoryChips({
    required this.categories,
    required this.selected,
    required this.onSelect,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 56,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        itemCount: categories.length,
        separatorBuilder: (_, __) => const SizedBox(width: 8),
        itemBuilder: (context, index) {
          final category = categories[index];
          final isSelected = category == selected;
          return FilterChip(
            label: Text(category),
            selected: isSelected,
            onSelected: (_) => onSelect(category),
          );
        },
      ),
    );
  }
}
