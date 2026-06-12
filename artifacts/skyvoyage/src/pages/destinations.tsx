import { useState } from "react";
import { useGetDestinations, useGetFeaturedDestinations, useCreateBookmark } from "@workspace/api-client-react";
import { Search, Star, Thermometer, DollarSign, Calendar, Bookmark, Globe, Filter } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

const CATEGORIES = ["All", "Beach", "Mountains", "City", "Adventure", "Nature", "Luxury", "Budget"];

export default function Destinations() {
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");

  const params = {
    ...(category !== "All" ? { category } : {}),
    ...(search ? { search } : {}),
  };

  const { data: destinations, isLoading } = useGetDestinations(params);
  const { data: featured } = useGetFeaturedDestinations();
  const bookmarkMutation = useCreateBookmark();

  function handleBookmark(dest: NonNullable<typeof destinations>[0]) {
    bookmarkMutation.mutate({
      data: {
        type: "destination",
        referenceId: dest.id,
        title: dest.name,
        subtitle: `${dest.country} · ${dest.category}`,
        imageUrl: dest.imageUrl,
      }
    }, {
      onSuccess: () => toast.success(`${dest.name} saved to bookmarks`),
      onError: () => toast.error("Failed to save bookmark"),
    });
  }

  const budgetBadgeColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "budget": return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
      case "moderate": return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "luxury": return "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Destinations</h1>
        <p className="text-muted-foreground mt-1">Discover your next adventure from {destinations?.length ?? 0}+ curated destinations</p>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search destinations, countries..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 pl-10 pr-4 rounded-xl bg-muted/60 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm transition-all"
            data-testid="search-destinations"
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Filter className="w-4 h-4" />
          <span>{destinations?.length ?? 0} results</span>
        </div>
      </div>

      {/* Category Tabs */}
      <Tabs value={category} onValueChange={setCategory}>
        <TabsList className="flex-wrap h-auto gap-1 bg-muted/60 p-1">
          {CATEGORIES.map((cat) => (
            <TabsTrigger key={cat} value={cat} className="text-sm" data-testid={`tab-${cat.toLowerCase()}`}>
              {cat}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Featured Banner (only when no filters) */}
      {category === "All" && !search && featured && featured.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            Featured This Season
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {featured.slice(0, 3).map((dest) => (
              <div key={dest.id} className="relative rounded-2xl overflow-hidden h-48 group cursor-pointer" data-testid={`featured-card-${dest.id}`}>
                <img src={dest.imageUrl} alt={dest.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-white font-bold text-lg">{dest.name}</h3>
                  <p className="text-white/80 text-sm">{dest.country}</p>
                </div>
                <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/40 backdrop-blur-sm px-2 py-1 rounded-full">
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  <span className="text-white text-xs font-medium">{dest.rating}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Destinations Grid */}
      <div>
        {category !== "All" || search ? (
          <h2 className="text-lg font-semibold mb-4">
            {search ? `Results for "${search}"` : category}
          </h2>
        ) : (
          <h2 className="text-lg font-semibold mb-4">All Destinations</h2>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-80 rounded-2xl" />
            ))}
          </div>
        ) : destinations && destinations.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {destinations.map((dest) => (
              <div key={dest.id} className="glass-card rounded-2xl overflow-hidden group hover:shadow-xl transition-all duration-300" data-testid={`destination-card-${dest.id}`}>
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={dest.imageUrl}
                    alt={dest.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute top-3 left-3">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${budgetBadgeColor(dest.budgetLevel)}`}>
                      {dest.budgetLevel}
                    </span>
                  </div>
                  <button
                    onClick={() => handleBookmark(dest)}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center hover:bg-black/50 transition-colors"
                    data-testid={`bookmark-btn-${dest.id}`}
                  >
                    <Bookmark className="w-4 h-4 text-white" />
                  </button>
                  <div className="absolute bottom-3 left-3 flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span className="text-white text-sm font-semibold">{dest.rating}</span>
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-bold text-lg leading-tight">{dest.name}</h3>
                      <p className="text-muted-foreground text-sm flex items-center gap-1 mt-0.5">
                        <Globe className="w-3 h-3" />
                        {dest.country}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <div className="text-xs font-bold text-primary bg-primary/10 rounded-lg px-2 py-1">
                        Score {dest.travelScore}
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{dest.description}</p>

                  <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border/50">
                    <div className="flex flex-col items-center gap-0.5">
                      <Thermometer className="w-3.5 h-3.5 text-orange-400" />
                      <span className="text-xs font-medium">{dest.avgTemperature}°C</span>
                      <span className="text-xs text-muted-foreground">Avg temp</span>
                    </div>
                    <div className="flex flex-col items-center gap-0.5">
                      <Calendar className="w-3.5 h-3.5 text-sky-400" />
                      <span className="text-xs font-medium text-center leading-tight">{dest.bestSeason}</span>
                      <span className="text-xs text-muted-foreground">Best time</span>
                    </div>
                    <div className="flex flex-col items-center gap-0.5">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-xs font-medium">${dest.estimatedDailyBudget}/d</span>
                      <span className="text-xs text-muted-foreground">Est. cost</span>
                    </div>
                  </div>

                  {dest.tags && dest.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {dest.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="text-xs bg-muted/60 text-muted-foreground px-2 py-0.5 rounded-full">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <Globe className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-lg font-medium">No destinations found</p>
            <p className="text-sm mt-1">Try a different search or category</p>
          </div>
        )}
      </div>
    </div>
  );
}
