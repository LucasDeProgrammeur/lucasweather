export interface WeatherApiResponse {
  latitude: number;
  longitude: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation: string;
  elevation: number;

  current_weather_units: CurrentWeatherUnits;
  current_weather: CurrentWeather;

  hourly_units: HourlyUnits;
  hourly: Hourly;

  daily_units: DailyUnits;
  daily: Daily;
}

/* =========================
   Current Weather
========================= */

export interface CurrentWeatherUnits {
  time: string; // "iso8601"
  interval: string; // "seconds"
  temperature: string; // "°C"
  windspeed: string; // "km/h"
  winddirection: string; // "°"
  is_day: string;
  weathercode: string; // "wmo code"
}

export interface CurrentWeather {
  time: string; // ISO datetime string
  interval: number; // seconds
  temperature: number;
  windspeed: number;
  winddirection: number;
  is_day: 0 | 1;
  weathercode: number;
}

/* =========================
   Hourly
========================= */

export interface HourlyUnits {
  time: string; // "iso8601"
  temperature_2m: string; // "°C"
  rain: string; // "mm"
  showers: string; // "mm"
}

export interface Hourly {
  time: string[]; // ISO datetime strings
  temperature_2m: number[];
  rain: number[];
  showers: number[];
}

/* =========================
   Daily
========================= */

export interface DailyUnits {
  time: string; // "iso8601"
  temperature_2m_max: string; // "°C"
  temperature_2m_min: string; // "°C"

}

export interface Daily {
  time: string[]; // ISO date strings (YYYY-MM-DD)
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  weather_code: number[];
  wind_direction_10m_dominant: number[];
  wind_speed_10m_mean: number[];
  sunrise: string[];
  sunset: string[];
}


export interface City {
  city: String,
  city_ascii: string,
  lat: number,
  lng: number,
  country: string,
  iso2: string,
  iso3: string,
  amin_name: string,
  capital: string,
  population: number,
  id: number
}