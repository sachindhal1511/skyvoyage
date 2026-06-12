import { useState } from "react";
import { useGetTrips, useGetPackingList, useCreatePackingItem, useUpdatePackingItem, useDeletePackingItem, getGetPackingListQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Briefcase, Plus, Trash2, CheckCircle2, Circle, ShoppingBag } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const CATEGORIES = ["Clothes", "Electronics", "Documents", "Health", "Accessories", "Other"];

const CATEGORY_COLORS: Record<string, string> = {
  Clothes: "from-pink-500 to-rose-600",
  Electronics: "from-blue-500 to-indigo-600",
  Documents: "from-amber-500 to-orange-600",
  Health: "from-emerald-500 to-teal-600",
  Accessories: "from-violet-500 to-purple-600",
  Other: "from-slate-500 to-gray-600",
};

export default function Packing() {
  const { data: trips } = useGetTrips();
  const [selectedTripId, setSelectedTripId] = useState<number | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ name: "", category: "Clothes", quantity: "1" });
  const queryClient = useQueryClient();

  const tripId = selectedTripId ?? trips?.[0]?.id ?? null;

  const { data: items, isLoading } = useGetPackingList(tripId!, {
    query: { enabled: !!tripId, queryKey: getGetPackingListQueryKey(tripId!) }
  });

  const createMutation = useCreatePackingItem();
  const updateMutation = useUpdatePackingItem();
  const deleteMutation = useDeletePackingItem();

  const packedCount = items?.filter(i => i.isPacked).length ?? 0;
  const totalCount = items?.length ?? 0;
  const progress = totalCount > 0 ? Math.round((packedCount / totalCount) * 100) : 0;

  function handleToggle(itemId: number, isPacked: boolean) {
    if (!tripId) return;
    updateMutation.mutate({ tripId, itemId, data: { isPacked: !isPacked } }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetPackingListQueryKey(tripId) })
    });
  }

  function handleDelete(itemId: number) {
    if (!tripId) return;
    deleteMutation.mutate({ tripId, itemId }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetPackingListQueryKey(tripId) });
        toast.success("Item removed from packing list");
      }
    });
  }

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!tripId) return;
    createMutation.mutate({
      tripId,
      data: { name: form.name, category: form.category, quantity: parseInt(form.quantity) || 1, isCustom: true }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetPackingListQueryKey(tripId) });
        setAddOpen(false);
        setForm({ name: "", category: "Clothes", quantity: "1" });
        toast.success("Item added to packing list");
      }
    });
  }

  const grouped = CATEGORIES.reduce((acc, cat) => {
    const catItems = (items ?? []).filter(i => i.category === cat);
    if (catItems.length > 0) acc[cat] = catItems;
    return acc;
  }, {} as Record<string, typeof items>);

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Packing Assistant</h1>
          <p className="text-muted-foreground mt-1">Never forget a thing on your next adventure</p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity" data-testid="add-packing-btn">
              <Plus className="w-4 h-4" />
              Add Item
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Packing Item</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4 mt-2">
              <div>
                <label className="text-sm font-medium block mb-1">Item Name</label>
                <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Sunscreen SPF 50" className="w-full h-10 px-3 rounded-lg bg-muted border border-border focus:border-primary outline-none text-sm" data-testid="input-item-name" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium block mb-1">Category</label>
                  <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                    <SelectTrigger data-testid="select-category"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Quantity</label>
                  <input type="number" min="1" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} className="w-full h-10 px-3 rounded-lg bg-muted border border-border focus:border-primary outline-none text-sm" data-testid="input-quantity" />
                </div>
              </div>
              <button type="submit" disabled={createMutation.isPending} className="w-full h-10 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity" data-testid="submit-add-packing">
                {createMutation.isPending ? "Adding..." : "Add Item"}
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
              data-testid={`trip-select-${trip.id}`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              {trip.title}
            </button>
          ))}
        </div>
      )}

      {/* Progress */}
      {tripId && totalCount > 0 && (
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-semibold">Packing Progress</h3>
              <p className="text-sm text-muted-foreground mt-0.5">{packedCount} of {totalCount} items packed</p>
            </div>
            <div className="text-3xl font-bold text-primary">{progress}%</div>
          </div>
          <Progress value={progress} className="h-3" data-testid="packing-progress" />
          {progress === 100 && (
            <p className="text-sm text-emerald-500 font-medium mt-3 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              All packed and ready to go!
            </p>
          )}
        </div>
      )}

      {/* Packing List */}
      {!tripId ? (
        <div className="text-center py-16 text-muted-foreground">
          <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium">No trips selected</p>
          <p className="text-sm mt-1">Select a trip to view its packing list</p>
        </div>
      ) : isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}
        </div>
      ) : Object.keys(grouped).length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium">Packing list is empty</p>
          <p className="text-sm mt-1">Add items to start preparing for your trip</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([category, catItems]) => {
            if (!catItems || catItems.length === 0) return null;
            const catPacked = catItems.filter(i => i.isPacked).length;
            return (
              <div key={category} className="glass-card rounded-2xl overflow-hidden">
                <div className="flex items-center gap-3 p-5 border-b border-border/50">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${CATEGORY_COLORS[category] ?? "from-slate-500 to-gray-600"} flex items-center justify-center`}>
                    <Briefcase className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="font-semibold">{category}</h3>
                  <span className="text-xs text-muted-foreground ml-auto">{catPacked}/{catItems.length} packed</span>
                </div>
                <div className="divide-y divide-border/30">
                  {catItems.map((item) => (
                    <div key={item.id} className={`flex items-center gap-4 px-5 py-3.5 group transition-colors hover:bg-muted/30 ${item.isPacked ? "opacity-60" : ""}`} data-testid={`packing-item-${item.id}`}>
                      <button onClick={() => handleToggle(item.id, item.isPacked)} className="flex-shrink-0 text-primary hover:scale-110 transition-transform" data-testid={`toggle-item-${item.id}`}>
                        {item.isPacked ? <CheckCircle2 className="w-5 h-5 fill-primary" /> : <Circle className="w-5 h-5" />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${item.isPacked ? "line-through text-muted-foreground" : ""}`}>{item.name}</p>
                        {item.quantity && item.quantity > 1 && (
                          <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                        )}
                      </div>
                      {item.isCustom && (
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">custom</span>
                      )}
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg hover:bg-destructive/10 hover:text-destructive flex items-center justify-center transition-all flex-shrink-0"
                        data-testid={`delete-packing-${item.id}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
