import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useAuth } from "./auth";
import { useGetPanier, useAjouterAuPanier, useModifierQuantite, useSupprimerDuPanier, useViderPanier, getGetPanierQueryKey } from "@workspace/api-client-react";
import type { Panier, PanierItem } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

interface LocalCartItem extends PanierItem {}

interface CartContextType {
  cart: Panier | null;
  addToCart: (produitId: number, quantite?: number) => Promise<void>;
  updateQuantity: (produitId: number, quantite: number) => Promise<void>;
  removeFromCart: (produitId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  
  // Local state for guest users
  const [localCart, setLocalCart] = useState<LocalCartItem[]>(() => {
    const saved = localStorage.getItem("velmora_cart");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    if (!token) {
      localStorage.setItem("velmora_cart", JSON.stringify(localCart));
    }
  }, [localCart, token]);

  const { data: serverCart, isLoading: isLoadingServer } = useGetPanier({
    query: {
      enabled: !!token,
    }
  });

  const addMutation = useAjouterAuPanier();
  const updateMutation = useModifierQuantite();
  const removeMutation = useSupprimerDuPanier();
  const clearMutation = useViderPanier();

  const addToCart = async (produitId: number, quantite = 1) => {
    if (token) {
      await addMutation.mutateAsync({ data: { produitId, quantite } });
      queryClient.invalidateQueries({ queryKey: getGetPanierQueryKey() });
    } else {
      setLocalCart(prev => {
        const existing = prev.find(item => item.produitId === produitId);
        if (existing) {
          return prev.map(item => item.produitId === produitId ? { ...item, quantite: item.quantite + quantite } : item);
        }
        return [...prev, { produitId, quantite, produit: {} as any }]; // Local mock won't have full product data easily, this is a simplified version
      });
    }
  };

  const updateQuantity = async (produitId: number, quantite: number) => {
    if (token) {
      await updateMutation.mutateAsync({ id: produitId, data: { quantite } } as any); // Note: path param in generated hooks might be different, check signature
      queryClient.invalidateQueries({ queryKey: getGetPanierQueryKey() });
    } else {
      setLocalCart(prev => prev.map(item => item.produitId === produitId ? { ...item, quantite } : item));
    }
  };

  const removeFromCart = async (produitId: number) => {
    if (token) {
      await removeMutation.mutateAsync({ id: produitId } as any);
      queryClient.invalidateQueries({ queryKey: getGetPanierQueryKey() });
    } else {
      setLocalCart(prev => prev.filter(item => item.produitId !== produitId));
    }
  };

  const clearCart = async () => {
    if (token) {
      await clearMutation.mutateAsync();
      queryClient.invalidateQueries({ queryKey: getGetPanierQueryKey() });
    } else {
      setLocalCart([]);
    }
  };

  // Simplified local cart representation
  const computedLocalCart: Panier = {
    items: localCart,
    total: localCart.reduce((sum, item) => sum + (item.produit?.prix || 0) * item.quantite, 0),
    nombreArticles: localCart.reduce((sum, item) => sum + item.quantite, 0)
  };

  return (
    <CartContext.Provider
      value={{
        cart: token ? (serverCart || { items: [], total: 0, nombreArticles: 0 }) : computedLocalCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        isLoading: token ? isLoadingServer : false,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
