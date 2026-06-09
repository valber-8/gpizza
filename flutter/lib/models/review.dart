class Review {
  final String reviewId;
  final String customerName;
  final int rating;
  final String comment;
  final String createdAt;
  final String status;

  const Review({
    required this.reviewId,
    required this.customerName,
    required this.rating,
    required this.comment,
    required this.createdAt,
    required this.status,
  });

  factory Review.fromJson(Map<String, dynamic> json) {
    return Review(
      reviewId: json['review_id'] as String? ?? '',
      customerName: json['customer_name'] as String? ?? 'Anônimo',
      rating: (json['rating'] as num? ?? 5).toInt(),
      comment: json['comment'] as String? ?? '',
      createdAt: json['created_at'] as String? ?? '',
      status: json['status'] as String? ?? 'approved',
    );
  }
}
