import { Router, type IRouter } from "express";
import { db, commandesTable, commandeItemsTable, produitsTable, utilisateursTable } from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";
import { requireAdmin } from "../middlewares/auth";

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

router.get("/admin/commandes", requireAdmin, async (_req, res): Promise<void> => {
  const commandes = await db
    .select()
    .from(commandesTable)
    .orderBy(desc(commandesTable.createdAt));

  const results = await Promise.all(commandes.map((c) => buildCommande(c.id)));
  res.json(results.filter(Boolean));
});

router.put("/admin/commandes/:id/statut", requireAdmin, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);

  if (isNaN(id)) {
    res.status(400).json({ message: "ID invalide" });
    return;
  }

  const { statut } = req.body;
  const validStatuts = ["en_attente", "confirmee", "expediee", "livree", "annulee"];

  if (!validStatuts.includes(statut)) {
    res.status(400).json({ message: "Statut invalide" });
    return;
  }

  const [commande] = await db
    .update(commandesTable)
    .set({ statut })
    .where(eq(commandesTable.id, id))
    .returning();

  if (!commande) {
    res.status(404).json({ message: "Commande introuvable" });
    return;
  }

  const result = await buildCommande(commande.id);
  res.json(result);
});

router.get("/admin/stats", requireAdmin, async (_req, res): Promise<void> => {
  const [
    totalCommandesResult,
    chiffreResult,
    totalClientsResult,
    totalProduitsResult,
    statsParStatut,
    commandesRecentes,
  ] = await Promise.all([
    db.select({ count: sql<number>`count(*)::int` }).from(commandesTable),
    db.select({ sum: sql<number>`coalesce(sum(total::numeric), 0)::float` }).from(commandesTable),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(utilisateursTable)
      .where(eq(utilisateursTable.role, "client")),
    db.select({ count: sql<number>`count(*)::int` }).from(produitsTable),
    db
      .select({
        statut: commandesTable.statut,
        count: sql<number>`count(*)::int`,
      })
      .from(commandesTable)
      .groupBy(commandesTable.statut),
    db
      .select()
      .from(commandesTable)
      .orderBy(desc(commandesTable.createdAt))
      .limit(5),
  ]);

  const commandesParStatut = {
    en_attente: 0,
    confirmee: 0,
    expediee: 0,
    livree: 0,
    annulee: 0,
  } as Record<string, number>;

  for (const row of statsParStatut) {
    commandesParStatut[row.statut] = row.count;
  }

  const recentesBuilt = await Promise.all(commandesRecentes.map((c) => buildCommande(c.id)));

  res.json({
    totalCommandes: totalCommandesResult[0]?.count ?? 0,
    chiffreAffaires: chiffreResult[0]?.sum ?? 0,
    totalClients: totalClientsResult[0]?.count ?? 0,
    totalProduits: totalProduitsResult[0]?.count ?? 0,
    commandesParStatut,
    commandesRecentes: recentesBuilt.filter(Boolean),
  });
});

export default router;
