import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="border-t border-border bg-background pt-20 pb-10">
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-2">
            <Link href="/">
              <span className="font-serif text-3xl tracking-widest text-primary cursor-pointer block mb-6">
                VELMORA
              </span>
            </Link>
            <p className="text-muted-foreground max-w-sm font-serif italic">
              "Ressentez la puissance de l'élégance."
            </p>
            <p className="mt-6 text-sm text-muted-foreground/80 max-w-sm">
              Maison de haute parfumerie fondée sur l'art de la séduction sensorielle et du mystère absolu.
            </p>
          </div>
          
          <div>
            <h4 className="text-sm tracking-widest uppercase text-foreground mb-6 font-semibold">Collections</h4>
            <ul className="space-y-4">
              <li>
                <Link href="/produits?categorie=femme">
                  <span className="text-muted-foreground hover:text-primary transition-colors cursor-pointer text-sm">Pour Femme</span>
                </Link>
              </li>
              <li>
                <Link href="/produits?categorie=homme">
                  <span className="text-muted-foreground hover:text-primary transition-colors cursor-pointer text-sm">Pour Homme</span>
                </Link>
              </li>
              <li>
                <Link href="/produits?categorie=unisexe">
                  <span className="text-muted-foreground hover:text-primary transition-colors cursor-pointer text-sm">Unisexe</span>
                </Link>
              </li>
              <li>
                <Link href="/produits">
                  <span className="text-muted-foreground hover:text-primary transition-colors cursor-pointer text-sm">Tout le catalogue</span>
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm tracking-widest uppercase text-foreground mb-6 font-semibold">Assistance</h4>
            <ul className="space-y-4">
              <li><span className="text-muted-foreground hover:text-primary transition-colors cursor-pointer text-sm">Contactez-nous</span></li>
              <li><span className="text-muted-foreground hover:text-primary transition-colors cursor-pointer text-sm">Livraison & Retours</span></li>
              <li><span className="text-muted-foreground hover:text-primary transition-colors cursor-pointer text-sm">Mentions Légales</span></li>
              <li><span className="text-muted-foreground hover:text-primary transition-colors cursor-pointer text-sm">Politique de Confidentialité</span></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border/50 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Velmora Paris. Tous droits réservés.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-xs text-muted-foreground hover:text-primary cursor-pointer transition-colors">Instagram</span>
            <span className="text-xs text-muted-foreground hover:text-primary cursor-pointer transition-colors">Pinterest</span>
            <span className="text-xs text-muted-foreground hover:text-primary cursor-pointer transition-colors">TikTok</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
