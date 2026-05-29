import type { CommunityReview } from '@wanderai/shared';
import { apiRequest } from './api';

export const getCommunityFeed = (
  filters: { nationality?: string; foodCategory?: string; city?: string },
  token?: string | null,
): Promise<{ reviews: readonly CommunityReview[] }> => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      params.set(key, value);
    }
  });
  const suffix = params.toString() ? `?${params.toString()}` : '';
  return apiRequest(`/api/v1/community${suffix}`, { token });
};

export const postReview = (
  review: {
    placeId: string;
    rating: number;
    text: string;
    photos: readonly string[];
    tags: readonly string[];
    nationality: string;
  },
  token?: string | null,
): Promise<CommunityReview> =>
  apiRequest('/api/v1/community/reviews', {
    method: 'POST',
    body: review,
    token,
  });
