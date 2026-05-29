import { env } from '../config/env.js';
import { fetchJson } from './http-client.js';

type ExchangeRateResponse = {
  conversion_rates?: Record<string, number>;
};

type WeatherResponse = {
  name?: string;
  weather?: readonly {
    description?: string;
    icon?: string;
  }[];
  main?: {
    temp?: number;
    feels_like?: number;
    humidity?: number;
  };
};

export type CurrencyRates = {
  base: string;
  rates: Record<string, number>;
};

export type WeatherSummary = {
  city: string;
  description: string;
  temperatureCelsius: number;
  feelsLikeCelsius: number;
  humidity: number;
};

export const getCurrencyRates = async (base = 'USD'): Promise<CurrencyRates> => {
  const url = `https://v6.exchangerate-api.com/v6/${env.EXCHANGERATE_API_KEY}/latest/${base}`;
  const data = await fetchJson<ExchangeRateResponse>(url, undefined, 'ExchangeRate API');
  return {
    base,
    rates: data.conversion_rates ?? {},
  };
};

export const getWeather = async (city: string): Promise<WeatherSummary> => {
  const url = new URL('https://api.openweathermap.org/data/2.5/weather');
  url.searchParams.set('q', city);
  url.searchParams.set('appid', env.OPENWEATHER_API_KEY);
  url.searchParams.set('units', 'metric');
  const data = await fetchJson<WeatherResponse>(url, undefined, 'OpenWeatherMap');

  return {
    city: data.name ?? city,
    description: data.weather?.[0]?.description ?? 'Weather unavailable',
    temperatureCelsius: data.main?.temp ?? 0,
    feelsLikeCelsius: data.main?.feels_like ?? 0,
    humidity: data.main?.humidity ?? 0,
  };
};
