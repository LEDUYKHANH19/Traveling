import { reviewCreateSchema } from '@wanderai/shared';
import { z } from 'zod';
import {
  createCommunityReview,
  followTraveler,
  listCommunityReviews,
} from '../services/community.service.js';
import { AppError } from '../utils/errors.js';
import { asyncHandler } from '../utils/async-handler.js';
import { sendSuccess } from '../utils/http-response.js';

const filtersSchema = z.object({
  nationality: z.string().optional(),
  foodCategory: z.string().optional(),
  city: z.string().optional(),
});

export const getCommunityFeed = asyncHandler(async (req, res) => {
  const filters = filtersSchema.parse(req.query);
  const reviews = await listCommunityReviews(filters);
  sendSuccess(res, { reviews });
});

export const postCommunityReview = asyncHandler(async (req, res) => {
  if (!req.auth?.userId) {
    throw new AppError('UNAUTHORIZED', 'Sign in to post a review.', 401);
  }
  const body = reviewCreateSchema.parse(req.body);
  const review = await createCommunityReview({
    userId: req.auth.userId,
    placeId: body.placeId,
    rating: body.rating,
    text: body.text,
    photos: body.photos,
    tags: body.tags,
    nationality: body.nationality,
  });
  sendSuccess(res, review, 201);
});

export const postFollowTraveler = asyncHandler(async (req, res) => {
  if (!req.auth?.userId) {
    throw new AppError('UNAUTHORIZED', 'Sign in to follow travelers.', 401);
  }
  const body = z.object({ userId: z.string().min(1) }).parse(req.body);
  const result = await followTraveler(req.auth.userId, body.userId);
  sendSuccess(res, result);
});
