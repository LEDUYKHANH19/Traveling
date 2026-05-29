import type { ItineraryPlan, ItineraryRequest } from '@wanderai/shared';
import { apiRequest } from './api';

export const generateItinerary = (
  request: ItineraryRequest,
  token?: string | null,
): Promise<ItineraryPlan> =>
  apiRequest<ItineraryPlan>('/api/v1/itineraries/generate', {
    method: 'POST',
    body: request,
    token,
  });
