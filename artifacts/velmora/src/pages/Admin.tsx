import React, { useState, useMemo, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useLocation, Link } from "wouter";
import {
  LayoutDashboard, ShoppingCart, Package, Tags, ArrowUpDown,
  BarChart2, Truck, Users, TrendingUp, Megaphone,
  Calculator, Wallet, Store, Palette, Settings, CreditCard,
  ChevronDown, ChevronRight, Plus, Search, Eye, Pencil, Trash2,
  Loader2, RefreshCw, LogOut, ShoppingBag, AlertCircle,
} from "lucide-react";
import {
  useGetAdminStats, useGetAdminCommandes, useUpdateStatutCommande,
  getGetAdminCommandesQueryKey, getGetAdminStatsQueryKey,
  useCreateProduit, useUpdateProduit, useDeleteProduit,
  useGetProduits, getGetProduitsQueryKey,
} from "@workspace/api-client-react";
import type { Produit } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

type CalcState = {
  deliveryCost: number; returnCost: number; fulfillmentCost: number;
  productCost: number; leadCost: number; confirmationRate: number;
  totalSellingPrice: number; totalLeads: number; deliveryRate: number;
};

type Section =
  | "dashboard" | "commandes" | "produits" | "categories" | "upsells"
  | "stats-livraison" | "stats-equipe" | "stats-produits" | "stats-marketing"
  | "calculateur" | "budget" | "equipe"
  | "boutique-theme" | "boutique-params" | "boutique-facturation";

