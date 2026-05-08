"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Lock, Mail, Loader2, AlertCircle } from "lucide-react";

export default function PRLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Credenciales inválidas para el panel PR.");
      setLoading(false);
    } else {
      router.push("/pr/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center h-20 w-20 rounded-3xl bg-espresso text-cream shadow-xl mb-6">
            <Lock size={32} />
          </div>
          <h1 className="font-serif text-3xl font-bold text-espresso italic">Acceso Prioritario</h1>
          <p className="text-muted-foreground mt-2 font-serif italic">Gestión de PQRS y Mensajería</p>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-warm-lg border border-latte/20">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="label-stamp text-[0.65rem] text-roast ml-1">Email de Acceso</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-latte" size={18} />
                <input
                  type="email"
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-parchment/30 border border-latte rounded-2xl outline-none focus:ring-2 focus:ring-espresso/10 focus:border-espresso transition-all text-espresso"
                  placeholder="ejemplo@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="label-stamp text-[0.65rem] text-roast ml-1">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-latte" size={18} />
                <input
                  type="password"
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-parchment/30 border border-latte rounded-2xl outline-none focus:ring-2 focus:ring-espresso/10 focus:border-espresso transition-all text-espresso"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-rose-600 bg-rose-50 p-4 rounded-2xl text-sm border border-rose-100">
                <AlertCircle size={18} className="shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <button
              disabled={loading}
              type="submit"
              className="w-full bg-espresso text-cream py-4 rounded-2xl font-serif font-bold text-lg shadow-warm hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 size={24} className="animate-spin" />
              ) : (
                "Entrar al Panel"
              )}
            </button>
          </form>
        </div>
        
        <p className="text-center mt-8 text-[10px] text-muted-foreground uppercase tracking-widest">
          Seguridad Canella · Sesión expira cada 5 minutos
        </p>
      </div>
    </div>
  );
}
