class Store {
  final String id;
  final String name;
  final String slug;
  final String? description;
  final String logoUrl;
  final bool isFeaturedInMarketplace;
  final DateTime createdAt;
  final DateTime updatedAt;

  Store({
    required this.id,
    required this.name,
    required this.slug,
    this.description,
    required this.logoUrl,
    required this.isFeaturedInMarketplace,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Store.fromJson(Map<String, dynamic> json) {
    return Store(
      id: json['id'],
      name: json['name'],
      slug: json['slug'],
      description: json['description'],
      logoUrl: json['logoUrl'],
      isFeaturedInMarketplace: json['isFeaturedInMarketplace'],
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
    );
  }
}