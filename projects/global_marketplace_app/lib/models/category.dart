class Category {
  final String id;
  final String name;
  final String description;
  final String imageUrl;
  final bool isFeaturedInMarketplace;
  final String storeId;
  final DateTime createdAt;
  final DateTime updatedAt;

  Category({
    required this.id,
    required this.name,
    required this.description,
    required this.imageUrl,
    required this.isFeaturedInMarketplace,
    required this.storeId,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Category.fromJson(Map<String, dynamic> json) {
    return Category(
      id: json['id'],
      name: json['name'],
      description: json['description'],
      imageUrl: json['imageUrl'],
      isFeaturedInMarketplace: json['isFeaturedInMarketplace'],
      storeId: json['storeId'],
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
    );
  }
}