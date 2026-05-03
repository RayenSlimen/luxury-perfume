import { PageTransition } from "@/components/layout/PageTransition";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { useInscription } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const formSchema = z.object({
  nom: z.string().min(2, "Le nom est requis"),
  email: z.string().email("Adresse email invalide"),
  motDePasse: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
});

type FormValues = z.infer<typeof formSchema>;

export default function Inscription() {
  const { login } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const inscription = useInscription();

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nom: "",
      email: "",
      motDePasse: "",
    }
  });

  const onSubmit = async (data: FormValues) => {
    try {
      const result = await inscription.mutateAsync({ data });
      if (result.token && result.utilisateur) {
        login(result.token, result.utilisateur);
        toast({
          title: "Compte créé",
          description: `Bienvenue chez Velmora, ${result.utilisateur.nom}.`,
          className: "bg-card border-primary text-foreground rounded-none",
        });
        setLocation("/");
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de créer le compte. L'email est peut-être déjà utilisé.",
        variant: "destructive",
        className: "rounded-none",
      });
    }
  };

  return (
    <PageTransition className="flex items-center justify-center py-20 px-6">
      <div className="w-full max-w-md bg-card border border-border p-10 md:p-14 shadow-2xl relative overflow-hidden">
        {/* Decorative corner accents */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-primary/50"></div>
        <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-primary/50"></div>
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-primary/50"></div>
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-primary/50"></div>

        <div className="text-center mb-10">
          <h1 className="font-serif text-3xl text-foreground mb-3">Créer un compte</h1>
          <p className="text-sm text-muted-foreground font-light">Rejoignez le cercle exclusif Velmora.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="nom" className="text-xs tracking-widest uppercase text-muted-foreground">Nom complet</Label>
            <Input 
              id="nom" 
              {...register("nom")}
              className={`bg-background/50 border-border/50 rounded-none h-12 focus-visible:ring-primary/50 ${errors.nom ? 'border-destructive' : ''}`}
            />
            {errors.nom && <p className="text-xs text-destructive mt-1">{errors.nom.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs tracking-widest uppercase text-muted-foreground">Email</Label>
            <Input 
              id="email" 
              type="email" 
              {...register("email")}
              className={`bg-background/50 border-border/50 rounded-none h-12 focus-visible:ring-primary/50 ${errors.email ? 'border-destructive' : ''}`}
            />
            {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="motDePasse" className="text-xs tracking-widest uppercase text-muted-foreground">Mot de passe</Label>
            <Input 
              id="motDePasse" 
              type="password" 
              {...register("motDePasse")}
              className={`bg-background/50 border-border/50 rounded-none h-12 focus-visible:ring-primary/50 ${errors.motDePasse ? 'border-destructive' : ''}`}
            />
            {errors.motDePasse && <p className="text-xs text-destructive mt-1">{errors.motDePasse.message}</p>}
          </div>

          <Button 
            type="submit" 
            disabled={inscription.isPending}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-none h-14 text-sm tracking-widest uppercase mt-4"
          >
            {inscription.isPending ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
            S'inscrire
          </Button>
        </form>

        <div className="mt-10 text-center">
          <p className="text-sm text-muted-foreground">
            Vous avez déjà un compte ?{" "}
            <Link href="/connexion">
              <span className="text-primary hover:underline cursor-pointer">Se connecter</span>
            </Link>
          </p>
        </div>
      </div>
    </PageTransition>
  );
}
