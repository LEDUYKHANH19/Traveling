import { Router } from 'express';
import { postGenerateItinerary } from '../controllers/itinerary.controller.js';

export const itineraryRouter = Router();

itineraryRouter.post('/generate', postGenerateItinerary);
