import { useGetBookmarks, useDeleteBookmark, getGetBookmarksQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Bookmark, Trash2, Globe, Plane, MapPin } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

function getTypeIcon(type: string) {
  switch (type) {
    case "destination": return <Globe className="w-4 h-4" />;
    case "trip": return <Plane className="w-4 h-4" />;
    default: return <MapPin className="w-4 h-4" />;
  }
}

function getTypeBadgeColor(type: string) {
  switch (type) {
    case "destination": return "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400";
    case "trip": return "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400";
    default: return "bg-muted text-muted-foreground";
  }
}

export default function Saved() {
  const queryClient = useQueryClient();
  const { data: bookmarks, isLoading } = useGetBookmarks();
  const deleteMutation = useDeleteBookmark();

  function handleDelete(id: number, title: string) {
    deleteMutation.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetBookmarksQueryKey() });
        toast.success(`${title} removed from saved`);
      }
    });
  }

  type Bookmark = NonNullable<typeof bookmarks>[0];
  const grouped = (bookmarks ?? []).reduce((acc, b) => {
    if (!acc[b.type]) acc[b.type] = [];
    acc[b.type]!.push(b);
    return acc;
  }, {} as Record<string, Bookmark[]>);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Saved</h1>
        <p className="text-muted-foreground mt-1">Your bookmarked destinations, trips, and more</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-56 rounded-2xl" />)}
        </div>
      ) : !bookmarks || bookmarks.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground border border-dashed border-border/60 rounded-2xl">
          <Bookmark className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium">Nothing saved yet</p>
          <p className="text-sm mt-1">Browse destinations and save your favorites</p>
        </div>
      ) : (
        Object.entries(grouped).map(([type, items]) => {
          if (!items || items.length === 0) return null;
          return (
            <div key={type}>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 capitalize">
                {getTypeIcon(type)}
                {type === "destination" ? "Saved Destinations" : type === "trip" ? "Saved Trips" : type}
                <span className="text-sm font-normal text-muted-foreground">({items.length})</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((bookmark) => (
                  <div key={bookmark.id} className="glass-card rounded-2xl overflow-hidden group hover:shadow-xl transition-all duration-300" data-testid={`bookmark-${bookmark.id}`}>
                    <div className="relative h-40 overflow-hidden">
                      <img src={bookmark.imageUrl} alt={bookmark.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute top-3 left-3">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1 ${getTypeBadgeColor(bookmark.type)}`}>
                          {getTypeIcon(bookmark.type)}
                          {bookmark.type}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDelete(bookmark.id, bookmark.title)}
                        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-red-500/80 transition-colors opacity-0 group-hover:opacity-100"
                        data-testid={`delete-bookmark-${bookmark.id}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold">{bookmark.title}</h3>
                      {bookmark.subtitle && (
                        <p className="text-sm text-muted-foreground mt-0.5">{bookmark.subtitle}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        Saved {new Date(bookmark.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
