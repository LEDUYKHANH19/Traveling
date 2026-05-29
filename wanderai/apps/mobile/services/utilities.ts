import { apiRequest } from './api';

export const getCurrencyRates = (
  base: string,
  token?: string | null,
): Promise<{ base: string; rates: Record<string, number> }> =>
  apiRequest(`/api/v1/utilities/currency?base=${encodeURIComponent(base)}`, { token });

export const getWeather = (
  city: string,
  token?: string | null,
): Promise<{
  city: string;
  description: string;
  temperatureCelsius: number;
  feelsLikeCelsius: number;
  humidity: number;
}> => apiRequest(`/api/v1/utilities/weather?city=${encodeURIComponent(city)}`, { token });
