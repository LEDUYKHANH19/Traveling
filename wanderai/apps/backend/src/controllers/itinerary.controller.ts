import { itineraryRequestSchema } from '@wanderai/shared';
import { generateItinerary } from '../services/itinerary.service.js';
import { asyncHandler } from '../utils/async-handler.js';
import { sendSuccess } from '../utils/http-response.js';

export const postGenerateItinerary = asyncHandler(async (req, res) => {
  const body = itineraryRequestSchema.parse(req.body);
  const plan = await generateItinerary({
    ...body,
    userId: req.auth?.userId ?? body.userId,
  });
  sendSuccess(res, plan);
});
