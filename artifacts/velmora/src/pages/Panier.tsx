import { PageTransition } from "@/components/layout/PageTransition";
import { useCart } from "@/lib/cart";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, Loader2, ChevronDown } from "lucide-react";
import { Link, useLocation } from "wouter";
import { usePasserCommande } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const WILAYAS = [
  "Tunis", "Ariana", "Ben Arous", "Manouba",
  "Nabeul", "Zaghouan", "Bizerte", "Béja",
  "Jendouba", "Le Kef", "Siliana", "Sousse",
  "Monastir", "Mahdia", "Sfax", "Kairouan",
  "Kasserine", "Sidi Bouzid", "Gabès", "Medenine",
  "Tataouine", "Gafsa", "Tozeur", "Kébili",
];

interface LivraisonForm {
  nomLivraison: string;
  telephone: string;
  adresse: string;
  wilaya: string;
}

export default function Panier() {
  const { cart, updateQuantity, removeFromCart, clearCart, isLoading } = useCart();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const passerCommande = usePasserCommande();
  const [isOrdering, setIsOrdering] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [form, setForm] = useState<LivraisonForm>({
    nomLivraison: "",
    telephone: "",
    adresse: "",
    wilaya: "",
  });
  const [errors, setErrors] = useState<Partial<LivraisonForm>>({});

  const validate = () => {
    const e: Partial<LivraisonForm> = {};
    if (!form.nomLivraison.trim()) e.nomLivraison = "Champ obligatoire";
    if (!form.telephone.trim()) e.telephone = "Champ obligatoire";
    if (!form.adresse.trim()) e.adresse = "Champ obligatoire";
    if (!form.wilaya) e.wilaya = "Veuillez choisir une wilaya";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsOrdering(true);
    try {
      const items = (cart?.items ?? []).map((item) => ({
        produitId: item.produitId,
        quantite: item.quantite,
      }));
      await passerCommande.mutateAsync({ data: { ...form, items } });
      await clearCart();
      setShowDialog(false);
      toast({
        title: "Commande confirmée",
        description: "Votre commande a été passée avec succès.",
        className: "bg-card border-primary text-foreground rounded-none",
      });
      setLocation("/");
    } catch {
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

  const field = (
    key: keyof LivraisonForm,
    label: string,
    type = "text",
    placeholder = ""
  ) => (
    <div className="flex flex-col gap-1">
      <label className="text-xs tracking-widest uppercase text-muted-foreground">{label}</label>
      <input
        type={type}
        value={form[key]}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        placeholder={placeholder}
        className={`bg-background border ${errors[key] ? "border-red-500" : "border-border"} px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors`}
      />
      {errors[key] && <span className="text-xs text-red-400">{errors[key]}</span>}
    </div>
  );

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
                  <div className="col-span-1 md:col-span-6 flex gap-6 items-center">
                    <div className="w-24 h-32 bg-black border border-border flex items-center justify-center flex-shrink-0">
                      <img
                        src={item.produit?.imageUrl || "/images/perfume-1.png"}
                        alt={item.produit?.nom}
                        className="w-16 h-24 object-contain"
                        onError={(e) => { (e.target as HTMLImageElement).src = "/images/perfume-1.png"; }}
                      />
                    </div>
                    <div>
                      <h3 className="font-serif text-xl mb-1">{item.produit?.nom}</h3>
                      <p className="text-xs text-muted-foreground tracking-widest uppercase mb-2">
                        {item.produit?.categorie === "homme" ? "Pour Homme" : item.produit?.categorie === "femme" ? "Pour Femme" : "Unisexe"}
                      </p>
                      <p className="md:hidden text-primary mt-2">{(item.produit?.prix || 0).toFixed(2)} DT</p>
                    </div>
                  </div>

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

                  <div className="hidden md:block col-span-2 text-right">
                    <p className="text-foreground">{(item.produit?.prix || 0).toFixed(2)} DT</p>
                  </div>

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
                    <span>{total.toFixed(2)} DT</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Livraison</span>
                    <span>Offerte</span>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-border/50">
                    <span className="font-serif text-lg">Total</span>
                    <span className="font-serif text-xl text-primary">{total.toFixed(2)} DT</span>
                  </div>
                </div>

                <Button
                  onClick={() => setShowDialog(true)}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-none h-14 text-sm tracking-widest uppercase mb-4"
                >
                  Commander
                </Button>

                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Livraison gratuite. Paiement à la livraison.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Checkout Dialog ── */}
      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => !isOrdering && setShowDialog(false)}
          />

          <div className="relative bg-card border border-border w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-border">
              <h2 className="font-serif text-2xl">Informations de livraison</h2>
              <button
                onClick={() => !isOrdering && setShowDialog(false)}
                className="text-muted-foreground hover:text-foreground transition-colors text-xl leading-none"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <div className="px-8 py-6 space-y-5">
              {field("nomLivraison", "Nom complet", "text", "Votre nom et prénom")}
              {field("telephone", "Numéro de téléphone", "tel", "ex: 20 123 456")}
              {field("adresse", "Adresse", "text", "Rue, numéro, appartement...")}

              {/* Wilaya */}
              <div className="flex flex-col gap-1">
                <label className="text-xs tracking-widest uppercase text-muted-foreground">Wilaya</label>
                <div className="relative">
                  <select
                    value={form.wilaya}
                    onChange={(e) => setForm((f) => ({ ...f, wilaya: e.target.value }))}
                    className={`w-full appearance-none bg-background border ${errors.wilaya ? "border-red-500" : "border-border"} px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary transition-colors pr-10`}
                  >
                    <option value="" disabled>Choisissez votre wilaya</option>
                    {WILAYAS.map((w) => (
                      <option key={w} value={w}>{w}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
                {errors.wilaya && <span className="text-xs text-red-400">{errors.wilaya}</span>}
              </div>
            </div>

            {/* Order total */}
            <div className="px-8 pb-2">
              <div className="bg-background border border-border/50 px-6 py-4 flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total commande</span>
                <span className="font-serif text-lg text-primary">{total.toFixed(2)} DT</span>
              </div>
            </div>

            {/* Actions */}
            <div className="px-8 py-6 flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowDialog(false)}
                disabled={isOrdering}
                className="flex-1 rounded-none h-12 border-border text-muted-foreground hover:text-foreground"
              >
                Annuler
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isOrdering}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-none h-12 text-sm tracking-widest uppercase"
              >
                {isOrdering ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {isOrdering ? "En cours..." : "Confirmer"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </PageTransition>
  );
}
