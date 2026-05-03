import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useAuth } from "./auth";
import { useGetPanier, useAjouterAuPanier, useModifierQuantite, useSupprimerDuPanier, useViderPanier, getGetPanierQueryKey } from "@workspace/api-client-react";
import type { Panier, Produit } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

interface LocalCartItem {
  produitId: number;
  quantite: number;
  produit: Produit;
}

interface CartContextType {
  cart: Panier | null;
  addToCart: (produitId: number, quantite?: number, produit?: Produit) => Promise<void>;
  updateQuantity: (produitId: number, quantite: number) => Promise<void>;
  removeFromCart: (produitId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = "velmora_cart";

function loadLocalCart(): LocalCartItem[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveLocalCart(items: LocalCartItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  const [localCart, setLocalCart] = useState<LocalCartItem[]>(loadLocalCart);

  useEffect(() => {
    if (!token) {
      saveLocalCart(localCart);
    }
  }, [localCart, token]);

  const { data: serverCart, isLoading: isLoadingServer } = useGetPanier({
    query: { enabled: !!token },
  });

  const addMutation = useAjouterAuPanier();
  const updateMutation = useModifierQuantite();
  const removeMutation = useSupprimerDuPanier();
  const clearMutation = useViderPanier();

  const addToCart = async (produitId: number, quantite = 1, produit?: Produit) => {
    if (token) {
      await addMutation.mutateAsync({ data: { produitId, quantite } });
      queryClient.invalidateQueries({ queryKey: getGetPanierQueryKey() });
    } else {
      setLocalCart((prev) => {
        const existing = prev.find((item) => item.produitId === produitId);
        if (existing) {
          return prev.map((item) =>
            item.produitId === produitId
              ? { ...item, quantite: item.quantite + quantite }
              : item
          );
        }
        const newItem: LocalCartItem = {
          produitId,
          quantite,
          produit: produit ?? ({ id: produitId, prix: 0, nom: "", description: "", imageUrl: "", categorie: "unisexe" as const, enVedette: false, nombreVentes: 0, createdAt: new Date().toISOString() }),
        };
        return [...prev, newItem];
      });
    }
  };

  const updateQuantity = async (produitId: number, quantite: number) => {
    if (token) {
      await updateMutation.mutateAsync({ id: produitId, data: { quantite } } as any);
      queryClient.invalidateQueries({ queryKey: getGetPanierQueryKey() });
    } else {
      if (quantite <= 0) {
        setLocalCart((prev) => prev.filter((item) => item.produitId !== produitId));
      } else {
        setLocalCart((prev) =>
          prev.map((item) => (item.produitId === produitId ? { ...item, quantite } : item))
        );
      }
    }
  };

  const removeFromCart = async (produitId: number) => {
    if (token) {
      await removeMutation.mutateAsync({ id: produitId } as any);
      queryClient.invalidateQueries({ queryKey: getGetPanierQueryKey() });
    } else {
      setLocalCart((prev) => prev.filter((item) => item.produitId !== produitId));
    }
  };

  const clearCart = async () => {
    if (token) {
      await clearMutation.mutateAsync();
      queryClient.invalidateQueries({ queryKey: getGetPanierQueryKey() });
    } else {
      setLocalCart([]);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const computedLocalCart: Panier = {
    items: localCart,
    total: localCart.reduce((sum, item) => sum + (item.produit?.prix ?? 0) * item.quantite, 0),
    nombreArticles: localCart.reduce((sum, item) => sum + item.quantite, 0),
  };

  return (
    <CartContext.Provider
      value={{
        cart: token ? serverCart ?? { items: [], total: 0, nombreArticles: 0 } : computedLocalCart,
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
