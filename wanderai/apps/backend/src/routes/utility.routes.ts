import { Router } from 'express';
import { getCurrency, getWeatherByCity } from '../controllers/utility.controller.js';

export const utilityRouter = Router();

utilityRouter.get('/currency', getCurrency);
utilityRouter.get('/weather', getWeatherByCity);
