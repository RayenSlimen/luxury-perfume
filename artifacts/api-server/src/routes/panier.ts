import { Router, type IRouter } from "express";
import { db, panierItemsTable, produitsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

async function buildPanier(userId: number) {
  const items = await db
    .select()
    .from(panierItemsTable)
    .innerJoin(produitsTable, eq(panierItemsTable.produitId, produitsTable.id))
    .where(eq(panierItemsTable.userId, userId));

  const formatted = items.map((row) => ({
    produitId: row.panier_items.produitId,
    quantite: row.panier_items.quantite,
    produit: {
      id: row.produits.id,
      nom: row.produits.nom,
      description: row.produits.description,
      prix: parseFloat(row.produits.prix),
      imageUrl: row.produits.imageUrl,
      categorie: row.produits.categorie,
      enVedette: row.produits.enVedette,
      nombreVentes: row.produits.nombreVentes,
      createdAt: row.produits.createdAt,
    },
  }));

  const total = formatted.reduce((sum, item) => sum + item.produit.prix * item.quantite, 0);
  const nombreArticles = formatted.reduce((sum, item) => sum + item.quantite, 0);

  return { items: formatted, total, nombreArticles };
}

router.get("/panier", requireAuth, async (req, res): Promise<void> => {
  const panier = await buildPanier(req.user!.id);
  res.json(panier);
});

router.post("/panier", requireAuth, async (req, res): Promise<void> => {
  const { produitId, quantite = 1 } = req.body;
  const userId = req.user!.id;

  if (!produitId) {
    res.status(400).json({ message: "produitId requis" });
    return;
  }

  const [existing] = await db
    .select()
    .from(panierItemsTable)
    .where(and(eq(panierItemsTable.userId, userId), eq(panierItemsTable.produitId, produitId)));

  if (existing) {
    await db
      .update(panierItemsTable)
      .set({ quantite: existing.quantite + quantite })
      .where(eq(panierItemsTable.id, existing.id));
  } else {
    await db.insert(panierItemsTable).values({ userId, produitId, quantite });
  }

  const panier = await buildPanier(userId);
  res.json(panier);
});

router.put("/panier/:produitId", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.produitId) ? req.params.produitId[0] : req.params.produitId;
  const produitId = parseInt(raw, 10);
  const userId = req.user!.id;
  const { quantite } = req.body;

  if (isNaN(produitId)) {
    res.status(400).json({ message: "ID invalide" });
    return;
  }

  if (quantite === 0) {
    await db
      .delete(panierItemsTable)
      .where(and(eq(panierItemsTable.userId, userId), eq(panierItemsTable.produitId, produitId)));
  } else {
    await db
      .update(panierItemsTable)
      .set({ quantite })
      .where(and(eq(panierItemsTable.userId, userId), eq(panierItemsTable.produitId, produitId)));
  }

  const panier = await buildPanier(userId);
  res.json(panier);
});

router.delete("/panier/:produitId", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.produitId) ? req.params.produitId[0] : req.params.produitId;
  const produitId = parseInt(raw, 10);
  const userId = req.user!.id;

  if (isNaN(produitId)) {
    res.status(400).json({ message: "ID invalide" });
    return;
  }

  await db
    .delete(panierItemsTable)
    .where(and(eq(panierItemsTable.userId, userId), eq(panierItemsTable.produitId, produitId)));

  const panier = await buildPanier(userId);
  res.json(panier);
});

router.delete("/panier", requireAuth, async (req, res): Promise<void> => {
  await db
    .delete(panierItemsTable)
    .where(eq(panierItemsTable.userId, req.user!.id));

  res.json({ success: true, message: "Panier vidé" });
});

export default router;
