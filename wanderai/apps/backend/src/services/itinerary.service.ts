import type {
  ItineraryDay,
  ItineraryPlan,
  ItineraryRequest,
  ItinerarySlot,
} from '@wanderai/shared';
import { v4 as uuid } from 'uuid';
import { logUnknownError } from '../utils/logger.js';
import { textSearchPlaceCandidates } from './google-places.service.js';
import { generateAiItinerary } from './openai.service.js';
import { prisma } from './prisma.service.js';

const fallbackPlan = (request: ItineraryRequest): ItineraryPlan => {
  const days: ItineraryDay[] = Array.from({ length: request.days }, (_, dayIndex) => {
    const day = dayIndex + 1;
    const slots: ItinerarySlot[] = [
      {
        id: uuid(),
        day,
        startTime: '09:00',
        endTime: '11:00',
        title: `${request.destination} neighborhood walk`,
        description: `Start with a low-pressure walk tuned for ${request.travelStyle} travelers.`,
        estimatedSpend:
          request.budgetRange === 'premium' ? 45 : request.budgetRange === 'midrange' ? 20 : 8,
      },
      {
        id: uuid(),
        day,
        startTime: '12:00',
        endTime: '14:00',
        title: 'Local lunch stop',
        description: 'Pick a busy local restaurant with strong recent reviews.',
        estimatedSpend:
          request.budgetRange === 'premium' ? 60 : request.budgetRange === 'midrange' ? 25 : 10,
      },
      {
        id: uuid(),
        day,
        startTime: '16:00',
        endTime: '18:30',
        title: 'Signature attraction',
        description: 'Anchor the afternoon around one iconic place plus nearby hidden streets.',
        estimatedSpend:
          request.budgetRange === 'premium' ? 80 : request.budgetRange === 'midrange' ? 35 : 12,
      },
    ];
    return {
      day,
      title: `Day ${day}`,
      slots,
      totalEstimatedSpend: slots.reduce((total, slot) => total + slot.estimatedSpend, 0),
    };
  });
  return {
    id: uuid(),
    destination: request.destination,
    days,
    budgetRange: request.budgetRange,
    totalEstimatedSpend: days.reduce((total, day) => total + day.totalEstimatedSpend, 0),
  };
};

export const generateItinerary = async (request: ItineraryRequest): Promise<ItineraryPlan> => {
  const plan = (await generateAiItinerary(request)) ?? fallbackPlan(request);

  const enrichedDays = await Promise.all(
    plan.days.map(async (day) => {
      const slots = await Promise.all(
        day.slots.map(async (slot) => {
          const places = await textSearchPlaceCandidates(`${slot.title} ${request.destination}`);
          const place = places[0];
          return place
            ? {
                ...slot,
                place: {
                  id: place.googlePlaceId,
                  googlePlaceId: place.googlePlaceId,
                  name: place.name,
                  address: place.address,
                  coordinates: place.coordinates,
                  distanceMeters: place.distanceMeters,
                  priceLevel: place.priceLevel,
                  cuisineTags: place.types,
                  photoUrl: place.photoUrl,
                  openNow: place.openNow,
                  score: {
                    googleRatingScore: Math.round(((place.rating ?? 0) / 5) * 100),
                    reviewVolumeScore: 0,
                    socialProofScore: 0,
                    compositeScore: Math.round(((place.rating ?? 0) / 5) * 100),
                  },
                  reviewSignals: [],
                  aiSummary: slot.description,
                },
              }
            : slot;
        }),
      );

      return {
        ...day,
        slots,
      };
    }),
  );

  const enrichedPlan = {
    ...plan,
    days: enrichedDays,
  };

  if (request.userId) {
    try {
      const user = await prisma.user.findUnique({
        where: { clerkId: request.userId },
      });
      if (user) {
        await prisma.itinerary.create({
          data: {
            userId: user.id,
            destination: request.destination,
            days: request.days,
            budgetRange: request.budgetRange,
            content: enrichedPlan,
          },
        });
      }
    } catch (error) {
      logUnknownError('Persisting itinerary failed', error, { userId: request.userId });
    }
  }

  return enrichedPlan;
};
