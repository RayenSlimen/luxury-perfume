import type { Produit } from "@workspace/api-client-react";
import { Link } from "wouter";
import { useCart } from "@/lib/cart";
import { useState } from "react";
import { Loader2 } from "lucide-react";

interface ProductCardProps {
  product: Produit;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating to product detail
    e.stopPropagation();
    setIsAdding(true);
    try {
      await addToCart(product.id, 1);
    } finally {
      setIsAdding(false);
    }
  };

  // Use a fallback gradient if no image URL or if we want to ensure consistent luxury feel
  const imageUrl = product.imageUrl || "/images/perfume-2.png"; // Fallback to our generated image

  return (
    <Link href={`/produits/${product.id}`}>
      <div className="group cursor-pointer relative bg-card border border-border/30 overflow-hidden transition-all duration-500 hover:border-primary/50 flex flex-col h-full">
        {/* Image Container */}
        <div className="relative aspect-[3/4] overflow-hidden bg-black flex items-center justify-center p-8">
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 opacity-60"></div>
          
          <img 
            src={imageUrl} 
            alt={product.nom}
            className="w-full h-full object-contain transform transition-transform duration-700 group-hover:scale-105 z-0"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/images/perfume-2.png"; // Fallback
            }}
          />
          
          {/* Quick Add Button Overlay */}
          <div className="absolute inset-x-0 bottom-0 p-6 z-20 translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-out">
            <button 
              onClick={handleAdd}
              disabled={isAdding}
              className="w-full bg-primary/90 hover:bg-primary text-primary-foreground py-3 text-sm tracking-widest uppercase font-medium backdrop-blur-sm transition-colors flex items-center justify-center disabled:opacity-50"
            >
              {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : "Ajouter au panier"}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col grow justify-between">
          <div>
            <p className="text-xs text-muted-foreground tracking-widest uppercase mb-2">
              {product.categorie === 'homme' ? 'Pour Lui' : product.categorie === 'femme' ? 'Pour Elle' : 'Unisexe'}
            </p>
            <h3 className="font-serif text-xl text-foreground mb-1 group-hover:text-primary transition-colors">
              {product.nom}
            </h3>
          </div>
          <div className="mt-4 pt-4 border-t border-border/50 flex justify-between items-center">
            <p className="text-primary font-medium tracking-wide">
              {product.prix.toFixed(2)} €
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
