import { Router, type IRouter } from "express";
import { GetAiSuggestionsQueryParams } from "@workspace/api-zod";

const router: IRouter = Router();

const suggestions = [
  {
    id: 1,
    category: "weather",
    message: "Weather looks ideal for beach activities in Bali this week. Expect sunny skies and 30°C temperatures.",
    confidence: 0.95,
    actionLabel: "View Bali forecast",
    actionUrl: "/weather?city=bali",
    icon: "sun",
  },
  {
    id: 2,
    category: "packing",
    message: "Based on your Bali trip, pack light breathable clothing. Rainy season starts in November — bring a light rain jacket.",
    confidence: 0.88,
    actionLabel: "Open packing list",
    actionUrl: "/packing",
    icon: "backpack",
  },
  {
    id: 3,
    category: "budget",
    message: "Bali is 40% cheaper than European destinations. Your $2,000 budget comfortably covers 10 days including accommodation and activities.",
    confidence: 0.91,
    actionLabel: "View cost breakdown",
    actionUrl: "/analytics",
    icon: "wallet",
  },
  {
    id: 4,
    category: "timing",
    message: "Best time to visit Japan is March-April (cherry blossoms) or October-November. Avoid Golden Week crowds in early May.",
    confidence: 0.93,
    actionLabel: "Explore Japan",
    actionUrl: "/destinations?search=japan",
    icon: "calendar",
  },
  {
    id: 5,
    category: "destination",
    message: "Based on your love for beaches and warm weather, you might enjoy Santorini, Maldives, or Phuket as your next destination.",
    confidence: 0.82,
    actionLabel: "Explore destinations",
    actionUrl: "/destinations?category=beach",
    icon: "map-pin",
  },
  {
    id: 6,
    category: "alert",
    message: "Heavy rainfall expected in Southeast Asia next week. Consider travel insurance for trips to Thailand or Vietnam.",
    confidence: 0.89,
    actionLabel: "Check weather",
    actionUrl: "/weather",
    icon: "cloud-rain",
  },
];

router.get("/ai/suggestions", async (req, res): Promise<void> => {
  const parsed = GetAiSuggestionsQueryParams.safeParse(req.query);
  const context = parsed.success && parsed.data.context ? parsed.data.context.toLowerCase() : "";

  let filtered = suggestions;
  if (context) {
    filtered = suggestions.filter(s =>
      s.message.toLowerCase().includes(context) ||
      s.category.toLowerCase().includes(context)
    );
    if (filtered.length === 0) filtered = suggestions.slice(0, 3);
  }

  res.json(filtered);
});

export default router;
