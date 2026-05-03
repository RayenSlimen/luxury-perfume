import { PageTransition } from "@/components/layout/PageTransition";
import { useAuth } from "@/lib/auth";
import { useGetAdminStats, useGetAdminCommandes, useUpdateStatutCommande, getGetAdminCommandesQueryKey, getGetAdminStatsQueryKey, useCreateProduit, getGetProduitsQueryKey } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { Loader2, TrendingUp, Users, Package, ShoppingBag, Plus } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { ProduitBodyCategorie } from "@workspace/api-client-react";

const produitSchema = z.object({
  nom: z.string().min(2, "Nom requis"),
  description: z.string().min(10, "Description requise"),
  prix: z.coerce.number().min(0, "Prix invalide"),
  imageUrl: z.string().url("URL invalide").or(z.literal("")),
  categorie: z.enum(["homme", "femme", "unisexe"]),
  enVedette: z.boolean().default(false),
});

type ProduitForm = z.infer<typeof produitSchema>;

export default function Admin() {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  if (!authLoading && (!user || !isAdmin)) {
    setLocation("/");
    return null;
  }

  const { data: stats, isLoading: statsLoading } = useGetAdminStats({
    query: { enabled: !!isAdmin }
  });

  const { data: commandes, isLoading: commandesLoading } = useGetAdminCommandes({
    query: { enabled: !!isAdmin }
  });

  const updateStatut = useUpdateStatutCommande();
  const createProduit = useCreateProduit();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<ProduitForm>({
    resolver: zodResolver(produitSchema),
    defaultValues: {
      nom: "",
      description: "",
      prix: 0,
      imageUrl: "",
      categorie: "unisexe",
      enVedette: false
    }
  });

  const handleStatusChange = async (commandeId: number, statut: any) => {
    try {
      await updateStatut.mutateAsync({ id: commandeId, data: { statut } });
      queryClient.invalidateQueries({ queryKey: getGetAdminCommandesQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetAdminStatsQueryKey() });
      toast({
        title: "Statut mis à jour",
        className: "bg-card border-primary text-foreground rounded-none",
      });
    } catch (e) {
      toast({
        title: "Erreur",
        variant: "destructive",
        className: "rounded-none",
      });
    }
  };

  const onSubmitProduit = async (data: ProduitForm) => {
    try {
      await createProduit.mutateAsync({ data });
      queryClient.invalidateQueries({ queryKey: getGetProduitsQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetAdminStatsQueryKey() });
      toast({
        title: "Produit créé",
        className: "bg-card border-primary text-foreground rounded-none",
      });
      setIsDialogOpen(false);
      reset();
    } catch (e) {
      toast({
        title: "Erreur lors de la création",
        variant: "destructive",
        className: "rounded-none",
      });
    }
  };

  if (statsLoading || commandesLoading) {
    return (
      <PageTransition className="flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="container mx-auto px-6 md:px-12 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
          <div>
            <h1 className="font-serif text-4xl text-foreground mb-2">Tableau de Bord</h1>
            <p className="text-muted-foreground">Vue d'ensemble de l'activité Velmora.</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-none text-sm tracking-widest uppercase">
                <Plus className="w-4 h-4 mr-2" /> Nouveau Parfum
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border rounded-none sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle className="font-serif text-2xl">Nouveau Parfum</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmitProduit)} className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-widest text-muted-foreground">Nom</Label>
                    <Input {...register("nom")} className="rounded-none border-border/50 focus-visible:ring-primary/50" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-widest text-muted-foreground">Prix (€)</Label>
                    <Input type="number" step="0.01" {...register("prix")} className="rounded-none border-border/50 focus-visible:ring-primary/50" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-widest text-muted-foreground">Catégorie</Label>
                  <Select onValueChange={(val) => setValue("categorie", val as any)} defaultValue={watch("categorie")}>
                    <SelectTrigger className="rounded-none border-border/50 focus-visible:ring-primary/50">
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent className="rounded-none border-border">
                      <SelectItem value="homme">Pour Lui</SelectItem>
                      <SelectItem value="femme">Pour Elle</SelectItem>
                      <SelectItem value="unisexe">Unisexe</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-widest text-muted-foreground">Description</Label>
                  <Textarea {...register("description")} className="rounded-none border-border/50 focus-visible:ring-primary/50 min-h-[100px]" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-widest text-muted-foreground">URL de l'image</Label>
                  <Input {...register("imageUrl")} placeholder="https://..." className="rounded-none border-border/50 focus-visible:ring-primary/50" />
                </div>
                <Button type="submit" disabled={createProduit.isPending} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-none mt-4 uppercase tracking-widest text-sm">
                  {createProduit.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Créer
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <div className="bg-card border border-border p-6 flex flex-col gap-4">
            <div className="flex justify-between items-center text-muted-foreground">
              <span className="text-xs tracking-widest uppercase">Chiffre d'Affaires</span>
              <TrendingUp className="w-4 h-4 text-primary" />
            </div>
            <p className="font-serif text-3xl text-foreground">{(stats?.chiffreAffaires || 0).toFixed(2)} €</p>
          </div>
          <div className="bg-card border border-border p-6 flex flex-col gap-4">
            <div className="flex justify-between items-center text-muted-foreground">
              <span className="text-xs tracking-widest uppercase">Commandes</span>
              <Package className="w-4 h-4 text-primary" />
            </div>
            <p className="font-serif text-3xl text-foreground">{stats?.totalCommandes || 0}</p>
          </div>
          <div className="bg-card border border-border p-6 flex flex-col gap-4">
            <div className="flex justify-between items-center text-muted-foreground">
              <span className="text-xs tracking-widest uppercase">Clients</span>
              <Users className="w-4 h-4 text-primary" />
            </div>
            <p className="font-serif text-3xl text-foreground">{stats?.totalClients || 0}</p>
          </div>
          <div className="bg-card border border-border p-6 flex flex-col gap-4">
            <div className="flex justify-between items-center text-muted-foreground">
              <span className="text-xs tracking-widest uppercase">Produits</span>
              <ShoppingBag className="w-4 h-4 text-primary" />
            </div>
            <p className="font-serif text-3xl text-foreground">{stats?.totalProduits || 0}</p>
          </div>
        </div>

        {/* Orders Table */}
        <h2 className="font-serif text-2xl text-foreground mb-6">Toutes les commandes</h2>
        <div className="bg-card border border-border overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase tracking-widest border-b border-border/50 bg-background/50">
              <tr>
                <th className="px-6 py-4 font-normal">ID</th>
                <th className="px-6 py-4 font-normal">Date</th>
                <th className="px-6 py-4 font-normal">Client</th>
                <th className="px-6 py-4 font-normal">Total</th>
                <th className="px-6 py-4 font-normal">Statut</th>
                <th className="px-6 py-4 font-normal text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {commandes?.map((commande) => (
                <tr key={commande.id} className="border-b border-border/20 hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 text-muted-foreground">#{commande.id}</td>
                  <td className="px-6 py-4">{format(new Date(commande.createdAt), "dd/MM/yyyy HH:mm")}</td>
                  <td className="px-6 py-4">{commande.utilisateur?.nom || `Client #${commande.userId}`}</td>
                  <td className="px-6 py-4 font-medium text-primary">{commande.total.toFixed(2)} €</td>
                  <td className="px-6 py-4">
                    <Select 
                      defaultValue={commande.statut} 
                      onValueChange={(val) => handleStatusChange(commande.id, val)}
                    >
                      <SelectTrigger className="w-[140px] h-8 rounded-none border-border/50 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-none border-border">
                        <SelectItem value="en_attente">En attente</SelectItem>
                        <SelectItem value="confirmee">Confirmée</SelectItem>
                        <SelectItem value="expediee">Expédiée</SelectItem>
                        <SelectItem value="livree">Livrée</SelectItem>
                        <SelectItem value="annulee">Annulée</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {/* Placeholder for detail view if needed */}
                    <span className="text-xs text-muted-foreground uppercase tracking-widest cursor-pointer hover:text-primary transition-colors">Voir</span>
                  </td>
                </tr>
              ))}
              {!commandes?.length && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                    Aucune commande trouvée
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PageTransition>
  );
}
