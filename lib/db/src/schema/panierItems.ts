import { pgTable, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { utilisateursTable } from "./utilisateurs";
import { produitsTable } from "./produits";

export const panierItemsTable = pgTable("panier_items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => utilisateursTable.id, { onDelete: "cascade" }),
  produitId: integer("produit_id")
    .notNull()
    .references(() => produitsTable.id, { onDelete: "cascade" }),
  quantite: integer("quantite").notNull().default(1),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertPanierItemSchema = createInsertSchema(panierItemsTable).omit({
  id: true,
  createdAt: true,
});
export type InsertPanierItem = z.infer<typeof insertPanierItemSchema>;
export type PanierItem = typeof panierItemsTable.$inferSelect;
