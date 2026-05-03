import { PageTransition } from "@/components/layout/PageTransition";
import { useGetProduit, useGetProduitsSimilaires } from "@workspace/api-client-react";
import { useRoute } from "wouter";
import { Loader2, Plus, Minus, ArrowLeft, Truck, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useCart } from "@/lib/cart";
import { useToast } from "@/hooks/use-toast";
import { ProductCard } from "@/components/ProductCard";
import { Link } from "wouter";

const VOLUMES = [
  { label: "50 ml", multiplier: 1 },
  { label: "100 ml", multiplier: 1.65 },
] as const;
type VolumeLabel = typeof VOLUMES[number]["label"];

export default function ProduitDetail() {
  const [, params] = useRoute("/produits/:id");
  const id = Number(params?.id);
  
  const { data: produit, isLoading } = useGetProduit(id, {
    query: { enabled: !!id }
  });
  
  const { data: similaires, isLoading: loadingSimilaires } = useGetProduitsSimilaires(id, {
    query: { enabled: !!id }
  });

  const [volume, setVolume] = useState<VolumeLabel>("50 ml");
  const [quantite, setQuantite] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const { addToCart } = useCart();
  const { toast } = useToast();

  if (isLoading) {
    return (
      <PageTransition className="flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </PageTransition>
    );
  }

  if (!produit) {
    return (
      <PageTransition className="flex flex-col items-center justify-center text-center px-6">
        <h1 className="font-serif text-4xl mb-4">Produit introuvable</h1>
        <Link href="/produits">
          <Button variant="outline" className="rounded-none border-primary/50 text-primary">
            Retour au catalogue
          </Button>
        </Link>
      </PageTransition>
    );
  }

  const handleAdd = async () => {
    setIsAdding(true);
    try {
      await addToCart(produit.id, quantite);
      toast({
        title: "Ajouté au panier",
        description: `${quantite}x ${produit.nom} ajouté avec succès.`,
        className: "bg-card border-primary text-foreground rounded-none",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter au panier.",
        variant: "destructive",
        className: "rounded-none",
      });
    } finally {
      setIsAdding(false);
    }
  };

  const selectedVolume = VOLUMES.find(v => v.label === volume)!;
  const prixAffiche = (produit.prix * selectedVolume.multiplier).toFixed(2);
  const imageUrl = produit.imageUrl || "/images/perfume-1.png";

  return (
    <PageTransition>
      <div className="container mx-auto px-6 md:px-12">
        <Link href="/produits">
          <button className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm tracking-widest uppercase mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Retour
          </button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 mb-24">
          {/* Image */}
          <div className="relative aspect-[3/4] lg:aspect-[4/5] bg-black border border-border flex items-center justify-center p-12">
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent z-10"></div>
            <img 
              src={imageUrl} 
              alt={produit.nom}
              className="w-full h-full object-contain relative z-20 drop-shadow-2xl"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/images/perfume-1.png";
              }}
            />
          </div>

          {/* Details */}
          <div className="flex flex-col justify-center">
            <p className="text-primary tracking-widest uppercase text-sm mb-4">
              {{
                homme: 'Pour Lui',
                femme: 'Pour Elle',
                unisexe: 'Unisexe',
              }[produit.categorie] ?? produit.categorie}
            </p>
            <h1 className="font-serif text-4xl md:text-6xl text-foreground mb-6 leading-tight">
              {produit.nom}
            </h1>
            <p className="text-2xl text-foreground/90 font-medium mb-8">
              {prixAffiche} €
            </p>

            {/* Volume selector */}
            <div className="mb-8">
              <p className="text-muted-foreground uppercase tracking-widest text-xs mb-3">
                Contenance
              </p>
              <div className="flex gap-3">
                {VOLUMES.map(v => (
                  <button
                    key={v.label}
                    onClick={() => setVolume(v.label)}
                    className={`h-12 px-6 border text-sm tracking-widest uppercase transition-colors ${
                      volume === v.label
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                    }`}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="prose prose-invert prose-p:text-muted-foreground prose-p:leading-relaxed mb-10 max-w-none">
              <p>{produit.description}</p>
            </div>

            {/* Livraison gratuite badge */}
            <div className="flex items-center gap-2 mb-6 text-sm text-foreground/70">
              <Truck className="w-4 h-4 text-primary shrink-0" />
              <span>Livraison gratuite — <span className="text-foreground">2 à 3 jours ouvrés</span></span>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center pt-8 border-t border-border">
              {/* Quantity */}
              <div className="flex items-center border border-border h-14">
                <button 
                  onClick={() => setQuantite(Math.max(1, quantite - 1))}
                  className="w-14 h-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-14 text-center font-medium">{quantite}</span>
                <button 
                  onClick={() => setQuantite(quantite + 1)}
                  className="w-14 h-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Add to Cart */}
              <Button 
                onClick={handleAdd}
                disabled={isAdding}
                className="h-14 px-8 w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground rounded-none text-sm tracking-widest uppercase"
              >
                {isAdding ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                {isAdding ? "Ajout en cours..." : "Ajouter au panier"}
              </Button>
            </div>

            <div className="mt-10 flex items-center gap-2 text-xs text-muted-foreground">
              <Package className="w-4 h-4 shrink-0" />
              <span>Échantillon offert avec chaque commande</span>
            </div>
          </div>
        </div>

        {/* Similar Products */}
        {similaires && similaires.length > 0 && (
          <div className="border-t border-border pt-16">
            <h2 className="font-serif text-3xl text-foreground mb-10 text-center">Vous aimerez aussi</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {similaires.map(sim => (
                <ProductCard key={sim.id} product={sim} />
              ))}
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
