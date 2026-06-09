import { apiGet, apiPost } from './client';
import type { Review, SubmitReviewRequest } from '../types';

export const fetchReviews = () => apiGet<Review[]>('reviews');

export const submitReview = (data: SubmitReviewRequest) =>
  apiPost<{ review_id: string }>({ ...data, action: 'review' });
