import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const utilisateursTable = pgTable("utilisateurs", {
  id: serial("id").primaryKey(),
  nom: text("nom").notNull(),
  email: text("email").notNull().unique(),
  motDePasse: text("mot_de_passe").notNull(),
  role: text("role").notNull().default("client"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertUtilisateurSchema = createInsertSchema(utilisateursTable).omit({
  id: true,
  createdAt: true,
});
export type InsertUtilisateur = z.infer<typeof insertUtilisateurSchema>;
export type Utilisateur = typeof utilisateursTable.$inferSelect;
