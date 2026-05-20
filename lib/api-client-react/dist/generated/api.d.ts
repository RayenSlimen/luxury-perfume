import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from "@tanstack/react-query";
import type { AdminStats, AuthResponse, CatalogueStats, Commande, ConnexionBody, ErrorResponse, GetProduitsParams, HealthStatus, InscriptionBody, ModifierQuantiteBody, Panier, PanierItemBody, PasserCommandeBody, Produit, ProduitBody, ProduitsPage, SuccessResponse, UpdateStatutBody, Utilisateur } from "./api.schemas";
import { customFetch } from "../custom-fetch";
import type { ErrorType, BodyType } from "../custom-fetch";
type AwaitedInput<T> = PromiseLike<T> | T;
type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;
type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];
/**
 * @summary Health check
 */
export declare const getHealthCheckUrl: () => string;
export declare const healthCheck: (options?: RequestInit) => Promise<HealthStatus>;
export declare const getHealthCheckQueryKey: () => readonly ["/api/healthz"];
export declare const getHealthCheckQueryOptions: <TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData> & {
    queryKey: QueryKey;
};
export type HealthCheckQueryResult = NonNullable<Awaited<ReturnType<typeof healthCheck>>>;
export type HealthCheckQueryError = ErrorType<unknown>;
/**
 * @summary Health check
 */
export declare function useHealthCheck<TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Register a new user
 */
