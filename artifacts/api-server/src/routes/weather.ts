import { Router, type IRouter } from "express";
import {
  GetCurrentWeatherQueryParams,
  GetHourlyForecastQueryParams,
  GetWeeklyForecastQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

function getWeatherData(city: string) {
  const cities: Record<string, { temp: number; condition: string; code: string; humidity: number; wind: number; uv: number; aqi: number; aqiLabel: string; country: string }> = {
    "paris": { temp: 22, condition: "Partly Cloudy", code: "cloudy", humidity: 65, wind: 14, uv: 5, aqi: 42, aqiLabel: "Good", country: "France" },
    "bali": { temp: 30, condition: "Sunny", code: "sunny", humidity: 78, wind: 8, uv: 9, aqi: 28, aqiLabel: "Good", country: "Indonesia" },
    "tokyo": { temp: 18, condition: "Rainy", code: "rain", humidity: 82, wind: 20, uv: 3, aqi: 55, aqiLabel: "Moderate", country: "Japan" },
    "new york": { temp: 15, condition: "Cloudy", code: "cloudy", humidity: 70, wind: 22, uv: 4, aqi: 61, aqiLabel: "Moderate", country: "USA" },
    "dubai": { temp: 38, condition: "Sunny", code: "sunny", humidity: 45, wind: 12, uv: 11, aqi: 35, aqiLabel: "Good", country: "UAE" },
    "london": { temp: 12, condition: "Foggy", code: "fog", humidity: 88, wind: 18, uv: 2, aqi: 48, aqiLabel: "Good", country: "UK" },
    "sydney": { temp: 25, condition: "Sunny", code: "sunny", humidity: 60, wind: 16, uv: 8, aqi: 22, aqiLabel: "Good", country: "Australia" },
    "istanbul": { temp: 20, condition: "Thunderstorm", code: "thunderstorm", humidity: 75, wind: 30, uv: 4, aqi: 52, aqiLabel: "Moderate", country: "Turkey" },
  };
  const normalized = city.toLowerCase();
  return cities[normalized] ?? { temp: 24, condition: "Partly Cloudy", code: "cloudy", humidity: 68, wind: 15, uv: 6, aqi: 38, aqiLabel: "Good", country: "World" };
}

router.get("/weather/current", async (req, res): Promise<void> => {
  const parsed = GetCurrentWeatherQueryParams.safeParse(req.query);
  const cityName = parsed.success && parsed.data.city ? parsed.data.city : "Bali";
  const w = getWeatherData(cityName);

  res.json({
    city: cityName.charAt(0).toUpperCase() + cityName.slice(1),
    country: w.country,
    temperature: w.temp,
    condition: w.condition,
    conditionCode: w.code,
    humidity: w.humidity,
    windSpeed: w.wind,
    uvIndex: w.uv,
    sunrise: "06:24",
    sunset: "18:47",
    feelsLike: w.temp - 2,
    visibility: 10.2,
    airQuality: w.aqi,
    airQualityLabel: w.aqiLabel,
    precipitation: w.code === "rain" ? 12 : w.code === "thunderstorm" ? 28 : 0,
  });
});

router.get("/weather/hourly", async (req, res): Promise<void> => {
  const parsed = GetHourlyForecastQueryParams.safeParse(req.query);
  const city = parsed.success && parsed.data.city ? parsed.data.city : "Bali";
  const base = getWeatherData(city);

  const hours = ["6 AM", "7 AM", "8 AM", "9 AM", "10 AM", "11 AM", "12 PM", "1 PM", "2 PM", "3 PM", "4 PM", "5 PM", "6 PM", "7 PM", "8 PM", "9 PM"];
  const offsets = [-3, -2, -1, 0, 1, 2, 3, 3, 2, 1, 0, -1, -2, -3, -4, -5];
  const precips = [0, 0, 0, 5, 10, 15, 20, 25, 30, 20, 10, 5, 0, 0, 0, 0];

  const result = hours.map((hour, i) => ({
    hour,
    temperature: Math.round(base.temp + offsets[i]),
    condition: base.condition,
    conditionCode: base.code,
    precipitation: precips[i],
    windSpeed: base.wind + (i % 3),
  }));

  res.json(result);
});

router.get("/weather/weekly", async (req, res): Promise<void> => {
  const parsed = GetWeeklyForecastQueryParams.safeParse(req.query);
  const city = parsed.success && parsed.data.city ? parsed.data.city : "Bali";
  const base = getWeatherData(city);

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const conditions = [
    { condition: base.condition, code: base.code },
    { condition: "Sunny", code: "sunny" },
    { condition: "Partly Cloudy", code: "cloudy" },
    { condition: "Rainy", code: "rain" },
    { condition: "Sunny", code: "sunny" },
    { condition: "Partly Cloudy", code: "cloudy" },
    { condition: "Sunny", code: "sunny" },
  ];
  const highOffsets = [0, 2, -1, -3, 1, 3, 2];
  const lowOffsets = [-5, -3, -6, -8, -4, -2, -3];
  const precips = [5, 0, 10, 40, 5, 10, 0];

  const today = new Date();
  const result = days.map((day, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return {
      date: d.toISOString().split("T")[0],
      dayName: day,
      high: Math.round(base.temp + highOffsets[i]),
      low: Math.round(base.temp + lowOffsets[i]),
      condition: conditions[i].condition,
      conditionCode: conditions[i].code,
      precipitation: precips[i],
      humidity: base.humidity + (i % 5 - 2),
    };
  });

  res.json(result);
});

export default router;
