# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Full-stack luxury perfume e-commerce website — **Velmora**.

## Project: Velmora — Parfumerie de Luxe

A full-stack luxury perfume e-commerce website in French with a dark, silver-accented premium aesthetic inspired by Dior, Chanel, and Tom Ford.

### Features
- Complete French UI ("Ressentez la puissance de l'élégance")
- JWT authentication (login/register)
- Product catalogue with 9 category filters (homme, femme, unisexe, oriental, floral, boisé, aquatique, gourmand, citrus)
- Product detail pages with volume selector (50ml/100ml), price adjustment, livraison gratuite badge
- Dynamic shopping cart (guest localStorage + authenticated API sync)
- Order placement and order history
- **Comprehensive admin dashboard** — full sidebar layout (no Navbar/Footer), 15 sections:
  - Tableau de bord: stats cards + line chart + pie chart + recent orders
  - Commandes: full table with status select, tabs, search/filter
  - Produits: CRUD (add/edit/delete) + image preview + category filter
  - Catégories: derived from products, manage visibility
  - Up/Cross Sells: upsell management panel
  - Statistiques: Livraison, Équipe, Produits, Marketing — charts + stat cards
  - Calculateur: fully functional profit calculator (9 inputs → 6 result cards)
  - Budget: balance overview + revenue/expense tracking
  - Équipe: team member table
  - Boutique: Thème (5 themes + banners), Paramètres (store details + social), Facturation (billing + transactions)
- Silver theme: `--primary: 0 0% 72%` across all CSS variables
- 13 perfumes across 6 categories seeded in DB

### Seed credentials
- Admin: `admin@velmora.fr` / `admin123`
- Client: `sophie@example.fr` / `admin123`

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite + Tailwind CSS + Framer Motion + Wouter + Recharts
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

## Admin Routing

The `/admin` route is handled as a special case in `App.tsx` — it renders the `Admin` component directly without Navbar/Footer. The Admin component uses a `flex h-screen` full-screen sidebar layout. Unauthenticated users are redirected to `/`.

## Database Schema

- `utilisateurs` — users (id, nom, email, mot_de_passe, role: client|admin)
- `produits` — perfumes (id, nom, description, prix, image_url, categorie: text, en_vedette, nombre_ventes)
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
