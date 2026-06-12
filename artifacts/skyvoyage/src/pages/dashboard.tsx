import { useGetCurrentWeather, useGetAiSuggestions, useGetAnalyticsSummary, useGetNotifications, useGetTrips, useGetFeaturedDestinations } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Plane, Map, Bookmark, CloudSun, TrendingUp, Globe, Calendar, DollarSign, Bell, ChevronRight, Star, Thermometer, Wind, Droplets } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

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

export default function Dashboard() {
  const { data: weather, isLoading: weatherLoading } = useGetCurrentWeather({ city: "Bali" });
  const { data: suggestions, isLoading: aiLoading } = useGetAiSuggestions({});
  const { data: summary, isLoading: summaryLoading } = useGetAnalyticsSummary();
  const { data: notifications } = useGetNotifications();
  const { data: trips, isLoading: tripsLoading } = useGetTrips();
  const { data: featured, isLoading: featuredLoading } = useGetFeaturedDestinations();

  const unreadCount = notifications?.filter(n => !n.isRead).length ?? 0;

  const quickActions = [
    { label: "Plan Trip", icon: Plane, href: "/planner", color: "from-sky-500 to-cyan-600" },
    { label: "Destinations", icon: Globe, href: "/destinations", color: "from-violet-500 to-purple-600" },
    { label: "Saved", icon: Bookmark, href: "/saved", color: "from-orange-500 to-amber-600" },
    { label: "Analytics", icon: TrendingUp, href: "/analytics", color: "from-emerald-500 to-teal-600" },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">{getGreeting()}, Traveler.</h1>
          <p className="text-muted-foreground mt-1">Your world is waiting. Here's what's happening today.</p>
        </div>
        {unreadCount > 0 && (
          <Link href="/settings">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium hover:bg-primary/20 transition-colors cursor-pointer" data-testid="notification-badge">
              <Bell className="w-4 h-4" />
              {unreadCount} new alert{unreadCount !== 1 ? "s" : ""}
            </div>
          </Link>
        )}
      </div>

      {/* Weather Hero + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weather Card */}
        <div className="lg:col-span-2">
          {weatherLoading ? (
            <Skeleton className="h-64 rounded-2xl" />
          ) : weather ? (
            <div className={`rounded-2xl p-8 h-64 flex flex-col justify-between relative overflow-hidden ${getWeatherClass(weather.conditionCode)}`} data-testid="weather-hero-card">
              <div className="absolute inset-0 bg-black/10" />
              <div className="relative z-10 flex justify-between items-start">
                <div>
                  <p className="text-white/80 text-sm font-medium uppercase tracking-widest">Current Weather</p>
                  <h2 className="text-white text-2xl font-bold mt-1">{weather.city}, {weather.country}</h2>
                  <p className="text-white/80 mt-1">{weather.condition}</p>
                </div>
                <div className="text-right">
                  <div className="text-white text-7xl font-light leading-none">{weather.temperature}°</div>
                  <p className="text-white/70 text-sm mt-1">Feels like {weather.feelsLike}°</p>
                </div>
              </div>
              <div className="relative z-10 flex gap-8 pt-6 border-t border-white/20">
                <div className="flex items-center gap-2 text-white/90">
                  <Wind className="w-4 h-4" />
                  <span className="text-sm">{weather.windSpeed} km/h</span>
                </div>
                <div className="flex items-center gap-2 text-white/90">
                  <Droplets className="w-4 h-4" />
                  <span className="text-sm">{weather.humidity}%</span>
                </div>
                <div className="flex items-center gap-2 text-white/90">
                  <Thermometer className="w-4 h-4" />
                  <span className="text-sm">UV {weather.uvIndex}</span>
                </div>
                <div className="flex items-center gap-2 text-white/90">
                  <CloudSun className="w-4 h-4" />
                  <span className="text-sm">{weather.airQualityLabel}</span>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Quick Actions */}
        <div className="glass-card rounded-2xl p-6">
          <h3 className="font-semibold text-base mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => (
              <Link key={action.href} href={action.href}>
                <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-muted/60 hover:bg-muted transition-all cursor-pointer group" data-testid={`quick-action-${action.label.toLowerCase().replace(" ", "-")}`}>
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <action.icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-medium">{action.label}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)
        ) : summary ? (
          <>
            {[
              { label: "Total Trips", value: summary.totalTrips, icon: Plane, color: "text-sky-500" },
              { label: "Upcoming", value: summary.upcomingTrips, icon: Calendar, color: "text-violet-500" },
              { label: "Saved Places", value: summary.savedDestinations, icon: Bookmark, color: "text-orange-500" },
              { label: "Total Spend", value: `$${summary.totalSpend.toLocaleString()}`, icon: DollarSign, color: "text-emerald-500" },
            ].map((stat) => (
              <div key={stat.label} className="glass-card rounded-2xl p-5" data-testid={`stat-${stat.label.toLowerCase().replace(" ", "-")}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{stat.label}</span>
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </div>
                <div className="text-2xl font-bold">{stat.value}</div>
              </div>
            ))}
          </>
        ) : null}
      </div>

      {/* Upcoming Trips + Featured Destinations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Trips */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold">Your Trips</h3>
            <Link href="/planner">
              <span className="text-xs text-primary hover:underline cursor-pointer flex items-center gap-1">
                View all <ChevronRight className="w-3 h-3" />
              </span>
            </Link>
          </div>
          {tripsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
            </div>
          ) : trips && trips.length > 0 ? (
            <div className="space-y-3">
              {trips.slice(0, 3).map((trip) => (
                <div key={trip.id} className="flex items-center gap-4 p-3 rounded-xl bg-muted/40 hover:bg-muted/60 transition-colors" data-testid={`trip-card-${trip.id}`}>
                  {trip.coverImageUrl && (
                    <img src={trip.coverImageUrl} alt={trip.destination} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{trip.title}</p>
                    <p className="text-xs text-muted-foreground">{trip.destination} · {trip.startDate}</p>
                  </div>
                  <Badge variant={trip.status === "upcoming" ? "default" : trip.status === "completed" ? "secondary" : "outline"} className="text-xs flex-shrink-0">
                    {trip.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Plane className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No trips yet. Plan your first adventure!</p>
              <Link href="/planner">
                <button className="mt-3 text-xs text-primary hover:underline">Plan a trip</button>
              </Link>
            </div>
          )}
        </div>

        {/* Featured Destinations */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold">Featured Destinations</h3>
            <Link href="/destinations">
              <span className="text-xs text-primary hover:underline cursor-pointer flex items-center gap-1">
                Explore <ChevronRight className="w-3 h-3" />
              </span>
            </Link>
          </div>
          {featuredLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
            </div>
          ) : featured && featured.length > 0 ? (
            <div className="space-y-3">
              {featured.slice(0, 3).map((dest) => (
                <div key={dest.id} className="flex items-center gap-4 p-3 rounded-xl bg-muted/40 hover:bg-muted/60 transition-colors cursor-pointer group" data-testid={`featured-dest-${dest.id}`}>
                  <img src={dest.imageUrl} alt={dest.name} className="w-14 h-14 rounded-xl object-cover flex-shrink-0 group-hover:scale-105 transition-transform" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{dest.name}</p>
                    <p className="text-xs text-muted-foreground">{dest.country} · {dest.bestSeason}</p>
                  </div>
                  <div className="flex items-center gap-1 text-amber-500 flex-shrink-0">
                    <Star className="w-3 h-3 fill-amber-500" />
                    <span className="text-xs font-medium">{dest.rating}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      {/* AI Suggestions */}
      {!aiLoading && suggestions && suggestions.length > 0 && (
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <h3 className="font-semibold">AI Travel Insights</h3>
            <Badge variant="outline" className="text-xs ml-1">Smart</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {suggestions.slice(0, 3).map((s) => (
              <div key={s.id} className="p-4 rounded-xl bg-muted/40 border border-border/50" data-testid={`ai-suggestion-${s.id}`}>
                <Badge variant="outline" className="text-xs mb-2 capitalize">{s.category}</Badge>
                <p className="text-sm leading-relaxed">{s.message}</p>
                {s.actionLabel && (
                  <Link href={s.actionUrl ?? "#"}>
                    <button className="mt-3 text-xs text-primary hover:underline flex items-center gap-1">
                      {s.actionLabel} <ChevronRight className="w-3 h-3" />
                    </button>
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
