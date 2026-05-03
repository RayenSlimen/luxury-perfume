import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { db, utilisateursTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, signToken } from "../middlewares/auth";

const router: IRouter = Router();

router.post("/auth/inscription", async (req, res): Promise<void> => {
  const { nom, email, motDePasse } = req.body;

  if (!nom || !email || !motDePasse) {
    res.status(400).json({ message: "Tous les champs sont requis" });
    return;
  }

  if (motDePasse.length < 6) {
    res.status(400).json({ message: "Le mot de passe doit contenir au moins 6 caractères" });
    return;
  }

  const existing = await db
    .select()
    .from(utilisateursTable)
    .where(eq(utilisateursTable.email, email));

  if (existing.length > 0) {
    res.status(409).json({ message: "Un compte avec cet email existe déjà" });
    return;
  }

  const hash = await bcrypt.hash(motDePasse, 12);
  const [user] = await db
    .insert(utilisateursTable)
    .values({ nom, email, motDePasse: hash, role: "client" })
    .returning();

  const token = signToken({ id: user.id, email: user.email, role: user.role });

  res.status(201).json({
    token,
    utilisateur: {
      id: user.id,
      nom: user.nom,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    },
  });
});

router.post("/auth/connexion", async (req, res): Promise<void> => {
  const { email, motDePasse } = req.body;

  if (!email || !motDePasse) {
    res.status(400).json({ message: "Email et mot de passe requis" });
    return;
  }

  const [user] = await db
    .select()
    .from(utilisateursTable)
    .where(eq(utilisateursTable.email, email));

  if (!user) {
    res.status(401).json({ message: "Email ou mot de passe incorrect" });
    return;
  }

  const valid = await bcrypt.compare(motDePasse, user.motDePasse);
  if (!valid) {
    res.status(401).json({ message: "Email ou mot de passe incorrect" });
    return;
  }

  const token = signToken({ id: user.id, email: user.email, role: user.role });

  res.json({
    token,
    utilisateur: {
      id: user.id,
      nom: user.nom,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    },
  });
});

router.get("/auth/moi", requireAuth, async (req, res): Promise<void> => {
  const [user] = await db
    .select()
    .from(utilisateursTable)
    .where(eq(utilisateursTable.id, req.user!.id));

  if (!user) {
    res.status(401).json({ message: "Utilisateur introuvable" });
    return;
  }

  res.json({
    id: user.id,
    nom: user.nom,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  });
});

export default router;
