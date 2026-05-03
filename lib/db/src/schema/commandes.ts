import { pgTable, serial, integer, timestamp, numeric, text } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { utilisateursTable } from "./utilisateurs";
import { produitsTable } from "./produits";

export const commandesTable = pgTable("commandes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => utilisateursTable.id, { onDelete: "cascade" }),
  total: numeric("total", { precision: 10, scale: 2 }).notNull(),
  statut: text("statut").notNull().default("en_attente"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const commandeItemsTable = pgTable("commande_items", {
  id: serial("id").primaryKey(),
  commandeId: integer("commande_id")
    .notNull()
    .references(() => commandesTable.id, { onDelete: "cascade" }),
  produitId: integer("produit_id")
    .notNull()
    .references(() => produitsTable.id, { onDelete: "set null" }),
  quantite: integer("quantite").notNull(),
  prixUnitaire: numeric("prix_unitaire", { precision: 10, scale: 2 }).notNull(),
});

export const insertCommandeSchema = createInsertSchema(commandesTable).omit({
  id: true,
  createdAt: true,
});
export type InsertCommande = z.infer<typeof insertCommandeSchema>;
export type Commande = typeof commandesTable.$inferSelect;

export const insertCommandeItemSchema = createInsertSchema(commandeItemsTable).omit({
  id: true,
});
export type InsertCommandeItem = z.infer<typeof insertCommandeItemSchema>;
export type CommandeItem = typeof commandeItemsTable.$inferSelect;
