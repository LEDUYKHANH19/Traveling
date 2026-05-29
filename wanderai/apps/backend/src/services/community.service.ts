import type { CommunityFilters, CommunityReview } from '@wanderai/shared';
import { AppError } from '../utils/errors.js';
import { prisma } from './prisma.service.js';

export type CreateReviewInput = {
  userId: string;
  placeId: string;
  rating: number;
  text: string;
  photos: readonly string[];
  tags: readonly string[];
  nationality: string;
};

export const listCommunityReviews = async (
  filters: CommunityFilters,
): Promise<readonly CommunityReview[]> => {
  const reviews = await prisma.review.findMany({
    where: {
      nationality: filters.nationality,
      tags: filters.foodCategory ? { has: filters.foodCategory } : undefined,
      placeId: filters.city ? { contains: filters.city, mode: 'insensitive' } : undefined,
    },
    include: {
      user: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 50,
  });

  return reviews.map((review) => ({
    id: review.id,
    placeId: review.placeId,
    userId: review.userId,
    userName: review.user.email.split('@')[0] ?? 'Traveler',
    nationality: review.nationality,
    rating: review.rating,
    text: review.text,
    photos: review.photos,
    tags: review.tags,
    createdAt: review.createdAt.toISOString(),
  }));
};

export const createCommunityReview = async (input: CreateReviewInput): Promise<CommunityReview> => {
  const user = await prisma.user.findUnique({
    where: { clerkId: input.userId },
  });

  if (!user) {
    throw new AppError('USER_NOT_FOUND', 'Create a WanderAI profile before posting a review.', 404);
  }

  const review = await prisma.review.create({
    data: {
      userId: user.id,
      placeId: input.placeId,
      rating: input.rating,
      text: input.text,
      photos: [...input.photos],
      tags: [...input.tags],
      nationality: input.nationality,
    },
  });

  return {
    id: review.id,
    placeId: review.placeId,
    userId: review.userId,
    userName: user.email.split('@')[0] ?? 'Traveler',
    nationality: review.nationality,
    rating: review.rating,
    text: review.text,
    photos: review.photos,
    tags: review.tags,
    createdAt: review.createdAt.toISOString(),
  };
};

export const followTraveler = async (
  followerClerkId: string,
  followingUserId: string,
): Promise<{ followed: true }> => {
  const follower = await prisma.user.findUnique({
    where: { clerkId: followerClerkId },
  });

  if (!follower) {
    throw new AppError(
      'USER_NOT_FOUND',
      'Create a WanderAI profile before following travelers.',
      404,
    );
  }

  await prisma.follow.upsert({
    where: {
      followerId_followingId: {
        followerId: follower.id,
        followingId: followingUserId,
      },
    },
    update: {},
    create: {
      followerId: follower.id,
      followingId: followingUserId,
    },
  });

  return { followed: true };
};
