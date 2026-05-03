# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Full-stack luxury perfume e-commerce website — **Velmora**.

## Project: Velmora — Parfumerie de Luxe

A full-stack luxury perfume e-commerce website in French with a dark, gold-accented premium aesthetic inspired by Dior, Chanel, and Tom Ford.

### Features
- Complete French UI ("Ressentez la puissance de l'élégance")
- JWT authentication (login/register)
- Product catalogue with filters (category: homme/femme/unisexe, price, search)
- Product detail pages with similar products
- Dynamic shopping cart (guest localStorage + authenticated API sync)
- Order placement and order history
- Admin dashboard (stats, product CRUD, order status management)
- Dark luxury theme: deep black backgrounds, gold accents, serif editorial typography

### Seed credentials
- Admin: `admin@velmora.fr` / `admin123`
- Client: `sophie@example.fr` / `admin123`

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite + Tailwind CSS + Framer Motion + Wouter
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Auth**: JWT (jsonwebtoken) + bcryptjs
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Artifacts

| Artifact | Path | Description |
|----------|------|-------------|
| `velmora` | `/` | React + Vite frontend |
| `api-server` | `/api` | Express 5 REST API |

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)

## Database Schema

- `utilisateurs` — users (id, nom, email, mot_de_passe, role: client|admin)
- `produits` — perfumes (id, nom, description, prix, image_url, categorie, en_vedette, nombre_ventes)
- `panier_items` — cart items (id, user_id, produit_id, quantite)
- `commandes` — orders (id, user_id, total, statut: en_attente|confirmee|expediee|livree|annulee)
- `commande_items` — order line items (id, commande_id, produit_id, quantite, prix_unitaire)

## API Routes

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/auth/inscription | — | Register |
| POST | /api/auth/connexion | — | Login |
| GET | /api/auth/moi | JWT | Current user |
| GET | /api/produits | — | List perfumes (filter/search/paginate) |
| GET | /api/produits/:id | — | Product detail |
| GET | /api/produits/:id/similaires | — | Similar products |
| POST | /api/produits | Admin | Create product |
| PUT | /api/produits/:id | Admin | Update product |
| DELETE | /api/produits/:id | Admin | Delete product |
| GET | /api/catalogue/vedettes | — | Featured products |
| GET | /api/catalogue/meilleures-ventes | — | Best sellers |
| GET | /api/catalogue/stats | — | Category breakdown |
| GET | /api/panier | JWT | Get cart |
| POST | /api/panier | JWT | Add to cart |
| PUT | /api/panier/:produitId | JWT | Update quantity |
| DELETE | /api/panier/:produitId | JWT | Remove item |
| DELETE | /api/panier | JWT | Clear cart |
| GET | /api/commandes | JWT | My orders |
| POST | /api/commandes | JWT | Place order |
| GET | /api/commandes/:id | JWT | Order detail |
| GET | /api/admin/commandes | Admin | All orders |
| PUT | /api/admin/commandes/:id/statut | Admin | Update order status |
| GET | /api/admin/stats | Admin | Dashboard stats |

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
