import { Router, type IRouter } from "express";
import { db, produitsTable } from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";

const router: IRouter = Router();

router.get("/catalogue/vedettes", async (_req, res): Promise<void> => {
  const produits = await db
    .select()
    .from(produitsTable)
    .where(eq(produitsTable.enVedette, true))
    .limit(6);

  res.json(
    produits.map((p) => ({
      id: p.id,
      nom: p.nom,
      description: p.description,
      prix: parseFloat(p.prix),
      imageUrl: p.imageUrl,
      categorie: p.categorie,
      enVedette: p.enVedette,
      nombreVentes: p.nombreVentes,
      createdAt: p.createdAt,
    }))
  );
});

router.get("/catalogue/meilleures-ventes", async (_req, res): Promise<void> => {
  const produits = await db
    .select()
    .from(produitsTable)
    .orderBy(desc(produitsTable.nombreVentes))
    .limit(6);

  res.json(
    produits.map((p) => ({
      id: p.id,
      nom: p.nom,
      description: p.description,
      prix: parseFloat(p.prix),
      imageUrl: p.imageUrl,
      categorie: p.categorie,
      enVedette: p.enVedette,
      nombreVentes: p.nombreVentes,
      createdAt: p.createdAt,
    }))
  );
});

router.get("/catalogue/stats", async (_req, res): Promise<void> => {
  const [total, homme, femme, unisexe] = await Promise.all([
    db.select({ count: sql<number>`count(*)::int` }).from(produitsTable),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(produitsTable)
      .where(eq(produitsTable.categorie, "homme")),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(produitsTable)
      .where(eq(produitsTable.categorie, "femme")),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(produitsTable)
      .where(eq(produitsTable.categorie, "unisexe")),
  ]);

  res.json({
    total: total[0]?.count ?? 0,
    parCategorie: {
      homme: homme[0]?.count ?? 0,
      femme: femme[0]?.count ?? 0,
      unisexe: unisexe[0]?.count ?? 0,
    },
  });
});

export default router;
