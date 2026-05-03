import { pgTable, text, serial, timestamp, numeric, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const produitsTable = pgTable("produits", {
  id: serial("id").primaryKey(),
  nom: text("nom").notNull(),
  description: text("description").notNull(),
  prix: numeric("prix", { precision: 10, scale: 2 }).notNull(),
  imageUrl: text("image_url").notNull(),
  categorie: text("categorie").notNull().default("unisexe"),
  enVedette: boolean("en_vedette").notNull().default(false),
  nombreVentes: integer("nombre_ventes").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertProduitSchema = createInsertSchema(produitsTable).omit({
  id: true,
  nombreVentes: true,
  createdAt: true,
});
export type InsertProduit = z.infer<typeof insertProduitSchema>;
export type Produit = typeof produitsTable.$inferSelect;
