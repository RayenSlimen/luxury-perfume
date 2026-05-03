import app from "./app";
import { logger } from "./lib/logger";
import { db, utilisateursTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

async function seedAdmin() {
  try {
    const adminEmail = "admin@velmora.fr";
    const adminPassword = "admin123";

    const existing = await db
      .select()
      .from(utilisateursTable)
      .where(eq(utilisateursTable.email, adminEmail))
      .limit(1);

    const hash = await bcrypt.hash(adminPassword, 12);

    if (existing.length === 0) {
      await db.insert(utilisateursTable).values({
        nom: "Administrateur Velmora",
        email: adminEmail,
        motDePasse: hash,
        role: "admin",
      });
      logger.info("Admin user created");
    } else {
      await db
        .update(utilisateursTable)
        .set({ motDePasse: hash })
        .where(eq(utilisateursTable.email, adminEmail));
      logger.info("Admin password updated");
    }

    const clientEmail = "sophie@example.fr";
    const existingClient = await db
      .select()
      .from(utilisateursTable)
      .where(eq(utilisateursTable.email, clientEmail))
      .limit(1);

    if (existingClient.length === 0) {
      const clientHash = await bcrypt.hash(adminPassword, 12);
      await db.insert(utilisateursTable).values({
        nom: "Sophie Laurent",
        email: clientEmail,
        motDePasse: clientHash,
        role: "client",
      });
      logger.info("Client user created");
    } else {
      const clientHash = await bcrypt.hash(adminPassword, 12);
      await db
        .update(utilisateursTable)
        .set({ motDePasse: clientHash })
        .where(eq(utilisateursTable.email, clientEmail));
      logger.info("Client password updated");
    }
  } catch (err) {
    logger.error({ err }, "Seed error (non-fatal)");
  }
}

app.listen(port, async (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
  await seedAdmin();
});
