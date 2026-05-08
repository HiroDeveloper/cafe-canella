"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, usePathname } from "next/navigation";
import { LogOut, MessageSquare, Clock } from "lucide-react";

const TIMEOUT_MS = 5 * 60 * 1000; // 5 minutos

export default function PRLayout({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
    router.push("/pr/login");
  }, [router]);

  const resetTimeout = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (pathname !== "/pr/login") {
      timeoutRef.current = setTimeout(handleLogout, TIMEOUT_MS);
    }
  }, [handleLogout, pathname]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session && pathname !== "/pr/login") {
        router.push("/pr/login");
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session && pathname !== "/pr/login") {
        router.push("/pr/login");
      }
    });

    // Activity listeners
    const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart"];
    const handleActivity = () => {
      localStorage.setItem("pr-last-activity", Date.now().toString());
      resetTimeout();
    };

    const checkInactivity = () => {
      const lastActivity = parseInt(localStorage.getItem("pr-last-activity") || "0");
      if (Date.now() - lastActivity > TIMEOUT_MS) {
        handleLogout();
      }
    };

    if (pathname !== "/pr/login") {
      events.forEach(event => window.addEventListener(event, handleActivity));
      window.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") {
          checkInactivity();
        }
      });
      localStorage.setItem("pr-last-activity", Date.now().toString());
      resetTimeout();
    }

    return () => {
      subscription.unsubscribe();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      events.forEach(event => window.removeEventListener(event, handleActivity));
      window.removeEventListener("visibilitychange", checkInactivity);
    };
  }, [router, pathname, resetTimeout]);

  if (loading) return null;
  if (!session && pathname !== "/pr/login") return null;

  if (pathname === "/pr/login") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#faf9f6] flex flex-col font-sans">
      <header className="bg-espresso text-cream h-16 flex items-center justify-between px-6 shadow-lg z-50">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-cream text-espresso grid place-items-center font-bold">PR</div>
          <h1 className="font-serif font-bold text-lg hidden sm:block">Panel de PQRS</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 text-xs text-latte bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
            <Clock size={12} />
            <span>Sesión activa: {session?.user?.email}</span>
          </div>
          <button 
            onClick={handleLogout}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-latte hover:text-cream"
            title="Cerrar Sesión"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 sm:p-8">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>

      <footer className="py-4 text-center text-[10px] text-muted-foreground bg-white border-t border-latte/20 uppercase tracking-[0.2em]">
        Sistema de Respuesta Prioritaria · Canella
      </footer>
    </div>
  );
}
