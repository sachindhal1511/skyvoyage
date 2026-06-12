import { pgTable, serial, text, real, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const itineraryItemsTable = pgTable("itinerary_items", {
  id: serial("id").primaryKey(),
  tripId: integer("trip_id").notNull(),
  date: text("date").notNull(),
  timeOfDay: text("time_of_day").notNull(),
  type: text("type").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  location: text("location"),
  duration: integer("duration").notNull().default(60),
  cost: real("cost"),
  notes: text("notes"),
});

export const insertItineraryItemSchema = createInsertSchema(itineraryItemsTable).omit({ id: true });
export type InsertItineraryItem = z.infer<typeof insertItineraryItemSchema>;
export type ItineraryItem = typeof itineraryItemsTable.$inferSelect;
