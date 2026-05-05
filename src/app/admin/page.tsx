"use client";

import { useEffect, useState } from "react";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { 
  Coffee, 
  ListTree, 
  TrendingUp, 
  Clock,
  ArrowRight
} from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ categories: 0, items: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      const { count: catCount } = await supabaseAdmin.from("categories").select("*", { count: "exact", head: true });
      const { count: itemCount } = await supabaseAdmin.from("menu_items").select("*", { count: "exact", head: true });
      
      setStats({
        categories: catCount || 0,
        items: itemCount || 0,
      });
      setLoading(false);
    }
    loadStats();
  }, []);

  const cards = [
    { title: "Categorías", value: stats.categories, icon: <ListTree />, color: "bg-espresso", href: "/admin/categories" },
    { title: "Productos", value: stats.items, icon: <Coffee />, color: "bg-roast", href: "/admin/items" },
    { title: "Vistas Hoy", value: "124", icon: <TrendingUp />, color: "bg-botanical", href: "#" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-bold text-espresso">¡Hola, Administrador!</h1>
        <p className="text-muted-foreground font-serif italic mt-1">Aquí tienes un resumen de tu menú hoy.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card) => (
          <div key={card.title} className="menu-card p-6 flex items-center justify-between group hover:shadow-warm-lg transition-all">
            <div>
              <p className="label-stamp text-roast mb-1">{card.title}</p>
              <h3 className="text-4xl font-serif font-bold text-espresso">{loading ? "..." : card.value}</h3>
            </div>
            <div className={`${card.color} text-cream h-12 w-12 rounded-full grid place-items-center shadow-warm`}>
              {card.icon}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <div className="menu-card p-8">
          <h2 className="font-serif text-xl font-bold text-espresso mb-6 flex items-center gap-2">
            <Clock size={20} className="text-roast" />
            Acciones Rápidas
          </h2>
          <div className="space-y-4">
            <Link href="/admin/items" className="flex items-center justify-between p-4 bg-parchment rounded-lg border border-latte hover:border-espresso transition-all group">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 bg-cream border border-latte rounded-full grid place-items-center text-espresso group-hover:bg-espresso group-hover:text-cream transition-colors">
                  <Coffee size={18} />
                </div>
                <div>
                  <h4 className="font-sans font-semibold text-espresso">Agregar nuevo producto</h4>
                  <p className="text-xs text-muted-foreground italic font-serif">Sube fotos y ajusta precios</p>
                </div>
              </div>
              <ArrowRight size={18} className="text-latte group-hover:text-espresso group-hover:translate-x-1 transition-all" />
            </Link>

            <Link href="/admin/categories" className="flex items-center justify-between p-4 bg-parchment rounded-lg border border-latte hover:border-espresso transition-all group">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 bg-cream border border-latte rounded-full grid place-items-center text-espresso group-hover:bg-espresso group-hover:text-cream transition-colors">
                  <ListTree size={18} />
                </div>
                <div>
                  <h4 className="font-sans font-semibold text-espresso">Organizar categorías</h4>
                  <p className="text-xs text-muted-foreground italic font-serif">Cambia el orden de aparición</p>
                </div>
              </div>
              <ArrowRight size={18} className="text-latte group-hover:text-espresso group-hover:translate-x-1 transition-all" />
            </Link>
          </div>
        </div>

        {/* Tip of the day */}
        <div className="menu-card p-8 bg-espresso text-cream">
          <div className="menu-card-inner-border pointer-events-none opacity-20"></div>
          <div className="relative z-10">
            <h2 className="font-serif text-xl font-bold mb-4 italic">Tip de diseño</h2>
            <p className="font-serif text-cream/80 leading-relaxed mb-6">
              "Una buena fotografía vende más que mil palabras. Asegúrate de que las fotos de tus cafés tengan buena iluminación natural para resaltar la textura de la leche."
            </p>
            <div className="ornament justify-start text-latte">
              <div className="h-[1px] w-12 bg-latte/30"></div>
              <span className="text-xs">❦</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
