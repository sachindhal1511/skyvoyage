import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, itineraryItemsTable } from "@workspace/db";
import {
  GetItineraryParams,
  CreateItineraryItemParams,
  CreateItineraryItemBody,
  DeleteItineraryItemParams,
  GetItineraryResponseItem,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/trips/:tripId/itinerary", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.tripId) ? req.params.tripId[0] : req.params.tripId;
  const params = GetItineraryParams.safeParse({ tripId: parseInt(rawId, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const rows = await db.select().from(itineraryItemsTable).where(eq(itineraryItemsTable.tripId, params.data.tripId));
  res.json(rows.map(item => GetItineraryResponseItem.parse(item)));
});

router.post("/trips/:tripId/itinerary", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.tripId) ? req.params.tripId[0] : req.params.tripId;
  const params = CreateItineraryItemParams.safeParse({ tripId: parseInt(rawId, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = CreateItineraryItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [item] = await db.insert(itineraryItemsTable).values({
    tripId: params.data.tripId,
    ...parsed.data,
  }).returning();

  res.status(201).json(GetItineraryResponseItem.parse(item));
});

router.delete("/trips/:tripId/itinerary/:itemId", async (req, res): Promise<void> => {
  const rawTripId = Array.isArray(req.params.tripId) ? req.params.tripId[0] : req.params.tripId;
  const rawItemId = Array.isArray(req.params.itemId) ? req.params.itemId[0] : req.params.itemId;
  const params = DeleteItineraryItemParams.safeParse({ tripId: parseInt(rawTripId, 10), itemId: parseInt(rawItemId, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  await db.delete(itineraryItemsTable).where(
    and(eq(itineraryItemsTable.tripId, params.data.tripId), eq(itineraryItemsTable.id, params.data.itemId))
  );

  res.sendStatus(204);
});

export default router;
