import { useGetAnalyticsSummary, useGetTemperatureTrends, useGetPopularDestinations } from "@workspace/api-client-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { Plane, Globe, Calendar, DollarSign, TrendingUp, MapPin } from "lucide-react";

export default function Analytics() {
  const { data: summary, isLoading: summaryLoading } = useGetAnalyticsSummary();
  const { data: temperatureTrends, isLoading: tempLoading } = useGetTemperatureTrends({ city: "bali" });
  const { data: popularDests, isLoading: popularLoading } = useGetPopularDestinations();

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground mt-1">Insights into your travel habits and the world's top destinations</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)
        ) : summary ? (
          <>
            {[
              { label: "Total Trips", value: summary.totalTrips, icon: Plane, color: "from-sky-500 to-cyan-600", bg: "bg-sky-50 dark:bg-sky-950/30" },
              { label: "Destinations Visited", value: summary.destinationsVisited, icon: Globe, color: "from-violet-500 to-purple-600", bg: "bg-violet-50 dark:bg-violet-950/30" },
              { label: "Upcoming Trips", value: summary.upcomingTrips, icon: Calendar, color: "from-orange-500 to-amber-600", bg: "bg-orange-50 dark:bg-orange-950/30" },
              { label: "Total Spend", value: `$${summary.totalSpend.toLocaleString()}`, icon: DollarSign, color: "from-emerald-500 to-teal-600", bg: "bg-emerald-50 dark:bg-emerald-950/30" },
            ].map((stat) => (
              <div key={stat.label} className="glass-card rounded-2xl p-5" data-testid={`analytics-stat-${stat.label.toLowerCase().replace(/\s+/g, "-")}`}>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-xs text-muted-foreground mt-0.5 uppercase tracking-wider font-medium">{stat.label}</div>
              </div>
            ))}
          </>
        ) : null}
      </div>

      {/* Temperature Trends */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Temperature Trends — Bali</h2>
          <span className="text-xs text-muted-foreground ml-auto">12-month forecast</span>
        </div>
        {tempLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : temperatureTrends && temperatureTrends.length > 0 ? (
          <div className="h-64" data-testid="temperature-chart">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={temperatureTrends} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradHigh" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradLow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}°`} />
                <Tooltip
                  contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px" }}
                  itemStyle={{ color: "hsl(var(--foreground))" }}
                  formatter={(v: number) => [`${v}°C`, ""]}
                />
                <Legend />
                <Area type="monotone" dataKey="high" name="High" stroke="hsl(var(--chart-1))" fill="url(#gradHigh)" strokeWidth={2} />
                <Area type="monotone" dataKey="low" name="Low" stroke="hsl(var(--chart-2))" fill="url(#gradLow)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : null}
      </div>

      {/* Rainfall + Popular Destinations side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rainfall Chart */}
        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-6">Monthly Rainfall — Bali (mm)</h2>
          {tempLoading ? (
            <Skeleton className="h-52 w-full" />
          ) : temperatureTrends && temperatureTrends.length > 0 ? (
            <div className="h-52" data-testid="rainfall-chart">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={temperatureTrends} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px" }}
                    formatter={(v: number) => [`${v} mm`, "Rainfall"]}
                  />
                  <Bar dataKey="rainfall" name="Rainfall" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : null}
        </div>

        {/* Popular Destinations */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <MapPin className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Trending Destinations</h2>
          </div>
          {popularLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-xl" />)}
            </div>
          ) : popularDests && popularDests.length > 0 ? (
            <div className="space-y-3">
              {popularDests.map((dest, idx) => (
                <div key={dest.name} className="flex items-center gap-3" data-testid={`popular-dest-${idx}`}>
                  <span className="text-lg font-bold text-muted-foreground w-6 text-center">{idx + 1}</span>
                  {dest.imageUrl && (
                    <img src={dest.imageUrl} alt={dest.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{dest.name}</p>
                    <p className="text-xs text-muted-foreground">{dest.country}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-semibold">{dest.visits.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">visitors</p>
                  </div>
                  <div className="w-20 bg-muted rounded-full h-1.5 flex-shrink-0">
                    <div
                      className="h-1.5 rounded-full bg-gradient-to-r from-primary to-cyan-400 transition-all"
                      style={{ width: `${(dest.visits / (popularDests[0]?.visits ?? 1)) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      {/* Most Visited Region */}
      {summary && (
        <div className="glass-card rounded-2xl p-6 flex items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-cyan-400 flex items-center justify-center flex-shrink-0">
            <Globe className="w-8 h-8 text-white" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground uppercase tracking-wider font-medium">Most Visited Region</p>
            <h3 className="text-2xl font-bold mt-0.5">{summary.mostVisitedRegion}</h3>
          </div>
          <div className="ml-auto text-right">
            <p className="text-sm text-muted-foreground">Avg trip duration</p>
            <p className="text-2xl font-bold">{summary.avgTripDuration} days</p>
          </div>
        </div>
      )}
    </div>
  );
}
