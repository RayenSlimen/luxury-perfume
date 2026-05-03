import { Router, type IRouter } from "express";
import { db, produitsTable } from "@workspace/db";
import { eq, ilike, and, gte, lte, sql } from "drizzle-orm";
import { requireAdmin } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/produits", async (req, res): Promise<void> => {
  const { recherche, categorie, prixMin, prixMax, page = "1", limite = "12" } = req.query as Record<string, string>;

  const conditions = [];

  if (recherche) {
    conditions.push(ilike(produitsTable.nom, `%${recherche}%`));
  }
  if (categorie) {
    conditions.push(eq(produitsTable.categorie, categorie));
  }
  if (prixMin) {
    conditions.push(gte(produitsTable.prix, prixMin));
  }
  if (prixMax) {
    conditions.push(lte(produitsTable.prix, prixMax));
  }

  const pageNum = Math.max(1, parseInt(page, 10));
  const limiteNum = Math.min(50, Math.max(1, parseInt(limite, 10)));
  const offset = (pageNum - 1) * limiteNum;

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [produits, countResult] = await Promise.all([
    db
      .select()
      .from(produitsTable)
      .where(where)
      .limit(limiteNum)
      .offset(offset)
      .orderBy(produitsTable.createdAt),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(produitsTable)
      .where(where),
  ]);

  const total = countResult[0]?.count ?? 0;

  res.json({
    produits: produits.map(formatProduit),
    total,
    page: pageNum,
    totalPages: Math.ceil(total / limiteNum),
  });
});

router.get("/produits/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);

  if (isNaN(id)) {
    res.status(400).json({ message: "ID invalide" });
    return;
  }

  const [produit] = await db.select().from(produitsTable).where(eq(produitsTable.id, id));

  if (!produit) {
    res.status(404).json({ message: "Parfum introuvable" });
    return;
  }

  res.json(formatProduit(produit));
});

router.get("/produits/:id/similaires", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);

  if (isNaN(id)) {
    res.status(400).json({ message: "ID invalide" });
    return;
  }

  const [produit] = await db.select().from(produitsTable).where(eq(produitsTable.id, id));

  if (!produit) {
    res.status(404).json({ message: "Parfum introuvable" });
    return;
  }

  const similaires = await db
    .select()
    .from(produitsTable)
    .where(and(eq(produitsTable.categorie, produit.categorie), sql`${produitsTable.id} != ${id}`))
    .limit(4);

  res.json(similaires.map(formatProduit));
});

router.post("/produits", requireAdmin, async (req, res): Promise<void> => {
  const { nom, description, prix, imageUrl, categorie, enVedette = false } = req.body;

  if (!nom || !description || prix == null || !imageUrl || !categorie) {
    res.status(400).json({ message: "Tous les champs obligatoires sont requis" });
    return;
  }

  const [produit] = await db
    .insert(produitsTable)
    .values({ nom, description, prix: String(prix), imageUrl, categorie, enVedette })
    .returning();

  res.status(201).json(formatProduit(produit));
});

router.put("/produits/:id", requireAdmin, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);

  if (isNaN(id)) {
    res.status(400).json({ message: "ID invalide" });
    return;
  }

  const { nom, description, prix, imageUrl, categorie, enVedette } = req.body;

  const updates: Record<string, unknown> = {};
  if (nom !== undefined) updates.nom = nom;
  if (description !== undefined) updates.description = description;
  if (prix !== undefined) updates.prix = String(prix);
  if (imageUrl !== undefined) updates.imageUrl = imageUrl;
  if (categorie !== undefined) updates.categorie = categorie;
  if (enVedette !== undefined) updates.enVedette = enVedette;

  const [produit] = await db
    .update(produitsTable)
    .set(updates)
    .where(eq(produitsTable.id, id))
    .returning();

  if (!produit) {
    res.status(404).json({ message: "Parfum introuvable" });
    return;
  }

  res.json(formatProduit(produit));
});

router.delete("/produits/:id", requireAdmin, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);

  if (isNaN(id)) {
    res.status(400).json({ message: "ID invalide" });
    return;
  }

  const [produit] = await db.delete(produitsTable).where(eq(produitsTable.id, id)).returning();

  if (!produit) {
    res.status(404).json({ message: "Parfum introuvable" });
    return;
  }

  res.json({ success: true, message: "Parfum supprimé avec succès" });
});

function formatProduit(p: typeof produitsTable.$inferSelect) {
  return {
    id: p.id,
    nom: p.nom,
    description: p.description,
    prix: parseFloat(p.prix),
    imageUrl: p.imageUrl,
    categorie: p.categorie,
    enVedette: p.enVedette,
    nombreVentes: p.nombreVentes,
    createdAt: p.createdAt,
  };
}

export default router;
