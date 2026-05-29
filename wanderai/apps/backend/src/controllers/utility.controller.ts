import { z } from 'zod';
import { getCurrencyRates, getWeather } from '../services/utility.service.js';
import { asyncHandler } from '../utils/async-handler.js';
import { sendSuccess } from '../utils/http-response.js';

export const getCurrency = asyncHandler(async (req, res) => {
  const base = z.string().min(3).max(3).default('USD').parse(req.query.base);
  const data = await getCurrencyRates(base.toUpperCase());
  sendSuccess(res, data);
});

export const getWeatherByCity = asyncHandler(async (req, res) => {
  const city = z.string().min(2).max(120).parse(req.query.city);
  const data = await getWeather(city);
  sendSuccess(res, data);
});
