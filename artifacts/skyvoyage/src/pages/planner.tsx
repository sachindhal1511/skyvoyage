import { useState } from "react";
import { useGetTrips, useCreateTrip, useDeleteTrip, getGetTripsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Plane, Calendar, DollarSign, Heart, Sparkles, Trash2, Plus, MapPin, ChevronRight, ChevronLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const INTERESTS = ["Beach", "Mountains", "History", "Food", "Art", "Adventure", "Nature", "Luxury", "Budget", "Nightlife", "Shopping", "Wellness"];

const STEPS = [
  { id: 1, label: "Destination", icon: MapPin },
  { id: 2, label: "Dates", icon: Calendar },
  { id: 3, label: "Budget", icon: DollarSign },
  { id: 4, label: "Interests", icon: Heart },
  { id: 5, label: "Generate", icon: Sparkles },
];

export default function Planner() {
  const queryClient = useQueryClient();
  const { data: trips, isLoading } = useGetTrips();
  const createMutation = useCreateTrip();
  const deleteMutation = useDeleteTrip();

  const [showWizard, setShowWizard] = useState(false);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    destination: "",
    title: "",
    startDate: "",
    endDate: "",
    budget: 2000,
    interests: [] as string[],
    notes: "",
  });

  function toggleInterest(i: string) {
    setForm(f => ({
      ...f,
      interests: f.interests.includes(i) ? f.interests.filter(x => x !== i) : [...f.interests, i]
    }));
  }

  function handleCreate() {
    createMutation.mutate({
      data: {
        title: form.title || `Trip to ${form.destination}`,
        destination: form.destination,
        startDate: form.startDate,
        endDate: form.endDate,
        budget: form.budget,
        interests: form.interests,
        notes: form.notes || undefined,
      }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetTripsQueryKey() });
        setShowWizard(false);
        setStep(1);
        setForm({ destination: "", title: "", startDate: "", endDate: "", budget: 2000, interests: [], notes: "" });
        toast.success("Trip created! Start building your itinerary.");
      }
    });
  }

  function handleDelete(id: number) {
    deleteMutation.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetTripsQueryKey() });
        toast.success("Trip deleted");
      }
    });
  }

  const canNext = () => {
    if (step === 1) return form.destination.trim().length > 0;
    if (step === 2) return form.startDate && form.endDate;
    if (step === 3) return form.budget > 0;
    if (step === 4) return form.interests.length > 0;
    return true;
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Trip Planner</h1>
          <p className="text-muted-foreground mt-1">Plan your next adventure in 5 easy steps</p>
        </div>
        {!showWizard && (
          <button
            onClick={() => setShowWizard(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
            data-testid="new-trip-btn"
          >
            <Plus className="w-4 h-4" />
            New Trip
          </button>
        )}
      </div>

      {/* Multi-step Wizard */}
      {showWizard && (
        <div className="glass-card rounded-2xl p-8">
          {/* Step Progress */}
          <div className="flex items-center gap-0 mb-8">
            {STEPS.map((s, idx) => (
              <div key={s.id} className="flex items-center flex-1">
                <div className={`flex flex-col items-center gap-1 ${idx < STEPS.length - 1 ? "flex-1" : ""}`}>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${step >= s.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                    <s.icon className="w-4 h-4" />
                  </div>
                  <span className={`text-xs font-medium ${step >= s.id ? "text-primary" : "text-muted-foreground"}`}>{s.label}</span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div className={`h-0.5 flex-1 mb-5 mx-2 rounded-full transition-colors ${step > s.id ? "bg-primary" : "bg-muted"}`} />
                )}
              </div>
            ))}
          </div>

          {/* Step Content */}
          <div className="min-h-48">
            {step === 1 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold">Where do you want to go?</h2>
                <input
                  type="text"
                  required
                  autoFocus
                  value={form.destination}
                  onChange={e => setForm(f => ({ ...f, destination: e.target.value }))}
                  placeholder="Enter a destination (e.g. Bali, Tokyo, Paris)"
                  className="w-full h-14 px-5 rounded-2xl bg-muted border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-lg transition-all"
                  data-testid="input-destination"
                />
                <div>
                  <label className="text-sm font-medium block mb-2 text-muted-foreground">Trip Name (optional)</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    placeholder={`My ${form.destination || "Dream"} Trip`}
                    className="w-full h-11 px-4 rounded-xl bg-muted border border-border focus:border-primary outline-none text-sm transition-all"
                    data-testid="input-trip-title"
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold">When are you traveling?</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium block mb-2">Departure Date</label>
                    <input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} className="w-full h-11 px-4 rounded-xl bg-muted border border-border focus:border-primary outline-none text-sm" data-testid="input-start-date" />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-2">Return Date</label>
                    <input type="date" value={form.endDate} min={form.startDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} className="w-full h-11 px-4 rounded-xl bg-muted border border-border focus:border-primary outline-none text-sm" data-testid="input-end-date" />
                  </div>
                </div>
                {form.startDate && form.endDate && (
                  <p className="text-sm text-muted-foreground">
                    Trip duration: <span className="font-semibold text-foreground">{Math.ceil((new Date(form.endDate).getTime() - new Date(form.startDate).getTime()) / (1000 * 60 * 60 * 24))} days</span>
                  </p>
                )}
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold">What's your budget?</h2>
                <div>
                  <div className="flex justify-between mb-3">
                    <span className="text-sm text-muted-foreground">Total Budget</span>
                    <span className="text-2xl font-bold">${form.budget.toLocaleString()}</span>
                  </div>
                  <input type="range" min="500" max="20000" step="100" value={form.budget} onChange={e => setForm(f => ({ ...f, budget: parseInt(e.target.value) }))} className="w-full accent-primary" data-testid="budget-slider" />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>$500</span>
                    <span>$20,000</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[{ label: "Budget", value: 1500, desc: "Hostels & local food" }, { label: "Moderate", value: 3500, desc: "Mid-range hotels" }, { label: "Luxury", value: 8000, desc: "Premium experience" }].map(preset => (
                    <button key={preset.label} onClick={() => setForm(f => ({ ...f, budget: preset.value }))} className={`p-4 rounded-xl border text-left transition-all ${form.budget === preset.value ? "border-primary bg-primary/10" : "border-border bg-muted/40 hover:bg-muted"}`} data-testid={`budget-preset-${preset.label.toLowerCase()}`}>
                      <div className="font-semibold text-sm">{preset.label}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{preset.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold">What are your interests?</h2>
                <p className="text-sm text-muted-foreground">Select at least one to personalize your trip</p>
                <div className="flex flex-wrap gap-2">
                  {INTERESTS.map(interest => (
                    <button
                      key={interest}
                      onClick={() => toggleInterest(interest)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${form.interests.includes(interest) ? "bg-primary text-primary-foreground border-primary" : "bg-muted/60 border-border hover:bg-muted"}`}
                      data-testid={`interest-${interest.toLowerCase()}`}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-4 text-center py-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-cyan-400 flex items-center justify-center mx-auto">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-xl font-bold">Ready to create your trip!</h2>
                <div className="text-left glass-card rounded-2xl p-5 space-y-2">
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Destination</span><span className="font-semibold">{form.destination}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Dates</span><span className="font-semibold">{form.startDate} → {form.endDate}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Budget</span><span className="font-semibold">${form.budget.toLocaleString()}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Interests</span><span className="font-semibold">{form.interests.join(", ")}</span></div>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-2 text-left">Additional Notes</label>
                  <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Any special requirements or notes..." className="w-full h-20 px-4 py-3 rounded-xl bg-muted border border-border focus:border-primary outline-none text-sm resize-none" data-testid="input-notes" />
                </div>
              </div>
            )}
          </div>

          {/* Step Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t border-border/50">
            <button onClick={() => step === 1 ? setShowWizard(false) : setStep(s => s - 1)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-muted hover:bg-muted/80 text-sm font-medium transition-colors" data-testid="step-back">
              <ChevronLeft className="w-4 h-4" />
              {step === 1 ? "Cancel" : "Back"}
            </button>
            {step < 5 ? (
              <button disabled={!canNext()} onClick={() => setStep(s => s + 1)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-40 transition-opacity" data-testid="step-next">
                Next <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button disabled={createMutation.isPending} onClick={handleCreate} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary to-cyan-500 text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity" data-testid="create-trip-btn">
                <Sparkles className="w-4 h-4" />
                {createMutation.isPending ? "Creating..." : "Create Trip"}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Existing Trips */}
      <div>
        <h2 className="text-lg font-semibold mb-5">Your Trips</h2>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-2xl" />)}
          </div>
        ) : trips && trips.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {trips.map((trip) => (
              <div key={trip.id} className="glass-card rounded-2xl overflow-hidden group hover:shadow-xl transition-all duration-300" data-testid={`trip-card-${trip.id}`}>
                {trip.coverImageUrl && (
                  <div className="h-36 overflow-hidden">
                    <img src={trip.coverImageUrl} alt={trip.destination} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                )}
                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-bold text-lg leading-tight">{trip.title}</h3>
                      <p className="text-muted-foreground text-sm flex items-center gap-1 mt-0.5">
                        <Plane className="w-3 h-3" />
                        {trip.destination}
                      </p>
                    </div>
                    <Badge variant={trip.status === "upcoming" ? "default" : trip.status === "completed" ? "secondary" : "outline"} className="capitalize">
                      {trip.status}
                    </Badge>
                  </div>
                  <div className="flex gap-4 text-xs text-muted-foreground mt-3">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{trip.startDate} – {trip.endDate}</span>
                    <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />${trip.budget.toLocaleString()}</span>
                  </div>
                  {trip.interests && trip.interests.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {trip.interests.slice(0, 3).map(i => (
                        <span key={i} className="text-xs bg-muted/60 text-muted-foreground px-2 py-0.5 rounded-full">{i}</span>
                      ))}
                    </div>
                  )}
                  <div className="flex justify-end mt-4 pt-3 border-t border-border/50">
                    <button onClick={() => handleDelete(trip.id)} className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1 transition-colors" data-testid={`delete-trip-${trip.id}`}>
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-muted-foreground border border-dashed border-border/60 rounded-2xl">
            <Plane className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-lg font-medium">No trips planned yet</p>
            <p className="text-sm mt-1">Hit "New Trip" above to start planning your first adventure</p>
          </div>
        )}
      </div>
    </div>
  );
}
