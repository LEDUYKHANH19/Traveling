import type { DiscoverRequest, DiscoverResponse } from '@wanderai/shared';
import { apiRequest } from './api';

export const discoverPlaces = (
  request: DiscoverRequest,
  token?: string | null,
): Promise<DiscoverResponse> =>
  apiRequest<DiscoverResponse>('/api/v1/discover', {
    method: 'POST',
    body: request,
    token,
  });

export type PlaceDetail = {
  googlePlaceId: string;
  name: string;
  address: string;
  phone?: string;
  website?: string;
  photoUrl?: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  reviews: readonly {
    authorName: string;
    rating: number;
    text: string;
    timestamp: number;
  }[];
  communityReviews: readonly {
    id: string;
    rating: number;
    text: string;
    photos: readonly string[];
    tags: readonly string[];
    nationality: string;
    createdAt: string;
  }[];
};

export const getPlaceDetail = (placeId: string, token?: string | null): Promise<PlaceDetail> =>
  apiRequest<PlaceDetail>(`/api/v1/places/${encodeURIComponent(placeId)}`, { token });

export const savePlace = (
  body: { placeId: string; name: string; address: string; lat: number; lng: number },
  token?: string | null,
): Promise<unknown> =>
  apiRequest('/api/v1/places/save', {
    method: 'POST',
    body,
    token,
  });
