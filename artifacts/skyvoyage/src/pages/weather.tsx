import { useState } from "react";
import { useGetCurrentWeather, useGetHourlyForecast, useGetWeeklyForecast } from "@workspace/api-client-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Wind, Droplets, Sun, Eye, Sunrise, Sunset, CloudRain, Gauge } from "lucide-react";

const CITIES = ["Bali", "Paris", "Tokyo", "Dubai", "London", "New York", "Sydney", "Istanbul"];

function getWeatherClass(code?: string) {
  switch (code) {
    case "sunny": return "weather-sunny";
    case "rain": return "weather-rain";
    case "snow": return "weather-snow";
    case "thunderstorm": return "weather-thunderstorm";
    case "fog": return "weather-fog";
    default: return "weather-cloudy";
  }
}

function getAqiColor(aqi: number) {
  if (aqi <= 50) return "text-emerald-400";
  if (aqi <= 100) return "text-yellow-400";
  return "text-red-400";
}

export default function Weather() {
  const [city, setCity] = useState("Bali");
  const [inputCity, setInputCity] = useState("Bali");

  const { data: current, isLoading: currentLoading } = useGetCurrentWeather({ city });
  const { data: hourly, isLoading: hourlyLoading } = useGetHourlyForecast({ city });
  const { data: weekly, isLoading: weeklyLoading } = useGetWeeklyForecast({ city });

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (inputCity.trim()) setCity(inputCity.trim());
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Weather</h1>
          <p className="text-muted-foreground mt-1">Real-time conditions and forecasts for your destinations</p>
        </div>
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={inputCity}
              onChange={e => setInputCity(e.target.value)}
              placeholder="Search city..."
              className="h-10 pl-9 pr-4 rounded-xl bg-muted border border-border focus:border-primary outline-none text-sm w-48"
              data-testid="weather-city-search"
            />
          </div>
          <button type="submit" className="h-10 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity" data-testid="weather-search-btn">
            Search
          </button>
        </form>
      </div>

      {/* Quick City Tabs */}
      <div className="flex gap-2 flex-wrap">
        {CITIES.map(c => (
          <button key={c} onClick={() => { setCity(c); setInputCity(c); }} className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${city === c ? "bg-primary text-primary-foreground border-primary" : "border-border bg-muted/60 hover:bg-muted text-muted-foreground"}`} data-testid={`city-tab-${c.toLowerCase()}`}>
            {c}
          </button>
        ))}
      </div>

      {/* Current Weather Hero */}
      {currentLoading ? (
        <Skeleton className="h-64 rounded-2xl" />
      ) : current ? (
        <div className={`rounded-2xl p-8 relative overflow-hidden ${getWeatherClass(current.conditionCode)}`} data-testid="current-weather-card">
          <div className="absolute inset-0 bg-black/15" />
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start gap-6">
            <div>
              <p className="text-white/70 text-sm font-medium uppercase tracking-widest">Current Conditions</p>
              <h2 className="text-white text-3xl font-bold mt-1">{current.city}, {current.country}</h2>
              <p className="text-white/80 text-lg mt-1">{current.condition}</p>
            </div>
            <div className="text-right">
              <div className="text-white text-8xl font-light leading-none">{current.temperature}°</div>
              <p className="text-white/70 text-sm mt-2">Feels like {current.feelsLike}°C</p>
            </div>
          </div>

          <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-6 mt-8 pt-6 border-t border-white/20">
            {[
              { icon: Droplets, label: "Humidity", value: `${current.humidity}%` },
              { icon: Wind, label: "Wind", value: `${current.windSpeed} km/h` },
              { icon: Sun, label: "UV Index", value: `${current.uvIndex}` },
              { icon: Eye, label: "Visibility", value: `${current.visibility} km` },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-3">
                <item.icon className="w-5 h-5 text-white/70 flex-shrink-0" />
                <div>
                  <p className="text-xs text-white/60">{item.label}</p>
                  <p className="text-white font-semibold">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Sun & AQI Row */}
      {current && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Sunrise, label: "Sunrise", value: current.sunrise, color: "from-orange-400 to-amber-500" },
            { icon: Sunset, label: "Sunset", value: current.sunset, color: "from-purple-500 to-rose-500" },
            { icon: CloudRain, label: "Precipitation", value: `${current.precipitation ?? 0} mm`, color: "from-blue-500 to-indigo-600" },
            { icon: Gauge, label: "Air Quality", value: `${current.airQualityLabel} (${current.airQuality})`, color: "from-emerald-500 to-teal-600" },
          ].map(item => (
            <div key={item.label} className="glass-card rounded-2xl p-5" data-testid={`weather-stat-${item.label.toLowerCase()}`}>
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-3`}>
                <item.icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{item.label}</p>
              <p className="font-bold mt-0.5">{item.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Hourly Chart */}
      {!hourlyLoading && hourly && hourly.length > 0 && (
        <div className="glass-card rounded-2xl p-6">
          <h2 className="font-semibold text-lg mb-5">Hourly Temperature (°C)</h2>
          <div className="h-52" data-testid="hourly-chart">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourly} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="hourlyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                <XAxis dataKey="hour" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `${v}°`} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px" }} formatter={(v: number) => [`${v}°C`, "Temp"]} />
                <Area type="monotone" dataKey="temperature" stroke="hsl(var(--chart-1))" fill="url(#hourlyGrad)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* 7-Day Forecast */}
      {!weeklyLoading && weekly && weekly.length > 0 && (
        <div className="glass-card rounded-2xl p-6">
          <h2 className="font-semibold text-lg mb-5">7-Day Forecast</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {weekly.map((day) => (
              <div key={day.date} className="flex flex-col items-center p-3 rounded-xl bg-muted/40 hover:bg-muted/60 transition-colors" data-testid={`forecast-day-${day.dayName.toLowerCase()}`}>
                <p className="text-xs font-semibold text-muted-foreground">{day.dayName.slice(0, 3)}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{day.date.slice(5)}</p>
                <div className="my-3 text-sm capitalize text-center leading-tight">{day.condition}</div>
                <div className="text-sm font-bold">{day.high}°</div>
                <div className="text-xs text-muted-foreground">{day.low}°</div>
                {day.precipitation > 0 && (
                  <div className="flex items-center gap-0.5 mt-1 text-xs text-blue-400">
                    <CloudRain className="w-3 h-3" />
                    {day.precipitation}%
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Precipitation Chart */}
      {!hourlyLoading && hourly && hourly.length > 0 && (
        <div className="glass-card rounded-2xl p-6">
          <h2 className="font-semibold text-lg mb-5">Rain Probability (%)</h2>
          <div className="h-44" data-testid="precipitation-chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourly} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                <XAxis dataKey="hour" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px" }} formatter={(v: number) => [`${v}%`, "Rain probability"]} />
                <Bar dataKey="precipitation" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
