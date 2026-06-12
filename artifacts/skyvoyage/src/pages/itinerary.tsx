import { useState } from "react";
import { useGetTrips, useGetItinerary, useCreateItineraryItem, useDeleteItineraryItem, getGetItineraryQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { CalendarDays, Plane, Hotel, Activity, Trash2, Plus, Clock, MapPin, DollarSign } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const TIME_PERIODS = ["morning", "afternoon", "evening"];
const ITEM_TYPES = ["flight", "hotel", "activity", "meal", "transport", "other"];

function getTypeIcon(type: string) {
  switch (type) {
    case "flight": return <Plane className="w-4 h-4" />;
    case "hotel": return <Hotel className="w-4 h-4" />;
    default: return <Activity className="w-4 h-4" />;
  }
}

function getTypeColor(type: string) {
  switch (type) {
    case "flight": return "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400";
    case "hotel": return "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400";
    case "meal": return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
    case "transport": return "bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400";
    default: return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
  }
}

function getPeriodLabel(p: string) {
  switch (p) {
    case "morning": return "Morning";
    case "afternoon": return "Afternoon";
    case "evening": return "Evening";
    default: return p;
  }
}

export default function Itinerary() {
  const { data: trips } = useGetTrips();
  const [selectedTripId, setSelectedTripId] = useState<number | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ date: "", timeOfDay: "morning", type: "activity", title: "", location: "", duration: 60, cost: "" });
  const queryClient = useQueryClient();

  const tripId = selectedTripId ?? trips?.[0]?.id ?? null;

  const { data: items, isLoading } = useGetItinerary(tripId!, {
    query: { enabled: !!tripId, queryKey: getGetItineraryQueryKey(tripId!) }
  });

  const createMutation = useCreateItineraryItem();
  const deleteMutation = useDeleteItineraryItem();

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!tripId) return;
    createMutation.mutate({
      tripId,
      data: {
        date: form.date,
        timeOfDay: form.timeOfDay,
        type: form.type,
        title: form.title,
        location: form.location || undefined,
        duration: form.duration,
        cost: form.cost ? parseFloat(form.cost) : undefined,
      }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetItineraryQueryKey(tripId) });
        setAddOpen(false);
        setForm({ date: "", timeOfDay: "morning", type: "activity", title: "", location: "", duration: 60, cost: "" });
        toast.success("Activity added to itinerary");
      }
    });
  }

  function handleDelete(itemId: number) {
    if (!tripId) return;
    deleteMutation.mutate({ tripId, itemId }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetItineraryQueryKey(tripId) });
        toast.success("Item removed");
      }
    });
  }

  const grouped = TIME_PERIODS.reduce((acc, period) => {
    acc[period] = (items ?? []).filter(i => i.timeOfDay === period);
    return acc;
  }, {} as Record<string, typeof items>);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Itinerary</h1>
          <p className="text-muted-foreground mt-1">Your day-by-day travel schedule</p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity" data-testid="add-itinerary-btn">
              <Plus className="w-4 h-4" />
              Add Activity
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Itinerary Item</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4 mt-2">
              <div>
                <label className="text-sm font-medium block mb-1">Title</label>
                <input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Visit Tanah Lot Temple" className="w-full h-10 px-3 rounded-lg bg-muted border border-border focus:border-primary outline-none text-sm" data-testid="input-title" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium block mb-1">Date</label>
                  <input required type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="w-full h-10 px-3 rounded-lg bg-muted border border-border focus:border-primary outline-none text-sm" data-testid="input-date" />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Time of Day</label>
                  <Select value={form.timeOfDay} onValueChange={v => setForm(f => ({ ...f, timeOfDay: v }))}>
                    <SelectTrigger data-testid="select-time-of-day"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning">Morning</SelectItem>
                      <SelectItem value="afternoon">Afternoon</SelectItem>
                      <SelectItem value="evening">Evening</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium block mb-1">Type</label>
                  <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
                    <SelectTrigger data-testid="select-type"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {ITEM_TYPES.map(t => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Duration (min)</label>
                  <input type="number" value={form.duration} onChange={e => setForm(f => ({ ...f, duration: parseInt(e.target.value) || 60 }))} className="w-full h-10 px-3 rounded-lg bg-muted border border-border focus:border-primary outline-none text-sm" data-testid="input-duration" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium block mb-1">Location</label>
                  <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="Ubud, Bali" className="w-full h-10 px-3 rounded-lg bg-muted border border-border focus:border-primary outline-none text-sm" data-testid="input-location" />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Cost ($)</label>
                  <input type="number" value={form.cost} onChange={e => setForm(f => ({ ...f, cost: e.target.value }))} placeholder="45" className="w-full h-10 px-3 rounded-lg bg-muted border border-border focus:border-primary outline-none text-sm" data-testid="input-cost" />
                </div>
              </div>
              <button type="submit" disabled={createMutation.isPending} className="w-full h-10 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity" data-testid="submit-add-item">
                {createMutation.isPending ? "Adding..." : "Add to Itinerary"}
              </button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Trip Selector */}
      {trips && trips.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {trips.map(trip => (
            <button
              key={trip.id}
              onClick={() => setSelectedTripId(trip.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${(tripId === trip.id) ? "bg-primary text-primary-foreground border-primary" : "bg-muted/60 border-border hover:bg-muted"}`}
              data-testid={`trip-tab-${trip.id}`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              {trip.title}
            </button>
          ))}
        </div>
      )}

      {/* Timeline */}
      {!tripId ? (
        <div className="text-center py-16 text-muted-foreground">
          <CalendarDays className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium">No trips yet</p>
          <p className="text-sm mt-1">Create a trip first, then build your itinerary</p>
        </div>
      ) : isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}
        </div>
      ) : (
        <div className="space-y-8">
          {TIME_PERIODS.map((period) => {
            const periodItems = grouped[period] ?? [];
            return (
              <div key={period}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/80 to-cyan-500/80 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="font-semibold text-lg">{getPeriodLabel(period)}</h2>
                  <div className="h-px flex-1 bg-border/60" />
                  <span className="text-xs text-muted-foreground">{periodItems.length} items</span>
                </div>

                {periodItems.length === 0 ? (
                  <div className="border border-dashed border-border/60 rounded-2xl p-6 text-center text-muted-foreground text-sm">
                    No {period} activities yet
                  </div>
                ) : (
                  <div className="space-y-3">
                    {periodItems.map((item) => (
                      <div key={item.id} className="glass-card rounded-2xl p-5 flex items-start gap-4 group hover:shadow-md transition-shadow" data-testid={`itinerary-item-${item.id}`}>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${getTypeColor(item.type)}`}>
                          {getTypeIcon(item.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{item.title}</h3>
                            <Badge variant="outline" className="text-xs capitalize">{item.type}</Badge>
                          </div>
                          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" />{item.date}</span>
                            {item.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{item.location}</span>}
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{item.duration} min</span>
                            {item.cost && <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />${item.cost}</span>}
                          </div>
                        </div>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="opacity-0 group-hover:opacity-100 w-8 h-8 rounded-lg hover:bg-destructive/10 hover:text-destructive flex items-center justify-center transition-all flex-shrink-0"
                          data-testid={`delete-itinerary-${item.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
