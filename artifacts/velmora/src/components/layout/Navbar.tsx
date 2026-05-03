import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { useCart } from "@/lib/cart";
import { ShoppingBag, User, Menu, X, LogOut, Package } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const [location] = useLocation();
  const { user, logout, isAdmin } = useAuth();
  const { cart } = useCart();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const cartItemCount = cart?.nombreArticles || 0;

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled ? "bg-background/90 backdrop-blur-md border-b border-border py-4" : "bg-transparent py-6"
        }`}
      >
        <div className="container mx-auto px-6 md:px-12">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/">
              <span className="font-serif text-2xl md:text-3xl tracking-widest text-primary cursor-pointer hover:opacity-80 transition-opacity">
                VELMORA
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <Link href="/produits">
                <span className={`text-sm tracking-widest uppercase transition-colors hover:text-primary cursor-pointer ${location === "/produits" ? "text-primary" : "text-foreground"}`}>
                  Catalogue
                </span>
              </Link>
              {isAdmin && (
                <Link href="/admin">
                  <span className={`text-sm tracking-widest uppercase transition-colors hover:text-primary cursor-pointer ${location === "/admin" ? "text-primary" : "text-foreground"}`}>
                    Admin
                  </span>
                </Link>
              )}
            </nav>

            {/* Desktop Icons */}
            <div className="hidden md:flex items-center gap-6">
              <Link href="/panier">
                <div className="relative cursor-pointer hover:text-primary transition-colors text-foreground">
                  <ShoppingBag className="w-5 h-5" strokeWidth={1.5} />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-primary text-background text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                      {cartItemCount}
                    </span>
                  )}
                </div>
              </Link>
              
              {user ? (
                <div className="group relative">
                  <div className="cursor-pointer hover:text-primary transition-colors text-foreground flex items-center gap-2">
                    <User className="w-5 h-5" strokeWidth={1.5} />
                  </div>
                  <div className="absolute right-0 top-full pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top-right group-hover:translate-y-0 translate-y-2">
                    <div className="bg-card border border-border p-2 w-48 shadow-2xl flex flex-col gap-1">
                      <div className="px-3 py-2 border-b border-border/50 mb-1">
                        <p className="text-sm font-serif text-primary truncate">{user.nom}</p>
                      </div>
                      <Link href="/commandes">
                        <span className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-white/5 cursor-pointer transition-colors">
                          <Package className="w-4 h-4" /> Mes commandes
                        </span>
                      </Link>
                      <button 
                        onClick={() => logout()}
                        className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-white/5 cursor-pointer transition-colors text-left w-full"
                      >
                        <LogOut className="w-4 h-4" /> Déconnexion
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <Link href="/connexion">
                  <div className="cursor-pointer hover:text-primary transition-colors text-foreground">
                    <User className="w-5 h-5" strokeWidth={1.5} />
                  </div>
                </Link>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button 
              className="md:hidden text-foreground hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" strokeWidth={1.5} /> : <Menu className="w-6 h-6" strokeWidth={1.5} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border pt-24 pb-8 px-6 md:hidden flex flex-col"
          >
            <nav className="flex flex-col gap-6 items-center text-center mt-12">
              <Link href="/produits">
                <span 
                  className="font-serif text-2xl text-foreground hover:text-primary cursor-pointer transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Catalogue
                </span>
              </Link>
              
              <Link href="/panier">
                <span 
                  className="font-serif text-2xl text-foreground hover:text-primary cursor-pointer transition-colors flex items-center gap-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Panier {cartItemCount > 0 && <span className="text-primary text-sm">({cartItemCount})</span>}
                </span>
              </Link>

              {user ? (
                <>
                  <Link href="/commandes">
                    <span 
                      className="font-serif text-2xl text-foreground hover:text-primary cursor-pointer transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Mes commandes
                    </span>
                  </Link>
                  {isAdmin && (
                    <Link href="/admin">
                      <span 
                        className="font-serif text-2xl text-foreground hover:text-primary cursor-pointer transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Admin
                      </span>
                    </Link>
                  )}
                  <Button 
                    variant="outline" 
                    className="mt-4 border-primary/50 text-primary hover:bg-primary/10"
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                  >
                    Déconnexion
                  </Button>
                </>
              ) : (
                <Link href="/connexion">
                  <span 
                    className="font-serif text-2xl text-foreground hover:text-primary cursor-pointer transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Connexion
                  </span>
                </Link>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
