import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, packingItemsTable } from "@workspace/db";
import {
  GetPackingListParams,
  CreatePackingItemParams,
  CreatePackingItemBody,
  UpdatePackingItemParams,
  UpdatePackingItemBody,
  DeletePackingItemParams,
  GetPackingListResponseItem,
  UpdatePackingItemResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/trips/:tripId/packing", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.tripId) ? req.params.tripId[0] : req.params.tripId;
  const params = GetPackingListParams.safeParse({ tripId: parseInt(rawId, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const rows = await db.select().from(packingItemsTable).where(eq(packingItemsTable.tripId, params.data.tripId));
  res.json(rows.map(item => GetPackingListResponseItem.parse(item)));
});

router.post("/trips/:tripId/packing", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.tripId) ? req.params.tripId[0] : req.params.tripId;
  const params = CreatePackingItemParams.safeParse({ tripId: parseInt(rawId, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = CreatePackingItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [item] = await db.insert(packingItemsTable).values({
    tripId: params.data.tripId,
    name: parsed.data.name,
    category: parsed.data.category,
    quantity: parsed.data.quantity ?? null,
    isCustom: parsed.data.isCustom ?? false,
    isPacked: false,
  }).returning();

  res.status(201).json(GetPackingListResponseItem.parse(item));
});

router.patch("/trips/:tripId/packing/:itemId", async (req, res): Promise<void> => {
  const rawTripId = Array.isArray(req.params.tripId) ? req.params.tripId[0] : req.params.tripId;
  const rawItemId = Array.isArray(req.params.itemId) ? req.params.itemId[0] : req.params.itemId;
  const params = UpdatePackingItemParams.safeParse({ tripId: parseInt(rawTripId, 10), itemId: parseInt(rawItemId, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdatePackingItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [item] = await db.update(packingItemsTable).set(parsed.data).where(
    and(eq(packingItemsTable.tripId, params.data.tripId), eq(packingItemsTable.id, params.data.itemId))
  ).returning();

  if (!item) {
    res.status(404).json({ error: "Packing item not found" });
    return;
  }

  res.json(UpdatePackingItemResponse.parse(item));
});

router.delete("/trips/:tripId/packing/:itemId", async (req, res): Promise<void> => {
  const rawTripId = Array.isArray(req.params.tripId) ? req.params.tripId[0] : req.params.tripId;
  const rawItemId = Array.isArray(req.params.itemId) ? req.params.itemId[0] : req.params.itemId;
  const params = DeletePackingItemParams.safeParse({ tripId: parseInt(rawTripId, 10), itemId: parseInt(rawItemId, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  await db.delete(packingItemsTable).where(
    and(eq(packingItemsTable.tripId, params.data.tripId), eq(packingItemsTable.id, params.data.itemId))
  );

  res.sendStatus(204);
});

export default router;
