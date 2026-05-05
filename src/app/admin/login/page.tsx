"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Coffee, Lock, User } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Credenciales incorrectas. Intenta de nuevo.");
      setLoading(false);
    } else {
      router.push("/admin");
    }
  };

  return (
    <div className="min-h-screen bg-parchment flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-espresso text-cream mb-4 shadow-warm">
            <Coffee size={32} />
          </div>
          <h1 className="font-serif text-3xl font-bold text-espresso">Panel Admin</h1>
          <p className="text-muted-foreground font-serif italic mt-1">Café Canella</p>
        </div>

        <div className="menu-card p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-md text-center italic font-serif">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <label className="label-stamp text-roast block">Correo Electrónico</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-latte">
                  <User size={18} />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-cream border border-latte rounded-md focus:ring-2 focus:ring-espresso focus:border-transparent outline-none transition-all font-sans"
                  placeholder="admin@cafecanella.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="label-stamp text-roast block">Contraseña</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-latte">
                  <Lock size={18} />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-cream border border-latte rounded-md focus:ring-2 focus:ring-espresso focus:border-transparent outline-none transition-all font-sans"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-espresso text-cream font-serif py-3 rounded-md hover:bg-roast transition-colors shadow-warm-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Iniciando sesión..." : "Entrar al Panel"}
            </button>
          </form>
        </div>

        <p className="text-center mt-8 text-latte text-xs label-stamp">
          Café Canella &copy; 2026 · Aguazul, Casanare
        </p>
      </div>
    </div>
  );
}
