import { PageTransition } from "@/components/layout/PageTransition";
import { ProductCard } from "@/components/ProductCard";
import { Input } from "@/components/ui/input";
import { useGetProduits } from "@workspace/api-client-react";
import type { GetProduitsCategorie } from "@workspace/api-client-react";
import { Search, SlidersHorizontal, Loader2 } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

export default function Catalogue() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const initialCat = searchParams.get('categorie') as GetProduitsCategorie | undefined;

  const [recherche, setRecherche] = useState("");
  const [categorie, setCategorie] = useState<GetProduitsCategorie | undefined>(initialCat);
  const [debouncedRecherche, setDebouncedRecherche] = useState("");

  // Debounce search
  useState(() => {
    const handler = setTimeout(() => {
      setDebouncedRecherche(recherche);
    }, 500);
    return () => clearTimeout(handler);
  }, [recherche]);

  const { data, isLoading } = useGetProduits({
    recherche: debouncedRecherche || undefined,
    categorie,
    limite: 20
  });

  const categories = [
    { id: undefined, label: "Tous" },
    { id: "femme" as GetProduitsCategorie, label: "Pour Elle" },
    { id: "homme" as GetProduitsCategorie, label: "Pour Lui" },
    { id: "unisexe" as GetProduitsCategorie, label: "Unisexe" },
    { id: "oriental" as GetProduitsCategorie, label: "Oriental" },
    { id: "floral" as GetProduitsCategorie, label: "Floral" },
    { id: "boise" as GetProduitsCategorie, label: "Boisé" },
    { id: "aquatique" as GetProduitsCategorie, label: "Aquatique" },
    { id: "gourmand" as GetProduitsCategorie, label: "Gourmand" },
    { id: "citrus" as GetProduitsCategorie, label: "Citrus" },
  ];

  return (
    <PageTransition>
      <div className="container mx-auto px-6 md:px-12">
        <div className="mb-12">
          <h1 className="font-serif text-4xl md:text-5xl text-foreground mb-4">Le Catalogue</h1>
          <p className="text-muted-foreground">Découvrez l'ensemble de nos créations olfactives.</p>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 border-b border-border/50 pb-8">
          <div className="flex flex-wrap gap-4">
            {categories.map(cat => (
              <button
                key={cat.id || 'all'}
                onClick={() => setCategorie(cat.id)}
                className={`text-sm tracking-widest uppercase pb-1 transition-all ${
                  categorie === cat.id 
                    ? "text-primary border-b border-primary" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              type="text" 
              placeholder="Rechercher un parfum..." 
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              className="pl-10 bg-card/50 border-border rounded-none focus-visible:ring-primary/50 text-foreground"
            />
          </div>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="flex justify-center items-center py-32">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : !data?.produits?.length ? (
          <div className="text-center py-32">
            <p className="font-serif text-2xl text-muted-foreground mb-4">Aucun parfum trouvé</p>
            <p className="text-sm text-muted-foreground">Essayez d'élargir votre recherche.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 gap-y-12">
            {data.produits.map(produit => (
              <ProductCard key={produit.id} product={produit} />
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
