import { pgTable, serial, text, real, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const tripsTable = pgTable("trips", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  destination: text("destination").notNull(),
  destinationId: integer("destination_id"),
  startDate: text("start_date").notNull(),
  endDate: text("end_date").notNull(),
  budget: real("budget").notNull(),
  status: text("status").notNull().default("planning"),
  interests: jsonb("interests").$type<string[]>().default([]),
  notes: text("notes"),
  coverImageUrl: text("cover_image_url"),
  estimatedSpend: real("estimated_spend"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertTripSchema = createInsertSchema(tripsTable).omit({ id: true, createdAt: true });
export type InsertTrip = z.infer<typeof insertTripSchema>;
export type Trip = typeof tripsTable.$inferSelect;