const CATEGORIES_MAP: Record<string, string> = {
  homme: "Pour Lui", femme: "Pour Elle", unisexe: "Unisexe",
  oriental: "Oriental", floral: "Floral", boise: "Boisé",
  aquatique: "Aquatique", gourmand: "Gourmand", citrus: "Citrus",
};

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  en_attente: { label: "En attente", color: "bg-white/10 text-white/70 border-white/20" },
  confirmee: { label: "Confirmée", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  expediee: { label: "Expédiée", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
  livree: { label: "Livrée", color: "bg-green-500/20 text-green-400 border-green-500/30" },
  annulee: { label: "Annulée", color: "bg-red-500/20 text-red-400 border-red-500/30" },
};

const orderColors = ["#B8B8B8", "#4ade80", "#f87171", "#818cf8"];

const produitSchema = z.object({
  nom: z.string().min(2, "Nom requis"),
  description: z.string().min(10, "Description requise"),
  prix: z.coerce.number().min(0),
  imageUrl: z.string().url("URL invalide").or(z.literal("")),
  categorie: z.string().min(1),
  enVedette: z.boolean().default(false),
});
type ProduitForm = z.infer<typeof produitSchema>;

function StatCard({
  label, value, sub, icon: Icon, accent = "text-primary",
}: {
  label: string; value: string | number; sub?: string; icon: React.ElementType; accent?: string;
}) {
  return (
    <div className="bg-card border border-border p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground uppercase tracking-widest">{label}</span>
        <div className={`w-9 h-9 rounded-full flex items-center justify-center bg-white/5 ${accent}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <p className="text-2xl font-serif text-foreground">{value}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <ShoppingCart className="w-14 h-14 text-border mb-4" />
      <p className="text-muted-foreground">{label}</p>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="font-serif text-2xl text-foreground mb-6">{children}</h2>;
}

export default function Admin() {
  const { user, isAdmin, isLoading: authLoading, logout } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [section, setSection] = useState<Section>("dashboard");
  const [statsOpen, setStatsOpen] = useState(false);
  const [produitsOpen, setProduitsOpen] = useState(false);
  const [boutiqueOpen, setBoutiqueOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [editProduit, setEditProduit] = useState<Produit | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [commandeFilter, setCommandeFilter] = useState("all");

  // Calculator state
  const [calc, setCalc] = useState<CalcState>({
    deliveryCost: 7, returnCost: 1, fulfillmentCost: 0,
    productCost: 15, leadCost: 3.5, confirmationRate: 75,
    totalSellingPrice: 40, totalLeads: 100, deliveryRate: 80,
  });
  const [calcResult, setCalcResult] = useState<null | {
    confirmedLeads: number; deliveredLeads: number; profitPerUnit: number;
    totalProfit: number; leadCostPerDelivered: number; breakEven: number;
  }>(null);

  const calculate = () => {
    const confirmed = (calc.totalLeads * calc.confirmationRate) / 100;
    const delivered = (confirmed * calc.deliveryRate) / 100;
    const profitPerUnit = calc.totalSellingPrice - calc.productCost - calc.deliveryCost
      - calc.fulfillmentCost - (calc.returnCost * (100 - calc.deliveryRate)) / 100;
    const totalProfit = delivered * profitPerUnit - calc.totalLeads * calc.leadCost;
    const leadCostPerDelivered = delivered > 0 ? (calc.totalLeads * calc.leadCost) / delivered : 0;
    const breakEven = delivered > 0 ? profitPerUnit - (calc.totalLeads * calc.leadCost) / delivered : 0;
    setCalcResult({
      confirmedLeads: Math.round(confirmed),
      deliveredLeads: Math.round(delivered),
      profitPerUnit: Math.round(profitPerUnit * 100) / 100,
      totalProfit: Math.round(totalProfit * 100) / 100,
      leadCostPerDelivered: Math.round(leadCostPerDelivered * 100) / 100,
      breakEven: Math.round(Math.abs(breakEven) * 100) / 100,
    });
  };

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      setLocation("/");
    }
  }, [authLoading, user, isAdmin]);

  if (!authLoading && (!user || !isAdmin)) {
    return null;
  }

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* ── SIDEBAR ── */}
      <aside className="w-60 shrink-0 bg-card border-r border-border flex flex-col overflow-y-auto">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-border">
          <Link href="/">
            <span className="font-serif text-xl tracking-widest text-foreground cursor-pointer">VELMORA</span>
          </Link>
          <p className="text-[10px] text-muted-foreground tracking-widest uppercase mt-0.5">Administration</p>
        </div>

        {/* Store badge */}
        <div className="mx-3 mt-3 p-3 bg-primary/10 border border-primary/20 flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">V</div>
          <div>
            <p className="text-xs text-foreground font-medium">VELMORA</p>
            <p className="text-[10px] text-muted-foreground">Parfumerie de Luxe</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 space-y-0.5 px-2">
          <NavItem icon={LayoutDashboard} label="Tableau de bord" active={section === "dashboard"} onClick={() => setSection("dashboard")} />
          <NavItem icon={ShoppingCart} label="Commandes" active={section === "commandes"} onClick={() => setSection("commandes")} />

          {/* Produits group */}
          <NavGroup
            icon={Package} label="Produits" open={produitsOpen}
            onClick={() => setProduitsOpen(o => !o)}
          >
            <NavSubItem label="Produits" active={section === "produits"} onClick={() => { setSection("produits"); setProduitsOpen(true); }} />
            <NavSubItem label="Catégories" active={section === "categories"} onClick={() => { setSection("categories"); setProduitsOpen(true); }} />
          </NavGroup>

          <NavItem icon={ArrowUpDown} label="Up/Cross Sells" active={section === "upsells"} onClick={() => setSection("upsells")} />

          {/* Stats group */}
          <NavGroup
            icon={BarChart2} label="Statistiques" open={statsOpen}
            onClick={() => setStatsOpen(o => !o)}
          >
            <NavSubItem label="Livraison" active={section === "stats-livraison"} onClick={() => { setSection("stats-livraison"); setStatsOpen(true); }} />
            <NavSubItem label="Équipe" active={section === "stats-equipe"} onClick={() => { setSection("stats-equipe"); setStatsOpen(true); }} />
            <NavSubItem label="Produits" active={section === "stats-produits"} onClick={() => { setSection("stats-produits"); setStatsOpen(true); }} />
            <NavSubItem label="Marketing" active={section === "stats-marketing"} onClick={() => { setSection("stats-marketing"); setStatsOpen(true); }} />
          </NavGroup>

          <NavItem icon={Calculator} label="Calculateur" active={section === "calculateur"} onClick={() => setSection("calculateur")} />
          <NavItem icon={Wallet} label="Budget" active={section === "budget"} onClick={() => setSection("budget")} />
          <NavItem icon={Users} label="Équipe" active={section === "equipe"} onClick={() => setSection("equipe")} />

          {/* Boutique group */}
          <NavGroup
            icon={Store} label="Boutique" open={boutiqueOpen}
            onClick={() => setBoutiqueOpen(o => !o)}
          >
            <NavSubItem label="Thème" active={section === "boutique-theme"} onClick={() => { setSection("boutique-theme"); setBoutiqueOpen(true); }} />
            <NavSubItem label="Paramètres" active={section === "boutique-params"} onClick={() => { setSection("boutique-params"); setBoutiqueOpen(true); }} />
            <NavSubItem label="Facturation" active={section === "boutique-facturation"} onClick={() => { setSection("boutique-facturation"); setBoutiqueOpen(true); }} />
          </NavGroup>
        </nav>

        {/* Bottom: user */}
        <div className="border-t border-border p-3 flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold shrink-0">
            {user?.nom?.[0]?.toUpperCase() ?? "A"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-foreground truncate">{user?.nom}</p>
            <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
          </div>
          <button onClick={() => { logout(); setLocation("/"); }} className="text-muted-foreground hover:text-foreground transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 overflow-y-auto bg-background">
        {/* Top header */}
        <header className="sticky top-0 z-10 bg-card border-b border-border px-6 py-3 flex items-center justify-between">
          <Breadcrumb section={section} />
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground hidden sm:block">
              {format(new Date(), "dd MMM yyyy", { locale: fr })}
            </span>
            <Link href="/">
              <span className="text-xs text-primary border border-primary/30 px-3 py-1.5 hover:bg-primary/10 transition-colors cursor-pointer tracking-widest uppercase">
                ← Boutique
              </span>
            </Link>
          </div>
        </header>

        {/* Section content */}
        <div className="p-6">
          {section === "dashboard" && (
            <DashboardSection setSection={setSection} />
          )}
          {section === "commandes" && (
            <CommandesSection
              filter={commandeFilter}
              setFilter={setCommandeFilter}
              queryClient={queryClient}
              toast={toast}
            />
          )}
          {section === "produits" && (
            <ProduitsSection
              search={search} setSearch={setSearch}
              editProduit={editProduit} setEditProduit={setEditProduit}
              isAddOpen={isAddOpen} setIsAddOpen={setIsAddOpen}
              queryClient={queryClient} toast={toast}
            />
          )}
          {section === "categories" && <CategoriesSection />}
          {section === "upsells" && <UpsellsSection />}
          {section === "stats-livraison" && <StatsLivraison />}
          {section === "stats-equipe" && <StatsEquipe />}
          {section === "stats-produits" && <StatsProduits />}
          {section === "stats-marketing" && <StatsMarketing />}
          {section === "calculateur" && (
            <CalculateurSection calc={calc} setCalc={setCalc} result={calcResult} onCalculate={calculate} />
          )}
          {section === "budget" && <BudgetSection />}
          {section === "equipe" && <EquipeSection />}
          {section === "boutique-theme" && <BoutiqueTheme />}
          {section === "boutique-params" && <BoutiqueParams />}
          {section === "boutique-facturation" && <BoutiqueFacturation />}
        </div>
      </main>
    </div>
  );
}

/* ── Sidebar components ── */

function NavItem({ icon: Icon, label, active, onClick }: {
  icon: React.ElementType; label: string; active: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2 text-sm transition-colors rounded-sm ${
        active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
      }`}
    >
      <Icon className="w-4 h-4 shrink-0" />
      <span>{label}</span>
    </button>
  );
}

function NavGroup({ icon: Icon, label, open, onClick, children }: {
  icon: React.ElementType; label: string; open: boolean; onClick: () => void; children: React.ReactNode;
}) {
  return (
    <div>
      <button
        onClick={onClick}
        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors rounded-sm"
      >
        <Icon className="w-4 h-4 shrink-0" />
        <span className="flex-1 text-left">{label}</span>
        {open ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
      </button>
      {open && (
        <div className="ml-6 border-l border-border/40 pl-3 mt-0.5 space-y-0.5">
          {children}
        </div>
      )}
    </div>
  );
}

function NavSubItem({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left text-sm px-2 py-1.5 transition-colors rounded-sm ${
        active ? "text-primary" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}

function Breadcrumb({ section }: { section: Section }) {
  const labels: Record<Section, string[]> = {
    dashboard: ["Tableau de bord"],
    commandes: ["Commandes"],
    produits: ["Produits", "Produits"],
    categories: ["Produits", "Catégories"],
    upsells: ["Up/Cross Sells"],
    "stats-livraison": ["Statistiques", "Livraison"],
    "stats-equipe": ["Statistiques", "Équipe"],
    "stats-produits": ["Statistiques", "Produits"],
    "stats-marketing": ["Statistiques", "Marketing"],
    calculateur: ["Calculateur"],
    budget: ["Budget Manager"],
    equipe: ["Équipe"],
    "boutique-theme": ["Boutique", "Thème"],
    "boutique-params": ["Boutique", "Paramètres"],
    "boutique-facturation": ["Boutique", "Facturation"],
  };
  const parts = labels[section] || [section];
  return (
    <div className="flex items-center gap-2 text-sm">
      {parts.map((p, i) => (
        <span key={i} className={`${i < parts.length - 1 ? "text-muted-foreground" : "text-foreground font-medium"}`}>
          {p}{i < parts.length - 1 && <span className="mx-2 text-border">/</span>}
        </span>
      ))}
    </div>
  );
}

/* ── DASHBOARD ── */
function DashboardSection({ setSection }: { setSection: (s: Section) => void }) {
  const { data: stats, isLoading: statsLoading } = useGetAdminStats();
  const { data: commandes, isLoading: ordersLoading } = useGetAdminCommandes();

  const ordersByDay = useMemo(() => {
    const days: Record<string, number> = {};
    const now = new Date();
    for (let i = 9; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      days[format(d, "dd/MM")] = 0;
    }
    commandes?.forEach(c => {
      const key = format(new Date(c.createdAt), "dd/MM");
      if (key in days) days[key]++;
    });
    return Object.entries(days).map(([date, commandes]) => ({ date, commandes }));
  }, [commandes]);

  const pieData = useMemo(() => {
    const counts: Record<string, number> = {};
    commandes?.forEach(c => { counts[c.statut] = (counts[c.statut] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name: STATUS_MAP[name]?.label ?? name, value }));
  }, [commandes]);

  const thisWeek = commandes?.filter(c => {
    const diff = (Date.now() - new Date(c.createdAt).getTime()) / 86400000;
    return diff <= 7;
  });
  const today = commandes?.filter(c => {
    const diff = (Date.now() - new Date(c.createdAt).getTime()) / 86400000;
    return diff <= 1;
  });

  return (
    <div className="space-y-8">
      <SectionTitle>Tableau de bord</SectionTitle>

      {/* Progress overview */}
      <div className="bg-card border border-border p-4 flex items-center gap-4">
        <span className="text-xs text-muted-foreground uppercase tracking-widest whitespace-nowrap">Aperçu général :</span>
        <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
          <div className="h-full bg-primary transition-all" style={{ width: `${Math.min(100, ((commandes?.length || 0) / 50) * 100)}%` }} />
        </div>
        <span className="text-xs text-muted-foreground">{commandes?.length || 0}/50</span>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Commandes aujourd'hui" value={`${(today?.reduce((s, c) => s + Number(c.total), 0) || 0).toFixed(2)} €`} icon={ShoppingCart} accent="text-blue-400" />
        <StatCard label="Commandes cette semaine" value={`${(thisWeek?.reduce((s, c) => s + Number(c.total), 0) || 0).toFixed(2)} €`} icon={TrendingUp} accent="text-green-400" />
        <StatCard label="Commandes ce mois" value={`${(commandes?.reduce((s, c) => s + Number(c.total), 0) || 0).toFixed(2)} €`} icon={BarChart2} accent="text-purple-400" />
        <StatCard label="Chiffre d'affaires total" value={`${(stats?.chiffreAffaires || 0).toFixed(2)} €`} icon={Wallet} accent="text-primary" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Orders line chart */}
        <div className="lg:col-span-2 bg-card border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-foreground font-medium">Commandes — 10 derniers jours</p>
            <span className="text-xs text-muted-foreground">{commandes?.length || 0} total</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={ordersByDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 15%)" />
              <XAxis dataKey="date" tick={{ fill: "hsl(0 0% 45%)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "hsl(0 0% 45%)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "hsl(0 0% 6%)", border: "1px solid hsl(0 0% 18%)", borderRadius: 0 }} />
              <Line type="monotone" dataKey="commandes" stroke="hsl(0 0% 72%)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Orders traffic pie */}
        <div className="bg-card border border-border p-5">
          <p className="text-sm text-foreground font-medium mb-4">Trafic des commandes</p>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={2}>
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={orderColors[i % orderColors.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "hsl(0 0% 6%)", border: "1px solid hsl(0 0% 18%)", borderRadius: 0 }} />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">Aucune donnée</div>
          )}
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total commandes" value={stats?.totalCommandes || 0} icon={Package} />
        <StatCard label="Clients" value={stats?.totalClients || 0} icon={Users} accent="text-blue-400" />
        <StatCard label="Produits" value={stats?.totalProduits || 0} icon={ShoppingBag} accent="text-green-400" />
        <StatCard label="Panier moyen" value={`${stats?.totalCommandes ? ((stats?.chiffreAffaires || 0) / stats.totalCommandes).toFixed(2) : "0.00"} €`} icon={TrendingUp} accent="text-purple-400" />
      </div>

      {/* Recent orders preview */}
      <div className="bg-card border border-border">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <p className="text-sm font-medium text-foreground">Dernières commandes</p>
          <button onClick={() => setSection("commandes")} className="text-xs text-primary hover:underline">Tout voir</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/40">
                {["ID", "Client", "Total", "Statut", "Date"].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs text-muted-foreground uppercase tracking-widest font-normal">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {commandes?.slice(0, 5).map(c => (
                <tr key={c.id} className="border-b border-border/20 hover:bg-white/3 transition-colors">
                  <td className="px-5 py-3 text-muted-foreground">#{c.id}</td>
                  <td className="px-5 py-3">{c.utilisateur?.nom ?? `Client #${c.userId}`}</td>
                  <td className="px-5 py-3 text-primary font-medium">{Number(c.total).toFixed(2)} €</td>
                  <td className="px-5 py-3">
                    <span className={`text-[10px] border px-2 py-1 uppercase tracking-widest ${STATUS_MAP[c.statut]?.color}`}>
                      {STATUS_MAP[c.statut]?.label ?? c.statut}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground text-xs">{format(new Date(c.createdAt), "dd/MM/yyyy HH:mm")}</td>
                </tr>
              ))}
              {!commandes?.length && (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-muted-foreground">Aucune commande</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ── COMMANDES ── */
function CommandesSection({ filter, setFilter, queryClient, toast }: {
  filter: string; setFilter: (f: string) => void;
  queryClient: ReturnType<typeof useQueryClient>; toast: ReturnType<typeof useToast>["toast"];
}) {
  const { data: commandes, isLoading } = useGetAdminCommandes();
  const updateStatut = useUpdateStatutCommande();
  const [search, setSearch] = useState("");

  const filtered = commandes?.filter(c => {
    const matchSearch = !search || c.utilisateur?.nom?.toLowerCase().includes(search.toLowerCase()) || String(c.id).includes(search);
    const matchFilter = filter === "all" || c.statut === filter;
    return matchSearch && matchFilter;
  });

  const handleStatus = async (id: number, statut: string) => {
    try {
      await updateStatut.mutateAsync({ id, data: { statut: statut as any } });
      queryClient.invalidateQueries({ queryKey: getGetAdminCommandesQueryKey() });
      toast({ title: "Statut mis à jour", className: "bg-card border-primary text-foreground rounded-none" });
    } catch {
      toast({ title: "Erreur", variant: "destructive", className: "rounded-none" });
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <SectionTitle>Commandes</SectionTitle>
        <div className="flex gap-3 flex-wrap">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..." className="pl-8 pr-3 h-9 text-sm bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 w-52" />
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-40 h-9 rounded-none border-border text-sm">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent className="rounded-none border-border">
              <SelectItem value="all">Tous</SelectItem>
              {Object.entries(STATUS_MAP).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-border mb-6 text-sm">
        {[{ id: "all", label: "Commandes" }, { id: "en_attente", label: "En attente" }, { id: "livree", label: "Livrées" }, { id: "annulee", label: "Annulées" }].map(t => (
          <button key={t.id} onClick={() => setFilter(t.id)}
            className={`pb-2 px-1 transition-colors ${filter === t.id ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-7 h-7 animate-spin text-primary" /></div>
      ) : (
        <div className="bg-card border border-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/40">
                {["ID", "Client", "Date", "Livraison", "Statut", "Total", "Actions"].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs text-muted-foreground uppercase tracking-widest font-normal">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered?.map(c => (
                <tr key={c.id} className="border-b border-border/20 hover:bg-white/3 transition-colors">
                  <td className="px-5 py-3 text-muted-foreground">#{c.id}</td>
                  <td className="px-5 py-3">{c.utilisateur?.nom ?? `Client #${c.userId}`}</td>
                  <td className="px-5 py-3 text-muted-foreground text-xs">{format(new Date(c.createdAt), "dd/MM/yyyy HH:mm")}</td>
                  <td className="px-5 py-3 text-xs text-muted-foreground">Standard</td>
                  <td className="px-5 py-3">
                    <Select defaultValue={c.statut} onValueChange={v => handleStatus(c.id, v)}>
                      <SelectTrigger className="h-7 w-36 rounded-none border-border/50 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-none border-border">
                        {Object.entries(STATUS_MAP).map(([k, v]) => (
                          <SelectItem key={k} value={k}>{v.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-5 py-3 text-primary font-medium">{Number(c.total).toFixed(2)} €</td>
                  <td className="px-5 py-3">
                    <button className="text-muted-foreground hover:text-foreground"><Eye className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
              {!filtered?.length && (
                <tr><td colSpan={7} className="px-5 py-12 text-center text-muted-foreground">Aucune commande trouvée</td></tr>
              )}
            </tbody>
          </table>
          <div className="px-5 py-3 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
            <span>Résultats : {filtered?.length ?? 0}</span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── PRODUITS ── */
const CATEGORIES_ALL = ["homme", "femme", "unisexe", "oriental", "floral", "boise", "aquatique", "gourmand", "citrus"];

function ProduitsSection({ search, setSearch, editProduit, setEditProduit, isAddOpen, setIsAddOpen, queryClient, toast }: {
  search: string; setSearch: (s: string) => void;
  editProduit: Produit | null; setEditProduit: (p: Produit | null) => void;
  isAddOpen: boolean; setIsAddOpen: (o: boolean) => void;
  queryClient: ReturnType<typeof useQueryClient>; toast: ReturnType<typeof useToast>["toast"];
}) {
  const { data, isLoading } = useGetProduits({ limite: 50 });
  const deleteProduit = useDeleteProduit();
  const [catFilter, setCatFilter] = useState("all");

  const filtered = data?.produits?.filter(p => {
    const matchSearch = !search || p.nom.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === "all" || p.categorie === catFilter;
    return matchSearch && matchCat;
  });

  const totalRevenue = data?.produits?.reduce((s, p) => s + Number(p.prix), 0) || 0;

  const handleDelete = async (id: number) => {
    if (!confirm("Supprimer ce produit ?")) return;
    try {
      await deleteProduit.mutateAsync({ id });
      queryClient.invalidateQueries({ queryKey: getGetProduitsQueryKey() });
      toast({ title: "Produit supprimé", className: "bg-card border-primary text-foreground rounded-none" });
    } catch {
      toast({ title: "Erreur", variant: "destructive", className: "rounded-none" });
    }
  };

  return (
    <div>
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-card border border-border p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center"><Package className="w-5 h-5 text-primary" /></div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-widest">Total Stock</p>
            <p className="text-xl font-serif">{data?.produits?.length ?? 0}</p>
            <p className="text-xs text-muted-foreground">Valeur: {totalRevenue.toFixed(0)} €</p>
          </div>
        </div>
        <div className="bg-card border border-border p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center"><AlertCircle className="w-5 h-5 text-red-400" /></div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-widest">Stock endommagé</p>
            <p className="text-xl font-serif">0</p>
            <p className="text-xs text-muted-foreground">Valeur: 0 €</p>
          </div>
        </div>
        <div className="bg-card border border-border p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center"><TrendingUp className="w-5 h-5 text-green-400" /></div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-widest">Chiffre estimé</p>
            <p className="text-xl font-serif text-green-400">{totalRevenue.toFixed(2)} €</p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between mb-6">
        <div className="flex gap-3 flex-wrap">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..." className="pl-8 pr-3 h-9 text-sm bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 w-48" />
          </div>
          <Select value={catFilter} onValueChange={setCatFilter}>
            <SelectTrigger className="w-36 h-9 rounded-none border-border text-sm"><SelectValue placeholder="Catégorie" /></SelectTrigger>
            <SelectContent className="rounded-none border-border">
              <SelectItem value="all">Toutes</SelectItem>
              {CATEGORIES_ALL.map(c => <SelectItem key={c} value={c}>{CATEGORIES_MAP[c]}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-none text-xs tracking-widest uppercase h-9 px-4">
          <Plus className="w-3.5 h-3.5 mr-1.5" /> Ajouter un produit
        </Button>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-7 h-7 animate-spin text-primary" /></div>
      ) : (
        <div className="bg-card border border-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/40">
                {["ID", "Image", "Nom", "Prix", "Catégorie", "Vedette", "Ventes", "Actions"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs text-muted-foreground uppercase tracking-widest font-normal">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered?.map(p => (
                <tr key={p.id} className="border-b border-border/20 hover:bg-white/3 transition-colors">
                  <td className="px-4 py-3 text-muted-foreground">{p.id}</td>
                  <td className="px-4 py-3">
                    <div className="w-10 h-10 bg-black border border-border overflow-hidden">
                      <img src={p.imageUrl || ""} alt={p.nom} className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium max-w-[160px] truncate">{p.nom}</td>
                  <td className="px-4 py-3 text-primary">{Number(p.prix).toFixed(2)} €</td>
                  <td className="px-4 py-3">
                    <span className="text-[10px] border border-border px-2 py-0.5 uppercase tracking-widest text-muted-foreground">
                      {CATEGORIES_MAP[p.categorie] ?? p.categorie}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] border px-2 py-0.5 uppercase tracking-widest ${p.enVedette ? "text-green-400 border-green-500/30 bg-green-500/10" : "text-muted-foreground border-border"}`}>
                      {p.enVedette ? "Oui" : "Non"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{p.nombreVentes}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => setEditProduit(p)} className="text-muted-foreground hover:text-foreground transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleDelete(p.id)} className="text-muted-foreground hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {!filtered?.length && (
                <tr><td colSpan={8} className="px-5 py-12 text-center text-muted-foreground">Aucun produit trouvé</td></tr>
              )}
            </tbody>
          </table>
          <div className="px-5 py-3 border-t border-border/40 text-xs text-muted-foreground">
            {filtered?.length ?? 0} produit(s)
          </div>
        </div>
      )}

      {/* Add dialog */}
      <ProduitDialog open={isAddOpen} onClose={() => setIsAddOpen(false)} queryClient={queryClient} toast={toast} />
      {editProduit && (
        <ProduitDialog open={!!editProduit} onClose={() => setEditProduit(null)} produit={editProduit} queryClient={queryClient} toast={toast} />
      )}
    </div>
  );
}

function ProduitDialog({ open, onClose, produit, queryClient, toast }: {
  open: boolean; onClose: () => void; produit?: Produit;
  queryClient: ReturnType<typeof useQueryClient>; toast: ReturnType<typeof useToast>["toast"];
}) {
  const createProduit = useCreateProduit();
  const updateProduit = useUpdateProduit();

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<ProduitForm>({
    resolver: zodResolver(produitSchema),
    defaultValues: produit ? {
      nom: produit.nom, description: produit.description,
      prix: Number(produit.prix), imageUrl: produit.imageUrl,
      categorie: produit.categorie, enVedette: produit.enVedette,
    } : { nom: "", description: "", prix: 0, imageUrl: "", categorie: "unisexe", enVedette: false },
  });

  const onSubmit = async (data: ProduitForm) => {
    try {
      if (produit) {
        await updateProduit.mutateAsync({ id: produit.id, data: data as any });
        toast({ title: "Produit mis à jour", className: "bg-card border-primary text-foreground rounded-none" });
      } else {
        await createProduit.mutateAsync({ data: data as any });
        toast({ title: "Produit créé", className: "bg-card border-primary text-foreground rounded-none" });
      }
      queryClient.invalidateQueries({ queryKey: getGetProduitsQueryKey() });
      onClose(); reset();
    } catch {
      toast({ title: "Erreur", variant: "destructive", className: "rounded-none" });
    }
  };

  const isPending = createProduit.isPending || updateProduit.isPending;

  return (
    <Dialog open={open} onOpenChange={() => { onClose(); reset(); }}>
      <DialogContent className="bg-card border-border rounded-none sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">{produit ? "Modifier le parfum" : "Ajouter un parfum"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs uppercase tracking-widest text-muted-foreground">Nom</Label>
              <Input {...register("nom")} className="rounded-none border-border/50 mt-1 h-9" />
              {errors.nom && <p className="text-red-400 text-xs mt-1">{errors.nom.message}</p>}
            </div>
            <div>
              <Label className="text-xs uppercase tracking-widest text-muted-foreground">Prix (€)</Label>
              <Input type="number" step="0.01" {...register("prix")} className="rounded-none border-border/50 mt-1 h-9" />
            </div>
          </div>
          <div>
            <Label className="text-xs uppercase tracking-widest text-muted-foreground">Catégorie</Label>
            <Select onValueChange={v => setValue("categorie", v)} defaultValue={watch("categorie")}>
              <SelectTrigger className="rounded-none border-border/50 mt-1 h-9 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent className="rounded-none border-border">
                {CATEGORIES_ALL.map(c => <SelectItem key={c} value={c}>{CATEGORIES_MAP[c]}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs uppercase tracking-widest text-muted-foreground">Description</Label>
            <Textarea {...register("description")} className="rounded-none border-border/50 mt-1 min-h-[80px] text-sm" />
            {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description.message}</p>}
          </div>
          <div>
            <Label className="text-xs uppercase tracking-widest text-muted-foreground">URL Image</Label>
            <Input {...register("imageUrl")} placeholder="https://..." className="rounded-none border-border/50 mt-1 h-9" />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="vedette" {...register("enVedette")} className="accent-primary w-4 h-4" />
            <Label htmlFor="vedette" className="text-sm text-muted-foreground cursor-pointer">Mettre en vedette</Label>
          </div>
          <Button type="submit" disabled={isPending} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-none uppercase tracking-widest text-xs h-10">
            {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            {produit ? "Mettre à jour" : "Créer le parfum"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ── CATÉGORIES ── */
function CategoriesSection() {
  const { data } = useGetProduits({ limite: 100 });
  const cats = useMemo(() => {
    const map: Record<string, number> = {};
    data?.produits?.forEach(p => { map[p.categorie] = (map[p.categorie] || 0) + 1; });
    return Object.entries(map).map(([cat, count]) => ({ cat, count }));
  }, [data]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <SectionTitle>Catégories</SectionTitle>
        <button className="flex items-center gap-1.5 bg-primary/10 border border-primary/30 text-primary text-xs px-4 py-2 hover:bg-primary/20 transition-colors uppercase tracking-widest">
          <Plus className="w-3.5 h-3.5" /> Ajouter une catégorie
        </button>
      </div>
      <div className="bg-card border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/40">
              {["Nom", "Type", "Produits", "Statut", "Actions"].map(h => (
                <th key={h} className="px-5 py-3 text-left text-xs text-muted-foreground uppercase tracking-widest font-normal">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cats.map(({ cat, count }) => (
              <tr key={cat} className="border-b border-border/20 hover:bg-white/3 transition-colors">
                <td className="px-5 py-4 font-medium">{CATEGORIES_MAP[cat] ?? cat}</td>
                <td className="px-5 py-4"><span className="text-[10px] border border-border px-2 py-0.5 text-muted-foreground uppercase tracking-widest">Catégorie</span></td>
                <td className="px-5 py-4 text-muted-foreground">{count}</td>
                <td className="px-5 py-4">
                  <span className="text-[10px] border border-green-500/30 bg-green-500/10 text-green-400 px-2 py-0.5 uppercase tracking-widest">Visible</span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <button className="text-muted-foreground hover:text-foreground"><Eye className="w-3.5 h-3.5" /></button>
                    <button className="text-muted-foreground hover:text-foreground"><Pencil className="w-3.5 h-3.5" /></button>
                    <button className="text-muted-foreground hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── UPSELLS ── */
function UpsellsSection() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <SectionTitle>Up/Cross Sells</SectionTitle>
        <button className="flex items-center gap-1.5 bg-primary/10 border border-primary/30 text-primary text-xs px-4 py-2 hover:bg-primary/20 transition-colors uppercase tracking-widest">
          <Plus className="w-3.5 h-3.5" /> Créer un Upsell
        </button>
      </div>
      <div className="bg-card border border-border">
        <div className="flex gap-4 px-5 pt-4 border-b border-border mb-0 text-sm">
          {["Nom", "Type", "Priorité", "Produits", "Statut", "Actions"].map(h => (
            <span key={h} className="pb-3 text-xs text-muted-foreground uppercase tracking-widest">{h}</span>
          ))}
        </div>
        <EmptyState label="Aucun upsell configuré" />
      </div>
    </div>
  );
}

/* ── STATS LIVRAISON ── */
function StatsLivraison() {
  const deliveryData = [
    { date: "Apr 24", livrées: 0, retournées: 0 }, { date: "Apr 25", livrées: 0, retournées: 0 },
    { date: "Apr 26", livrées: 2, retournées: 0 }, { date: "Apr 27", livrées: 1, retournées: 0 },
    { date: "Apr 28", livrées: 3, retournées: 1 }, { date: "Apr 29", livrées: 2, retournées: 0 },
    { date: "Apr 30", livrées: 4, retournées: 0 }, { date: "May 01", livrées: 3, retournées: 1 },
    { date: "May 02", livrées: 5, retournées: 0 }, { date: "May 03", livrées: 2, retournées: 0 },
  ];
  return (
    <div className="space-y-6">
      <SectionTitle>Statistiques — Livraison</SectionTitle>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="En dépôt" value="0" sub="Profit estimé: 0 €" icon={Package} />
        <StatCard label="En transit" value="0" sub="Profit estimé: 0 €" icon={Truck} accent="text-blue-400" />
        <StatCard label="Livrées" value="0" sub="Profit: 0 €" icon={TrendingUp} accent="text-green-400" />
        <StatCard label="Retournées" value="0" sub="Perte: 0 €" icon={RefreshCw} accent="text-red-400" />
      </div>
      <div className="bg-card border border-border p-5">
        <p className="text-sm font-medium text-foreground mb-4">Performance livraison</p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={deliveryData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 15%)" />
            <XAxis dataKey="date" tick={{ fill: "hsl(0 0% 45%)", fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "hsl(0 0% 45%)", fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: "hsl(0 0% 6%)", border: "1px solid hsl(0 0% 18%)", borderRadius: 0 }} />
            <Bar dataKey="livrées" fill="hsl(0 0% 72%)" radius={[2, 2, 0, 0]} />
            <Bar dataKey="retournées" fill="hsl(0 62.8% 30.6%)" radius={[2, 2, 0, 0]} />
            <Legend wrapperStyle={{ fontSize: "11px" }} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ── STATS ÉQUIPE ── */
function StatsEquipe() {
  return (
    <div className="space-y-6">
      <SectionTitle>Statistiques — Équipe</SectionTitle>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Commandes confirmées" value="0" icon={TrendingUp} accent="text-green-400" />
        <StatCard label="Commandes rejetées" value="0" icon={RefreshCw} accent="text-red-400" />
        <StatCard label="Commandes créées" value="0" icon={Package} accent="text-blue-400" />
        <StatCard label="Tentatives d'appel" value="0" icon={Users} accent="text-purple-400" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {["Temps moyen de confirmation", "Raisons de rejet", "Temps moyen avant 1ère tentative"].map(t => (
          <div key={t} className="bg-card border border-border p-5">
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-4">{t}</p>
            <div className="flex items-center justify-center h-28 text-muted-foreground text-sm">Aucune donnée disponible</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── STATS PRODUITS ── */
function StatsProduits() {
  const { data } = useGetProduits({ limite: 100 });
  const total = data?.produits?.length || 0;
  const totalVal = data?.produits?.reduce((s, p) => s + Number(p.prix), 0) || 0;

  return (
    <div className="space-y-6">
      <SectionTitle>Statistiques — Produits</SectionTitle>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total unités" value={total} sub={`Valeur: ${totalVal.toFixed(0)} €`} icon={Package} />
        <StatCard label="Unités en attente" value="0" sub="Valeur: 0 €" icon={Loader2} accent="text-yellow-400" />
        <StatCard label="Unités confirmées" value="0" sub="Valeur: 0 €" icon={TrendingUp} accent="text-green-400" />
        <StatCard label="Unités rejetées" value="0" sub="Valeur: 0 €" icon={RefreshCw} accent="text-red-400" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="En dépôt" value="0" icon={Package} accent="text-blue-400" />
        <StatCard label="En transit" value="0" icon={Truck} accent="text-purple-400" />
        <StatCard label="Livrées" value="0" icon={TrendingUp} accent="text-green-400" />
        <StatCard label="Retournées" value="0" icon={RefreshCw} accent="text-red-400" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card border border-border p-5">
          <p className="text-sm font-medium mb-1">Confirmées vs Rejetées</p>
          <p className="text-[10px] text-muted-foreground mb-4">Confirmé 0% · Rejeté 0%</p>
          <div className="flex items-center justify-center h-24 text-muted-foreground text-sm">Aucune donnée disponible</div>
        </div>
        <div className="bg-card border border-border p-5">
          <p className="text-sm font-medium mb-1">Livrées vs Retournées</p>
          <p className="text-[10px] text-muted-foreground mb-4">Livré 0% · Retourné 0%</p>
          <div className="flex items-center justify-center h-24 text-muted-foreground text-sm">Aucune donnée disponible</div>
        </div>
      </div>
    </div>
  );
}

/* ── STATS MARKETING ── */
function StatsMarketing() {
  return (
    <div className="space-y-6">
      <SectionTitle>Statistiques — Marketing</SectionTitle>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="Commandes en attente" value="0" sub="Valeur: 0 €" icon={Package} />
        <StatCard label="Commandes confirmées" value="0" sub="Valeur: 0 €" icon={TrendingUp} accent="text-green-400" />
        <StatCard label="Commandes rejetées" value="0" sub="Valeur: 0 €" icon={RefreshCw} accent="text-red-400" />
        <StatCard label="Total commandes" value="0" sub="Valeur: 0 €" icon={ShoppingCart} accent="text-blue-400" />
        <StatCard label="Commandes livrées" value="0" sub="Profit: 0 €" icon={Truck} accent="text-purple-400" />
        <StatCard label="Commandes retournées" value="0" sub="Perte: 0 €" icon={RefreshCw} accent="text-red-400" />
      </div>
      <div className="bg-card border border-border">
        <div className="px-5 py-4 border-b border-border">
          <p className="text-sm font-medium">Campagnes marketing</p>
        </div>
        <EmptyState label="Aucune campagne configurée" />
      </div>
    </div>
  );
}

/* ── CALCULATEUR ── */
function CalculateurSection({ calc, setCalc, result, onCalculate }: {
  calc: CalcState;
  setCalc: React.Dispatch<React.SetStateAction<CalcState>>;
  result: null | { confirmedLeads: number; deliveredLeads: number; profitPerUnit: number; totalProfit: number; leadCostPerDelivered: number; breakEven: number };
  onCalculate: () => void;
}) {
  const fields = [
    { key: "deliveryCost", label: "Coût de livraison", unit: "€" },
    { key: "returnCost", label: "Coût de retour", unit: "€" },
    { key: "fulfillmentCost", label: "Coût de fulfillment", unit: "€" },
    { key: "productCost", label: "Coût du produit", unit: "€" },
    { key: "leadCost", label: "Coût par lead", unit: "€" },
    { key: "confirmationRate", label: "Taux de confirmation", unit: "%" },
    { key: "totalSellingPrice", label: "Prix de vente total", unit: "€" },
    { key: "totalLeads", label: "Total leads reçus", unit: "" },
    { key: "deliveryRate", label: "Taux de livraison", unit: "%" },
  ];

  return (
    <div className="space-y-6 max-w-3xl">
      <SectionTitle>Calculateur de rentabilité</SectionTitle>
      <div className="bg-card border border-border p-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {fields.map(f => (
            <div key={f.key}>
              <Label className="text-xs uppercase tracking-widest text-muted-foreground">{f.label}</Label>
              <div className="flex items-center mt-1 border border-border/50">
                <input
                  type="number" value={calc[f.key as keyof CalcState]}
                  onChange={e => setCalc({ ...calc, [f.key]: parseFloat(e.target.value) || 0 } as CalcState)}
                  className="flex-1 bg-transparent px-3 py-2 text-sm text-foreground focus:outline-none w-0"
                />
                {f.unit && <span className="px-3 text-xs text-muted-foreground border-l border-border/50 py-2">{f.unit}</span>}
              </div>
            </div>
          ))}
        </div>
        <Button onClick={onCalculate} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-none uppercase tracking-widest text-sm h-11">
          Calculer
        </Button>
      </div>

      {result && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <ResultCard label="Leads confirmés" value={`${result.confirmedLeads}`} unit="leads" />
            <ResultCard label="Leads livrés" value={`${result.deliveredLeads}`} unit="leads" />
            <ResultCard label="Profit par unité" value={`${result.profitPerUnit}`} unit="€/unité" color={result.profitPerUnit >= 0 ? "text-green-400" : "text-red-400"} />
            <ResultCard label="Profit total" value={`${result.totalProfit}`} unit="€" color={result.totalProfit >= 0 ? "text-green-400" : "text-red-400"} />
            <ResultCard label="Coût/lead livré" value={`${result.leadCostPerDelivered}`} unit="€" />
            <ResultCard label="Lead cost seuil" value={`${result.breakEven}`} unit="€" />
          </div>
        </div>
      )}
    </div>
  );
}

function ResultCard({ label, value, unit, color = "text-primary" }: { label: string; value: string; unit: string; color?: string }) {
  return (
    <div className="bg-card border border-primary/20 p-4 text-center">
      <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">{label}</p>
      <p className={`text-2xl font-serif ${color}`}>{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{unit}</p>
    </div>
  );
}

/* ── BUDGET ── */
function BudgetSection() {
  const { data: stats } = useGetAdminStats();
  const revenue = stats?.chiffreAffaires || 0;
  return (
    <div className="space-y-6 max-w-4xl">
      <SectionTitle>Budget Manager</SectionTitle>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-card border border-border p-5">
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">Solde actuel</p>
          <p className="text-2xl font-serif text-primary">{revenue.toFixed(2)} €</p>
        </div>
        <div className="bg-card border border-border p-5">
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">Dépenses</p>
          <p className="text-2xl font-serif text-red-400">0.00 €</p>
        </div>
        <div className="bg-card border border-border p-5">
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">Revenus</p>
          <p className="text-2xl font-serif text-green-400">{revenue.toFixed(2)} €</p>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {["Dépenses", "Revenus"].map(title => (
          <div key={title} className="bg-card border border-border">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <p className="text-sm font-medium">{title}</p>
              <button className="text-xs text-primary hover:underline">+ Ajouter</button>
            </div>
            <div className="flex flex-col">
              <div className="grid grid-cols-2 px-5 py-3 border-b border-border/40">
                <span className="text-xs text-muted-foreground uppercase tracking-widest">Référence</span>
                <span className="text-xs text-muted-foreground uppercase tracking-widest">Montant</span>
              </div>
              <div className="px-5 py-3">
                <input placeholder="Nom de catégorie" className="w-full bg-transparent text-sm text-muted-foreground placeholder:text-border focus:outline-none" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── ÉQUIPE ── */
function EquipeSection() {
  const { user } = useAuth();
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <SectionTitle>Équipe</SectionTitle>
        <button className="flex items-center gap-1.5 bg-primary/10 border border-primary/30 text-primary text-xs px-4 py-2 hover:bg-primary/20 transition-colors uppercase tracking-widest">
          <Plus className="w-3.5 h-3.5" /> Ajouter un utilisateur
        </button>
      </div>
      <div className="bg-card border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/40">
              {["Avatar", "Nom", "Email", "Statut", "Rôle", "Actions"].map(h => (
                <th key={h} className="px-5 py-3 text-left text-xs text-muted-foreground uppercase tracking-widest font-normal">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {user && (
              <tr className="border-b border-border/20 hover:bg-white/3 transition-colors">
                <td className="px-5 py-4">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-bold">
                    {user.nom[0].toUpperCase()}
                  </div>
                </td>
                <td className="px-5 py-4 font-medium">{user.nom}</td>
                <td className="px-5 py-4 text-muted-foreground">{user.email}</td>
                <td className="px-5 py-4">
                  <span className="text-[10px] border border-green-500/30 bg-green-500/10 text-green-400 px-2 py-0.5 uppercase tracking-widest">Actif</span>
                </td>
                <td className="px-5 py-4">
                  <span className="text-[10px] border border-primary/30 bg-primary/10 text-primary px-2 py-0.5 uppercase tracking-widest">{user.role}</span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <button className="text-muted-foreground hover:text-foreground"><Pencil className="w-3.5 h-3.5" /></button>
                    <button className="text-muted-foreground hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── BOUTIQUE THÈME ── */
const THEMES = ["Dakar", "Tokyo", "Nairobi", "Berlin", "Milan"];
function BoutiqueTheme() {
  const [selectedTheme, setSelectedTheme] = useState("Nairobi");
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <SectionTitle>Thème de la boutique</SectionTitle>
        <button className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs px-5 py-2 uppercase tracking-widest transition-colors">Sauvegarder</button>
      </div>
      <div className="bg-card border border-border p-5">
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-4">Thème sélectionné</p>
        <div className="grid grid-cols-5 gap-3">
          {THEMES.map(t => (
            <button key={t} onClick={() => setSelectedTheme(t)}
              className={`border-2 p-3 transition-colors ${selectedTheme === t ? "border-primary bg-primary/10" : "border-border hover:border-primary/40"}`}>
              <div className="w-full aspect-video bg-gradient-to-br from-border to-muted mb-2 flex items-center justify-center">
                <span className="text-[10px] text-muted-foreground">{t[0]}</span>
              </div>
              <p className="text-xs text-center text-foreground">{t}</p>
            </button>
          ))}
        </div>
      </div>
      <div className="bg-card border border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium">Bannières</p>
          <button className="text-xs text-primary border border-primary/30 px-3 py-1.5 hover:bg-primary/10 transition-colors">+ Ajouter une bannière</button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {["Desktop (1920×600)", "Mobile (1024×768)"].map(s => (
            <div key={s} className="border border-dashed border-border aspect-video flex flex-col items-center justify-center text-muted-foreground hover:border-primary/40 transition-colors cursor-pointer">
              <Plus className="w-8 h-8 mb-2 opacity-30" />
              <p className="text-xs">{s}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-card border border-border p-5 grid grid-cols-2 gap-4">
        {[["Titre de la page d'accueil", "Nos parfums"], ["Titre des catégories", ""], ["Instructions de paiement", ""], ["Titre du checkout", ""]].map(([label, placeholder]) => (
          <div key={label}>
            <Label className="text-xs uppercase tracking-widest text-muted-foreground">{label}</Label>
            <Input defaultValue={placeholder} className="rounded-none border-border/50 mt-1 h-9 text-sm" />
          </div>
        ))}
        <div className="flex items-center gap-3 col-span-2">
          <Label className="text-xs uppercase tracking-widest text-muted-foreground">Icônes en pied de page</Label>
          <div className="w-10 h-5 bg-primary/30 rounded-full relative cursor-pointer">
            <div className="w-4 h-4 bg-primary rounded-full absolute top-0.5 right-0.5" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── BOUTIQUE PARAMÈTRES ── */
function BoutiqueParams() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <SectionTitle>Paramètres de la boutique</SectionTitle>
        <button className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs px-5 py-2 uppercase tracking-widest transition-colors">Sauvegarder</button>
      </div>
      <div className="bg-card border border-border p-6">
        <p className="text-sm font-medium text-foreground mb-5 pb-3 border-b border-border">Détails de la boutique</p>
        <div className="grid grid-cols-2 gap-4">
          {[["Nom de la boutique", "VELMORA"], ["Titre de la boutique", "VELMORA"], ["Domaine", "velmora.replit.app"], ["Téléphone", ""], ["Email de la boutique", "admin@velmora.fr"], ["Facebook", ""], ["Instagram", ""], ["TikTok", ""], ["WhatsApp", ""]].map(([label, value]) => (
            <div key={label}>
              <Label className="text-xs uppercase tracking-widest text-muted-foreground">{label}</Label>
              <Input defaultValue={value} className="rounded-none border-border/50 mt-1 h-9 text-sm" />
            </div>
          ))}
        </div>
      </div>
      <div className="bg-card border border-border p-6">
        <p className="text-sm font-medium text-foreground mb-5 pb-3 border-b border-border">Paramètres du panier</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-xs uppercase tracking-widest text-muted-foreground">Quantité max par article</Label>
            <div className="flex items-center mt-1 border border-border/50">
              <input type="number" className="flex-1 bg-transparent px-3 py-2 text-sm focus:outline-none" />
              <span className="px-3 text-xs text-muted-foreground border-l border-border/50 py-2">unités</span>
            </div>
          </div>
          <div>
            <Label className="text-xs uppercase tracking-widest text-muted-foreground">Montant max de commande</Label>
            <div className="flex items-center mt-1 border border-border/50">
              <input type="number" className="flex-1 bg-transparent px-3 py-2 text-sm focus:outline-none" />
              <span className="px-3 text-xs text-muted-foreground border-l border-border/50 py-2">€</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── BOUTIQUE FACTURATION ── */
function BoutiqueFacturation() {
  const { data: stats } = useGetAdminStats();
  return (
    <div className="space-y-6 max-w-4xl">
      <SectionTitle>Facturation</SectionTitle>
      <div className="flex gap-3 border-b border-border pb-0 text-sm">
        {["Facturation", "Factures", "Abonnement"].map((t, i) => (
          <button key={t} className={`pb-3 px-1 transition-colors border-b-2 ${i === 0 ? "text-primary border-primary" : "text-muted-foreground border-transparent hover:text-foreground"}`}>
            {t}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 bg-card border border-border p-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Détails de la société</p>
            <button className="text-muted-foreground hover:text-foreground"><Pencil className="w-4 h-4" /></button>
          </div>
          {[["Nom de la société", "N/A"], ["N° TVA", "N/A"], ["Adresse", "N/A"]].map(([k, v]) => (
            <div key={k} className="flex justify-between text-sm border-b border-border/30 pb-2">
              <span className="text-muted-foreground">{k}</span>
              <span className="text-foreground">{v}</span>
            </div>
          ))}
        </div>
        <div className="bg-primary/10 border border-primary/20 p-5 flex flex-col gap-3">
          <p className="text-xs text-muted-foreground uppercase tracking-widest">Mon solde</p>
          <p className="text-3xl font-serif text-primary">{(stats?.chiffreAffaires || 0).toFixed(2)} €</p>
          <button className="mt-auto text-xs border border-primary/40 text-primary px-4 py-2 hover:bg-primary/10 transition-colors flex items-center gap-1.5 justify-center">
            <Plus className="w-3.5 h-3.5" /> Ajouter un solde
          </button>
        </div>
      </div>
      <div className="bg-card border border-border">
        <div className="px-5 py-4 border-b border-border grid grid-cols-5 gap-4 text-xs text-muted-foreground uppercase tracking-widest">
          {["Date", "Prix", "Solde ajouté", "Statut", "Description"].map(h => <span key={h}>{h}</span>)}
        </div>
        <div className="px-5 py-8 text-center text-muted-foreground text-sm">Aucune transaction</div>
      </div>
    </div>
  );
}
