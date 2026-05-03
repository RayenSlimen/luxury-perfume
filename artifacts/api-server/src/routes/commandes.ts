import { Router, type IRouter } from "express";
import { db, commandesTable, commandeItemsTable, panierItemsTable, produitsTable, utilisateursTable } from "@workspace/db";
import { eq, desc, inArray } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

async function buildCommande(commandeId: number) {
  const [commande] = await db
    .select()
    .from(commandesTable)
    .where(eq(commandesTable.id, commandeId));

  if (!commande) return null;

  let user = undefined;
  if (commande.userId) {
    const [u] = await db
      .select()
      .from(utilisateursTable)
      .where(eq(utilisateursTable.id, commande.userId));
    if (u) user = { id: u.id, nom: u.nom, email: u.email, role: u.role, createdAt: u.createdAt };
  }

  const items = await db
    .select()
    .from(commandeItemsTable)
    .innerJoin(produitsTable, eq(commandeItemsTable.produitId, produitsTable.id))
    .where(eq(commandeItemsTable.commandeId, commandeId));

  return {
    id: commande.id,
    userId: commande.userId ?? 0,
    total: parseFloat(commande.total),
    statut: commande.statut,
    nomLivraison: commande.nomLivraison ?? undefined,
    telephone: commande.telephone ?? undefined,
    adresse: commande.adresse ?? undefined,
    wilaya: commande.wilaya ?? undefined,
    createdAt: commande.createdAt,
    utilisateur: user,
    items: items.map((row) => ({
      id: row.commande_items.id,
      produitId: row.commande_items.produitId,
      quantite: row.commande_items.quantite,
      prixUnitaire: parseFloat(row.commande_items.prixUnitaire),
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
    })),
  };
}

router.get("/commandes", requireAuth, async (req, res): Promise<void> => {
  const commandes = await db
    .select()
    .from(commandesTable)
    .where(eq(commandesTable.userId, req.user!.id))
    .orderBy(desc(commandesTable.createdAt));

  const results = await Promise.all(commandes.map((c) => buildCommande(c.id)));
  res.json(results.filter(Boolean));
});

router.post("/commandes", async (req, res): Promise<void> => {
  const { nomLivraison, telephone, adresse, wilaya, items } = req.body as {
    nomLivraison?: string;
    telephone?: string;
    adresse?: string;
    wilaya?: string;
    items?: { produitId: number; quantite: number }[];
  };

  if (!nomLivraison || !telephone || !adresse || !wilaya) {
    res.status(400).json({ message: "Informations de livraison incomplètes" });
    return;
  }

  // Determine userId if authenticated
  const userId: number | null = (req as any).user?.id ?? null;

  // Get items: from body (guest) or DB cart (logged-in)
  let orderItems: { produitId: number; quantite: number }[] = [];

  if (items && items.length > 0) {
    orderItems = items;
  } else if (userId) {
    const panierItems = await db
      .select()
      .from(panierItemsTable)
      .where(eq(panierItemsTable.userId, userId));
    orderItems = panierItems.map((p) => ({ produitId: p.produitId, quantite: p.quantite }));
  }

  if (orderItems.length === 0) {
    res.status(400).json({ message: "Votre panier est vide" });
    return;
  }

  // Fetch real prices from DB
  const produitIds = orderItems.map((i) => i.produitId);
  const produits = await db
    .select()
    .from(produitsTable)
    .where(inArray(produitsTable.id, produitIds));

  const prixMap: Record<number, number> = {};
  for (const p of produits) prixMap[p.id] = parseFloat(p.prix);

  const total = orderItems.reduce(
    (sum, item) => sum + (prixMap[item.produitId] ?? 0) * item.quantite,
    0
  );

  const [commande] = await db
    .insert(commandesTable)
    .values({
      userId: userId ?? undefined,
      total: String(total),
      statut: "en_attente",
      nomLivraison,
      telephone,
      adresse,
      wilaya,
    })
    .returning();

  await db.insert(commandeItemsTable).values(
    orderItems.map((item) => ({
      commandeId: commande.id,
      produitId: item.produitId,
      quantite: item.quantite,
      prixUnitaire: String(prixMap[item.produitId] ?? 0),
    }))
  );

  // Clear server cart if logged in
  if (userId) {
    await db.delete(panierItemsTable).where(eq(panierItemsTable.userId, userId));
  }

  const result = await buildCommande(commande.id);
  res.status(201).json(result);
});

router.get("/commandes/:id", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);

  if (isNaN(id)) {
    res.status(400).json({ message: "ID invalide" });
    return;
  }

  const commande = await buildCommande(id);

  if (!commande || commande.userId !== req.user!.id) {
    res.status(404).json({ message: "Commande introuvable" });
    return;
  }

  res.json(commande);
});

export default router;
