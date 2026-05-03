import { PageTransition } from "@/components/layout/PageTransition";
import { useGetCommandes } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { Link, useLocation } from "wouter";
import { Loader2, Package } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";

export default function Commandes() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect if not logged in (handled by a generic wrapper or here)
  if (!authLoading && !user) {
    setLocation("/connexion");
    return null;
  }

  const { data: commandes, isLoading } = useGetCommandes({
    query: {
      enabled: !!user,
    }
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'en_attente':
        return <Badge className="bg-amber-500/20 text-amber-500 border-amber-500/50 rounded-none font-normal tracking-wider uppercase text-[10px]">En attente</Badge>;
      case 'confirmee':
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50 rounded-none font-normal tracking-wider uppercase text-[10px]">Confirmée</Badge>;
      case 'expediee':
        return <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/50 rounded-none font-normal tracking-wider uppercase text-[10px]">Expédiée</Badge>;
      case 'livree':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/50 rounded-none font-normal tracking-wider uppercase text-[10px]">Livrée</Badge>;
      case 'annulee':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/50 rounded-none font-normal tracking-wider uppercase text-[10px]">Annulée</Badge>;
      default:
        return <Badge className="rounded-none">{status}</Badge>;
    }
  };

  return (
    <PageTransition>
      <div className="container mx-auto px-6 md:px-12 py-12">
        <h1 className="font-serif text-4xl md:text-5xl text-foreground mb-12">Mes Commandes</h1>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : !commandes?.length ? (
          <div className="text-center py-20 bg-card border border-border">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-xl font-serif text-foreground mb-2">Aucune commande</p>
            <p className="text-muted-foreground mb-8">Vous n'avez pas encore passé de commande.</p>
            <Link href="/produits">
              <span className="text-primary text-sm tracking-widest uppercase border-b border-primary pb-1 hover:text-primary/80 transition-colors cursor-pointer">
                Découvrir nos créations
              </span>
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {commandes.map((commande) => (
              <div key={commande.id} className="bg-card border border-border p-6 md:p-8">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-8 pb-6 border-b border-border/50">
                  <div>
                    <p className="text-sm text-muted-foreground tracking-widest uppercase mb-1">
                      Commande n°{commande.id.toString().padStart(6, '0')}
                    </p>
                    <p className="text-foreground">
                      {format(new Date(commande.createdAt), "d MMMM yyyy", { locale: fr })}
                    </p>
                  </div>
                  <div className="flex flex-col md:items-end gap-2">
                    {getStatusBadge(commande.statut)}
                    <p className="font-serif text-xl text-primary">{commande.total.toFixed(2)} €</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {commande.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-6">
                      <div className="w-16 h-24 bg-black border border-border/50 flex flex-shrink-0 items-center justify-center">
                        <img 
                          src={item.produit?.imageUrl || "/images/perfume-1.png"} 
                          alt={item.produit?.nom}
                          className="w-10 h-16 object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/images/perfume-1.png";
                          }}
                        />
                      </div>
                      <div className="flex-grow">
                        <h4 className="font-serif text-lg">{item.produit?.nom}</h4>
                        <p className="text-sm text-muted-foreground">Quantité: {item.quantite}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-foreground font-medium">{(item.prixUnitaire * item.quantite).toFixed(2)} €</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
