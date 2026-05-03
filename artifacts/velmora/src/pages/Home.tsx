import { PageTransition } from "@/components/layout/PageTransition";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useGetVedettes, useGetMeilleuresVentes } from "@workspace/api-client-react";
import { ProductCard } from "@/components/ProductCard";
import { motion } from "framer-motion";

export default function Home() {
  const { data: vedettes, isLoading: loadingVedettes } = useGetVedettes();
  const { data: meilleuresVentes, isLoading: loadingVentes } = useGetMeilleuresVentes();

  return (
    <PageTransition className="pt-0 pb-0">
      {/* Hero Section */}
      <section className="relative h-[100dvh] min-h-[600px] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/images/hero.png" 
            alt="Velmora Hero" 
            className="w-full h-full object-cover object-center"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=2000&auto=format&fit=crop";
            }}
          />
          <div className="absolute inset-0 bg-background/60 md:bg-background/40"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/50 to-transparent"></div>
        </div>

        <div className="container relative z-10 mx-auto px-6 md:px-12 flex flex-col items-start pt-20">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="max-w-2xl"
          >
            <p className="text-primary tracking-[0.2em] uppercase text-sm mb-6 flex items-center gap-4">
              <span className="w-12 h-px bg-primary"></span>
              Haute Parfumerie
            </p>
            <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl leading-tight text-white mb-6">
              Ressentez la puissance<br />
              <span className="italic text-primary/90">de l'élégance.</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-10 font-light max-w-lg leading-relaxed">
              Une collection exclusive de fragrances conçues pour laisser une empreinte inoubliable dans le temps.
            </p>
            <Link href="/produits">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-none px-8 py-6 text-sm tracking-widest uppercase h-auto">
                Découvrir la collection
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Promo Banner */}
      <div className="bg-primary/10 border-y border-primary/20 py-4">
        <div className="container mx-auto px-6 text-center">
          <p className="text-primary tracking-widest uppercase text-xs font-medium">
            Un échantillon offert avec chaque parfum | 🚚 Livraison gratuite 🎁
          </p>
        </div>
      </div>

      {/* Produits Vedettes */}
      <section className="py-24 md:py-32 bg-background">
        <div className="container mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div>
              <h2 className="font-serif text-3xl md:text-5xl text-foreground mb-4">Créations Signatures</h2>
              <p className="text-muted-foreground max-w-xl">
                Nos parfums les plus emblématiques, incarnant l'essence même de la maison Velmora.
              </p>
            </div>
            <Link href="/produits">
              <span className="text-primary uppercase tracking-widest text-sm border-b border-primary pb-1 hover:text-primary/80 transition-colors cursor-pointer">
                Tout voir
              </span>
            </Link>
          </div>

          {loadingVedettes ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="aspect-[3/4] bg-card animate-pulse border border-border/30"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {vedettes?.slice(0, 3).map(produit => (
                <ProductCard key={produit.id} product={produit} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Interstitial Banner */}
      <section className="py-32 relative bg-black flex items-center justify-center border-y border-border">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1615634260167-c8cdede054de?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-20 grayscale mix-blend-overlay"></div>
        <div className="container relative z-10 text-center px-6">
          <h2 className="font-serif text-4xl md:text-6xl text-white mb-8 max-w-3xl mx-auto leading-tight">
            "Le parfum est l'invisible, l'inoubliable, l'ultime accessoire."
          </h2>
        </div>
      </section>

      {/* Meilleures Ventes */}
      <section className="py-24 md:py-32 bg-background">
        <div className="container mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl md:text-5xl text-foreground mb-4">Les Préférés</h2>
            <div className="w-16 h-px bg-primary mx-auto"></div>
          </div>

          {loadingVentes ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="aspect-[3/4] bg-card animate-pulse border border-border/30"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {meilleuresVentes?.slice(0, 4).map(produit => (
                <ProductCard key={produit.id} product={produit} />
              ))}
            </div>
          )}
        </div>
      </section>
    </PageTransition>
  );
}
