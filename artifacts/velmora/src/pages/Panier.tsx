import { PageTransition } from "@/components/layout/PageTransition";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, Loader2 } from "lucide-react";
import { Link, useLocation } from "wouter";
import { usePasserCommande } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function Panier() {
  const { cart, updateQuantity, removeFromCart, clearCart, isLoading } = useCart();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const passerCommande = usePasserCommande();
  const [isOrdering, setIsOrdering] = useState(false);

  const handleCheckout = async () => {
    if (!user) {
      setLocation("/connexion");
      return;
    }

    setIsOrdering(true);
    try {
      await passerCommande.mutateAsync();
      await clearCart();
      toast({
        title: "Commande confirmée",
        description: "Votre commande a été passée avec succès.",
        className: "bg-card border-primary text-foreground rounded-none",
      });
      setLocation("/commandes");
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de passer la commande.",
        variant: "destructive",
        className: "rounded-none",
      });
    } finally {
      setIsOrdering(false);
    }
  };

  if (isLoading) {
    return (
      <PageTransition className="flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </PageTransition>
    );
  }

  const items = cart?.items || [];
  const total = cart?.total || 0;

  return (
    <PageTransition>
      <div className="container mx-auto px-6 md:px-12 py-12">
        <h1 className="font-serif text-4xl md:text-5xl text-foreground mb-12 text-center">Votre Panier</h1>

        {items.length === 0 ? (
          <div className="text-center py-20 max-w-md mx-auto">
            <p className="text-muted-foreground mb-8 text-lg">Votre panier est actuellement vide.</p>
            <Link href="/produits">
              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-none h-14 text-sm tracking-widest uppercase">
                Découvrir nos créations
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-24">
            <div className="lg:col-span-2 space-y-8">
              {/* Header */}
              <div className="hidden md:grid grid-cols-12 gap-4 pb-4 border-b border-border/50 text-xs tracking-widest uppercase text-muted-foreground">
                <div className="col-span-6">Produit</div>
                <div className="col-span-3 text-center">Quantité</div>
                <div className="col-span-2 text-right">Prix</div>
                <div className="col-span-1"></div>
              </div>

              {/* Items */}
              {items.map((item) => (
                <div key={item.produitId} className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-4 items-center pb-8 border-b border-border/30">
                  {/* Product Info */}
                  <div className="col-span-1 md:col-span-6 flex gap-6 items-center">
                    <div className="w-24 h-32 bg-black border border-border flex items-center justify-center flex-shrink-0">
                      <img 
                        src={item.produit?.imageUrl || "/images/perfume-1.png"} 
                        alt={item.produit?.nom}
                        className="w-16 h-24 object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/images/perfume-1.png";
                        }}
                      />
                    </div>
                    <div>
                      <h3 className="font-serif text-xl mb-1">{item.produit?.nom}</h3>
                      <p className="text-xs text-muted-foreground tracking-widest uppercase mb-2">
                        {item.produit?.categorie === 'homme' ? 'Pour Lui' : item.produit?.categorie === 'femme' ? 'Pour Elle' : 'Unisexe'}
                      </p>
                      <p className="md:hidden text-primary mt-2">{(item.produit?.prix || 0).toFixed(2)} €</p>
                    </div>
                  </div>

                  {/* Quantity Controls */}
                  <div className="col-span-1 md:col-span-3 flex justify-center">
                    <div className="flex items-center border border-border h-10 w-full max-w-[120px] md:max-w-none">
                      <button 
                        onClick={() => updateQuantity(item.produitId, Math.max(1, item.quantite - 1))}
                        className="w-10 h-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="flex-grow text-center text-sm font-medium">{item.quantite}</span>
                      <button 
                        onClick={() => updateQuantity(item.produitId, item.quantite + 1)}
                        className="w-10 h-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="hidden md:block col-span-2 text-right">
                    <p className="text-foreground">{(item.produit?.prix || 0).toFixed(2)} €</p>
                  </div>

                  {/* Remove */}
                  <div className="col-span-1 flex justify-end md:justify-center">
                    <button 
                      onClick={() => removeFromCart(item.produitId)}
                      className="text-muted-foreground hover:text-destructive transition-colors p-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <div className="bg-card border border-border p-8 sticky top-32">
                <h2 className="font-serif text-2xl mb-8 border-b border-border/50 pb-4">Résumé</h2>
                
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Sous-total</span>
                    <span>{total.toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Livraison</span>
                    <span>Offerte</span>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-border/50">
                    <span className="font-serif text-lg">Total</span>
                    <span className="font-serif text-xl text-primary">{total.toFixed(2)} €</span>
                  </div>
                </div>

                <Button 
                  onClick={handleCheckout}
                  disabled={isOrdering}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-none h-14 text-sm tracking-widest uppercase mb-4"
                >
                  {isOrdering ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                  {user ? "Commander" : "Se connecter pour commander"}
                </Button>
                
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Taxes incluses. Échantillon offert inclus.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