export declare const getInscriptionUrl: () => string;
export declare const inscription: (inscriptionBody: InscriptionBody, options?: RequestInit) => Promise<AuthResponse>;
export declare const getInscriptionMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof inscription>>, TError, {
        data: BodyType<InscriptionBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof inscription>>, TError, {
    data: BodyType<InscriptionBody>;
}, TContext>;
export type InscriptionMutationResult = NonNullable<Awaited<ReturnType<typeof inscription>>>;
export type InscriptionMutationBody = BodyType<InscriptionBody>;
export type InscriptionMutationError = ErrorType<ErrorResponse>;
/**
 * @summary Register a new user
 */
export declare const useInscription: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof inscription>>, TError, {
        data: BodyType<InscriptionBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof inscription>>, TError, {
    data: BodyType<InscriptionBody>;
}, TContext>;
/**
 * @summary Login user
 */
export declare const getConnexionUrl: () => string;
export declare const connexion: (connexionBody: ConnexionBody, options?: RequestInit) => Promise<AuthResponse>;
export declare const getConnexionMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof connexion>>, TError, {
        data: BodyType<ConnexionBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof connexion>>, TError, {
    data: BodyType<ConnexionBody>;
}, TContext>;
export type ConnexionMutationResult = NonNullable<Awaited<ReturnType<typeof connexion>>>;
export type ConnexionMutationBody = BodyType<ConnexionBody>;
export type ConnexionMutationError = ErrorType<ErrorResponse>;
/**
 * @summary Login user
 */
export declare const useConnexion: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof connexion>>, TError, {
        data: BodyType<ConnexionBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof connexion>>, TError, {
    data: BodyType<ConnexionBody>;
}, TContext>;
/**
 * @summary Get current authenticated user
 */
export declare const getGetMoiUrl: () => string;
export declare const getMoi: (options?: RequestInit) => Promise<Utilisateur>;
export declare const getGetMoiQueryKey: () => readonly ["/api/auth/moi"];
export declare const getGetMoiQueryOptions: <TData = Awaited<ReturnType<typeof getMoi>>, TError = ErrorType<ErrorResponse>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMoi>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getMoi>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetMoiQueryResult = NonNullable<Awaited<ReturnType<typeof getMoi>>>;
export type GetMoiQueryError = ErrorType<ErrorResponse>;
/**
 * @summary Get current authenticated user
 */
export declare function useGetMoi<TData = Awaited<ReturnType<typeof getMoi>>, TError = ErrorType<ErrorResponse>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMoi>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary List all perfumes with optional filters
 */
export declare const getGetProduitsUrl: (params?: GetProduitsParams) => string;
export declare const getProduits: (params?: GetProduitsParams, options?: RequestInit) => Promise<ProduitsPage>;
export declare const getGetProduitsQueryKey: (params?: GetProduitsParams) => readonly ["/api/produits", ...GetProduitsParams[]];
export declare const getGetProduitsQueryOptions: <TData = Awaited<ReturnType<typeof getProduits>>, TError = ErrorType<unknown>>(params?: GetProduitsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getProduits>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getProduits>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetProduitsQueryResult = NonNullable<Awaited<ReturnType<typeof getProduits>>>;
export type GetProduitsQueryError = ErrorType<unknown>;
/**
 * @summary List all perfumes with optional filters
 */
export declare function useGetProduits<TData = Awaited<ReturnType<typeof getProduits>>, TError = ErrorType<unknown>>(params?: GetProduitsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getProduits>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Create a new product (admin only)
 */
export declare const getCreateProduitUrl: () => string;
export declare const createProduit: (produitBody: ProduitBody, options?: RequestInit) => Promise<Produit>;
export declare const getCreateProduitMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createProduit>>, TError, {
        data: BodyType<ProduitBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createProduit>>, TError, {
    data: BodyType<ProduitBody>;
}, TContext>;
export type CreateProduitMutationResult = NonNullable<Awaited<ReturnType<typeof createProduit>>>;
export type CreateProduitMutationBody = BodyType<ProduitBody>;
export type CreateProduitMutationError = ErrorType<unknown>;
/**
 * @summary Create a new product (admin only)
 */
export declare const useCreateProduit: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createProduit>>, TError, {
        data: BodyType<ProduitBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createProduit>>, TError, {
    data: BodyType<ProduitBody>;
}, TContext>;
/**
 * @summary Get a single product by ID
 */
export declare const getGetProduitUrl: (id: number) => string;
export declare const getProduit: (id: number, options?: RequestInit) => Promise<Produit>;
export declare const getGetProduitQueryKey: (id: number) => readonly [`/api/produits/${number}`];
export declare const getGetProduitQueryOptions: <TData = Awaited<ReturnType<typeof getProduit>>, TError = ErrorType<ErrorResponse>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getProduit>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getProduit>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetProduitQueryResult = NonNullable<Awaited<ReturnType<typeof getProduit>>>;
export type GetProduitQueryError = ErrorType<ErrorResponse>;
/**
 * @summary Get a single product by ID
 */
export declare function useGetProduit<TData = Awaited<ReturnType<typeof getProduit>>, TError = ErrorType<ErrorResponse>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getProduit>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Update a product (admin only)
 */
export declare const getUpdateProduitUrl: (id: number) => string;
export declare const updateProduit: (id: number, produitBody: ProduitBody, options?: RequestInit) => Promise<Produit>;
export declare const getUpdateProduitMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateProduit>>, TError, {
        id: number;
        data: BodyType<ProduitBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateProduit>>, TError, {
    id: number;
    data: BodyType<ProduitBody>;
}, TContext>;
export type UpdateProduitMutationResult = NonNullable<Awaited<ReturnType<typeof updateProduit>>>;
export type UpdateProduitMutationBody = BodyType<ProduitBody>;
export type UpdateProduitMutationError = ErrorType<unknown>;
/**
 * @summary Update a product (admin only)
 */
export declare const useUpdateProduit: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateProduit>>, TError, {
        id: number;
        data: BodyType<ProduitBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateProduit>>, TError, {
    id: number;
    data: BodyType<ProduitBody>;
}, TContext>;
/**
 * @summary Delete a product (admin only)
 */
export declare const getDeleteProduitUrl: (id: number) => string;
export declare const deleteProduit: (id: number, options?: RequestInit) => Promise<SuccessResponse>;
export declare const getDeleteProduitMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteProduit>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteProduit>>, TError, {
    id: number;
}, TContext>;
export type DeleteProduitMutationResult = NonNullable<Awaited<ReturnType<typeof deleteProduit>>>;
export type DeleteProduitMutationError = ErrorType<unknown>;
/**
 * @summary Delete a product (admin only)
 */
export declare const useDeleteProduit: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteProduit>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteProduit>>, TError, {
    id: number;
}, TContext>;
/**
 * @summary Get similar products
 */
export declare const getGetProduitsSimilairesUrl: (id: number) => string;
export declare const getProduitsSimilaires: (id: number, options?: RequestInit) => Promise<Produit[]>;
export declare const getGetProduitsSimilairesQueryKey: (id: number) => readonly [`/api/produits/${number}/similaires`];
export declare const getGetProduitsSimilairesQueryOptions: <TData = Awaited<ReturnType<typeof getProduitsSimilaires>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getProduitsSimilaires>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getProduitsSimilaires>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetProduitsSimilairesQueryResult = NonNullable<Awaited<ReturnType<typeof getProduitsSimilaires>>>;
export type GetProduitsSimilairesQueryError = ErrorType<unknown>;
/**
 * @summary Get similar products
 */
export declare function useGetProduitsSimilaires<TData = Awaited<ReturnType<typeof getProduitsSimilaires>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getProduitsSimilaires>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get featured / popular products for the home page
 */
export declare const getGetVedettesUrl: () => string;
export declare const getVedettes: (options?: RequestInit) => Promise<Produit[]>;
export declare const getGetVedettesQueryKey: () => readonly ["/api/catalogue/vedettes"];
export declare const getGetVedettesQueryOptions: <TData = Awaited<ReturnType<typeof getVedettes>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getVedettes>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getVedettes>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetVedettesQueryResult = NonNullable<Awaited<ReturnType<typeof getVedettes>>>;
export type GetVedettesQueryError = ErrorType<unknown>;
/**
 * @summary Get featured / popular products for the home page
 */
export declare function useGetVedettes<TData = Awaited<ReturnType<typeof getVedettes>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getVedettes>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get best selling products
 */
export declare const getGetMeilleuresVentesUrl: () => string;
export declare const getMeilleuresVentes: (options?: RequestInit) => Promise<Produit[]>;
export declare const getGetMeilleuresVentesQueryKey: () => readonly ["/api/catalogue/meilleures-ventes"];
export declare const getGetMeilleuresVentesQueryOptions: <TData = Awaited<ReturnType<typeof getMeilleuresVentes>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMeilleuresVentes>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getMeilleuresVentes>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetMeilleuresVentesQueryResult = NonNullable<Awaited<ReturnType<typeof getMeilleuresVentes>>>;
export type GetMeilleuresVentesQueryError = ErrorType<unknown>;
/**
 * @summary Get best selling products
 */
export declare function useGetMeilleuresVentes<TData = Awaited<ReturnType<typeof getMeilleuresVentes>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMeilleuresVentes>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get catalogue statistics (total products, categories breakdown)
 */
export declare const getGetCatalogueStatsUrl: () => string;
export declare const getCatalogueStats: (options?: RequestInit) => Promise<CatalogueStats>;
export declare const getGetCatalogueStatsQueryKey: () => readonly ["/api/catalogue/stats"];
export declare const getGetCatalogueStatsQueryOptions: <TData = Awaited<ReturnType<typeof getCatalogueStats>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getCatalogueStats>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getCatalogueStats>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetCatalogueStatsQueryResult = NonNullable<Awaited<ReturnType<typeof getCatalogueStats>>>;
export type GetCatalogueStatsQueryError = ErrorType<unknown>;
/**
 * @summary Get catalogue statistics (total products, categories breakdown)
 */
export declare function useGetCatalogueStats<TData = Awaited<ReturnType<typeof getCatalogueStats>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getCatalogueStats>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get current user's cart
 */
export declare const getGetPanierUrl: () => string;
export declare const getPanier: (options?: RequestInit) => Promise<Panier>;
export declare const getGetPanierQueryKey: () => readonly ["/api/panier"];
export declare const getGetPanierQueryOptions: <TData = Awaited<ReturnType<typeof getPanier>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getPanier>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getPanier>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetPanierQueryResult = NonNullable<Awaited<ReturnType<typeof getPanier>>>;
export type GetPanierQueryError = ErrorType<unknown>;
/**
 * @summary Get current user's cart
 */
export declare function useGetPanier<TData = Awaited<ReturnType<typeof getPanier>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getPanier>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Add item to cart
 */
export declare const getAjouterAuPanierUrl: () => string;
export declare const ajouterAuPanier: (panierItemBody: PanierItemBody, options?: RequestInit) => Promise<Panier>;
export declare const getAjouterAuPanierMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof ajouterAuPanier>>, TError, {
        data: BodyType<PanierItemBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof ajouterAuPanier>>, TError, {
    data: BodyType<PanierItemBody>;
}, TContext>;
export type AjouterAuPanierMutationResult = NonNullable<Awaited<ReturnType<typeof ajouterAuPanier>>>;
export type AjouterAuPanierMutationBody = BodyType<PanierItemBody>;
export type AjouterAuPanierMutationError = ErrorType<unknown>;
/**
 * @summary Add item to cart
 */
export declare const useAjouterAuPanier: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof ajouterAuPanier>>, TError, {
        data: BodyType<PanierItemBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof ajouterAuPanier>>, TError, {
    data: BodyType<PanierItemBody>;
}, TContext>;
/**
 * @summary Clear cart
 */
export declare const getViderPanierUrl: () => string;
export declare const viderPanier: (options?: RequestInit) => Promise<SuccessResponse>;
export declare const getViderPanierMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof viderPanier>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof viderPanier>>, TError, void, TContext>;
export type ViderPanierMutationResult = NonNullable<Awaited<ReturnType<typeof viderPanier>>>;
export type ViderPanierMutationError = ErrorType<unknown>;
/**
 * @summary Clear cart
 */
export declare const useViderPanier: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof viderPanier>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof viderPanier>>, TError, void, TContext>;
/**
 * @summary Update item quantity in cart
 */
export declare const getModifierQuantiteUrl: (produitId: number) => string;
export declare const modifierQuantite: (produitId: number, modifierQuantiteBody: ModifierQuantiteBody, options?: RequestInit) => Promise<Panier>;
export declare const getModifierQuantiteMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof modifierQuantite>>, TError, {
        produitId: number;
        data: BodyType<ModifierQuantiteBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof modifierQuantite>>, TError, {
    produitId: number;
    data: BodyType<ModifierQuantiteBody>;
}, TContext>;
export type ModifierQuantiteMutationResult = NonNullable<Awaited<ReturnType<typeof modifierQuantite>>>;
export type ModifierQuantiteMutationBody = BodyType<ModifierQuantiteBody>;
export type ModifierQuantiteMutationError = ErrorType<unknown>;
/**
 * @summary Update item quantity in cart
 */
export declare const useModifierQuantite: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof modifierQuantite>>, TError, {
        produitId: number;
        data: BodyType<ModifierQuantiteBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof modifierQuantite>>, TError, {
    produitId: number;
    data: BodyType<ModifierQuantiteBody>;
}, TContext>;
/**
 * @summary Remove item from cart
 */
export declare const getSupprimerDuPanierUrl: (produitId: number) => string;
export declare const supprimerDuPanier: (produitId: number, options?: RequestInit) => Promise<Panier>;
export declare const getSupprimerDuPanierMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof supprimerDuPanier>>, TError, {
        produitId: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof supprimerDuPanier>>, TError, {
    produitId: number;
}, TContext>;
export type SupprimerDuPanierMutationResult = NonNullable<Awaited<ReturnType<typeof supprimerDuPanier>>>;
export type SupprimerDuPanierMutationError = ErrorType<unknown>;
/**
 * @summary Remove item from cart
 */
export declare const useSupprimerDuPanier: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof supprimerDuPanier>>, TError, {
        produitId: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof supprimerDuPanier>>, TError, {
    produitId: number;
}, TContext>;
/**
 * @summary Get current user's orders
 */
export declare const getGetCommandesUrl: () => string;
export declare const getCommandes: (options?: RequestInit) => Promise<Commande[]>;
export declare const getGetCommandesQueryKey: () => readonly ["/api/commandes"];
export declare const getGetCommandesQueryOptions: <TData = Awaited<ReturnType<typeof getCommandes>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getCommandes>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getCommandes>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetCommandesQueryResult = NonNullable<Awaited<ReturnType<typeof getCommandes>>>;
export type GetCommandesQueryError = ErrorType<unknown>;
/**
 * @summary Get current user's orders
 */
export declare function useGetCommandes<TData = Awaited<ReturnType<typeof getCommandes>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getCommandes>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Place an order from current cart
 */
export declare const getPasserCommandeUrl: () => string;
export declare const passerCommande: (passerCommandeBody: PasserCommandeBody, options?: RequestInit) => Promise<Commande>;
export declare const getPasserCommandeMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof passerCommande>>, TError, {
        data: BodyType<PasserCommandeBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof passerCommande>>, TError, {
    data: BodyType<PasserCommandeBody>;
}, TContext>;
export type PasserCommandeMutationResult = NonNullable<Awaited<ReturnType<typeof passerCommande>>>;
export type PasserCommandeMutationBody = BodyType<PasserCommandeBody>;
export type PasserCommandeMutationError = ErrorType<unknown>;
/**
 * @summary Place an order from current cart
 */
export declare const usePasserCommande: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof passerCommande>>, TError, {
        data: BodyType<PasserCommandeBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof passerCommande>>, TError, {
    data: BodyType<PasserCommandeBody>;
}, TContext>;
/**
 * @summary Get a single order by ID
 */
export declare const getGetCommandeUrl: (id: number) => string;
export declare const getCommande: (id: number, options?: RequestInit) => Promise<Commande>;
export declare const getGetCommandeQueryKey: (id: number) => readonly [`/api/commandes/${number}`];
export declare const getGetCommandeQueryOptions: <TData = Awaited<ReturnType<typeof getCommande>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getCommande>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getCommande>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetCommandeQueryResult = NonNullable<Awaited<ReturnType<typeof getCommande>>>;
export type GetCommandeQueryError = ErrorType<unknown>;
/**
 * @summary Get a single order by ID
 */
export declare function useGetCommande<TData = Awaited<ReturnType<typeof getCommande>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getCommande>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get all orders (admin)
 */
export declare const getGetAdminCommandesUrl: () => string;
export declare const getAdminCommandes: (options?: RequestInit) => Promise<Commande[]>;
export declare const getGetAdminCommandesQueryKey: () => readonly ["/api/admin/commandes"];
export declare const getGetAdminCommandesQueryOptions: <TData = Awaited<ReturnType<typeof getAdminCommandes>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getAdminCommandes>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getAdminCommandes>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetAdminCommandesQueryResult = NonNullable<Awaited<ReturnType<typeof getAdminCommandes>>>;
export type GetAdminCommandesQueryError = ErrorType<unknown>;
/**
 * @summary Get all orders (admin)
 */
export declare function useGetAdminCommandes<TData = Awaited<ReturnType<typeof getAdminCommandes>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getAdminCommandes>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Update order status (admin)
 */
export declare const getUpdateStatutCommandeUrl: (id: number) => string;
export declare const updateStatutCommande: (id: number, updateStatutBody: UpdateStatutBody, options?: RequestInit) => Promise<Commande>;
export declare const getUpdateStatutCommandeMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateStatutCommande>>, TError, {
        id: number;
        data: BodyType<UpdateStatutBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateStatutCommande>>, TError, {
    id: number;
    data: BodyType<UpdateStatutBody>;
}, TContext>;
export type UpdateStatutCommandeMutationResult = NonNullable<Awaited<ReturnType<typeof updateStatutCommande>>>;
export type UpdateStatutCommandeMutationBody = BodyType<UpdateStatutBody>;
export type UpdateStatutCommandeMutationError = ErrorType<unknown>;
/**
 * @summary Update order status (admin)
 */
export declare const useUpdateStatutCommande: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateStatutCommande>>, TError, {
        id: number;
        data: BodyType<UpdateStatutBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateStatutCommande>>, TError, {
    id: number;
    data: BodyType<UpdateStatutBody>;
}, TContext>;
/**
 * @summary Get admin dashboard statistics
 */
export declare const getGetAdminStatsUrl: () => string;
export declare const getAdminStats: (options?: RequestInit) => Promise<AdminStats>;
export declare const getGetAdminStatsQueryKey: () => readonly ["/api/admin/stats"];
export declare const getGetAdminStatsQueryOptions: <TData = Awaited<ReturnType<typeof getAdminStats>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getAdminStats>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getAdminStats>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetAdminStatsQueryResult = NonNullable<Awaited<ReturnType<typeof getAdminStats>>>;
export type GetAdminStatsQueryError = ErrorType<unknown>;
/**
 * @summary Get admin dashboard statistics
 */
export declare function useGetAdminStats<TData = Awaited<ReturnType<typeof getAdminStats>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getAdminStats>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export {};
//# sourceMappingURL=api.d.ts.map