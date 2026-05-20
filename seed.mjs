import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

await pool.query(`
  INSERT INTO produits (nom, description, prix, image_url, categorie, en_vedette, nombre_ventes)
  VALUES 
    ('Noir Absolu', 'Un parfum oriental intense et envoûtant', 89.900, 'https://images.unsplash.com/photo-1541643600914-78b084683702?w=400', 'homme', true, 120),
    ('Rose Éternelle', 'Floral délicat et raffiné', 74.900, 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=400', 'femme', true, 95),
    ('Oud Mystique', 'Bois précieux et ambre doré', 120.000, 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=400', 'unisexe', true, 80),
    ('Jasmin Doré', 'Jasmin frais aux notes dorées', 65.000, 'https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=400', 'femme', true, 60),
    ('Cèdre Sauvage', 'Boisé masculin et frais', 79.500, 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400', 'homme', true, 45),
    ('Ambre Blanc', 'Doux et enveloppant', 55.000, 'https://images.unsplash.com/photo-1575822870971-8e1c4fb6e5b8?w=400', 'unisexe', true, 70)
  ON CONFLICT DO NOTHING;
`);

console.log('✅ Produits ajoutés avec succès!');
await pool.end();
