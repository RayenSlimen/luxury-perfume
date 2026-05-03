import { Router, type IRouter } from "express";
import { db, commandesTable, commandeItemsTable, panierItemsTable, produitsTable, utilisateursTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

async function buildCommande(commandeId: number) {
  const [commande] = await db
    .select()
    .from(commandesTable)
    .where(eq(commandesTable.id, commandeId));

  if (!commande) return null;

  const [user] = await db
    .select()
    .from(utilisateursTable)
    .where(eq(utilisateursTable.id, commande.userId));

  const items = await db
    .select()
    .from(commandeItemsTable)
    .innerJoin(produitsTable, eq(commandeItemsTable.produitId, produitsTable.id))
    .where(eq(commandeItemsTable.commandeId, commandeId));

  return {
    id: commande.id,
    userId: commande.userId,
    total: parseFloat(commande.total),
    statut: commande.statut,
    nomLivraison: commande.nomLivraison ?? undefined,
    telephone: commande.telephone ?? undefined,
    adresse: commande.adresse ?? undefined,
    wilaya: commande.wilaya ?? undefined,
    createdAt: commande.createdAt,
    utilisateur: user
      ? { id: user.id, nom: user.nom, email: user.email, role: user.role, createdAt: user.createdAt }
      : undefined,
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

router.post("/commandes", requireAuth, async (req, res): Promise<void> => {
  const userId = req.user!.id;
  const { nomLivraison, telephone, adresse, wilaya } = req.body as {
    nomLivraison?: string;
    telephone?: string;
    adresse?: string;
    wilaya?: string;
  };

  if (!nomLivraison || !telephone || !adresse || !wilaya) {
    res.status(400).json({ message: "Informations de livraison incomplètes" });
    return;
  }

  const panierItems = await db
    .select()
    .from(panierItemsTable)
    .innerJoin(produitsTable, eq(panierItemsTable.produitId, produitsTable.id))
    .where(eq(panierItemsTable.userId, userId));

  if (panierItems.length === 0) {
    res.status(400).json({ message: "Votre panier est vide" });
    return;
  }

  const total = panierItems.reduce(
    (sum, row) => sum + parseFloat(row.produits.prix) * row.panier_items.quantite,
    0
  );

  const [commande] = await db
    .insert(commandesTable)
    .values({ userId, total: String(total), statut: "en_attente", nomLivraison, telephone, adresse, wilaya })
    .returning();

  await db.insert(commandeItemsTable).values(
    panierItems.map((row) => ({
      commandeId: commande.id,
      produitId: row.panier_items.produitId,
      quantite: row.panier_items.quantite,
      prixUnitaire: row.produits.prix,
    }))
  );

  await db.delete(panierItemsTable).where(eq(panierItemsTable.userId, userId));

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
