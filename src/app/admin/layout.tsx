"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { 
  LayoutDashboard, 
  ListTree, 
  Coffee, 
  Settings, 
  LogOut, 
  ChevronRight,
  Menu,
  X,
  MessageSquare
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session && pathname !== "/admin/login") {
        router.push("/admin/login");
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session && pathname !== "/admin/login") {
        router.push("/admin/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [router, pathname]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  if (loading) return null;
  if (!session && pathname !== "/admin/login") return null;
  if (pathname === "/admin/login") return <>{children}</>;

  const menuItems = [
    { name: "Dashboard", icon: <LayoutDashboard size={20} />, href: "/admin" },
    { name: "Categorías", icon: <ListTree size={20} />, href: "/admin/categories" },
    { name: "Productos", icon: <Coffee size={20} />, href: "/admin/items" },
    { name: "Ajustes", icon: <Settings size={20} />, href: "/admin/settings" },
  ];

  return (
    <div className="min-h-screen bg-parchment flex">
      {/* Sidebar Desktop */}
      <aside className={`bg-espresso text-cream transition-all duration-300 flex flex-col ${isSidebarOpen ? "w-64" : "w-20"}`}>
        <div className="p-6 flex items-center justify-between border-b border-white/10">
          <div className={`flex items-center gap-3 ${!isSidebarOpen && "hidden"}`}>
            <div className="h-8 w-8 rounded-full bg-cream text-espresso grid place-items-center font-bold font-serif">C</div>
            <span className="font-serif font-bold text-lg tracking-tight">Canella <span className="text-latte italic font-normal">Admin</span></span>
          </div>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1 hover:bg-white/10 rounded">
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-4 px-4 py-3 rounded-md transition-all group ${
                pathname === item.href 
                  ? "bg-cream text-espresso shadow-warm" 
                  : "text-cream/70 hover:bg-white/5 hover:text-cream"
              }`}
            >
              <span className={pathname === item.href ? "text-espresso" : "text-latte group-hover:text-cream"}>
                {item.icon}
              </span>
              <span className={`font-sans font-medium whitespace-nowrap ${!isSidebarOpen && "hidden"}`}>
                {item.name}
              </span>
              {pathname === item.href && isSidebarOpen && <ChevronRight size={16} className="ml-auto opacity-50" />}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-4 py-3 text-cream/60 hover:text-red-400 hover:bg-white/5 rounded-md transition-all group"
          >
            <LogOut size={20} />
            <span className={`font-sans font-medium ${!isSidebarOpen && "hidden"}`}>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <header className="bg-cream border-b border-latte h-16 flex items-center justify-between px-8">
          <h2 className="label-stamp text-roast tracking-widest">
            {menuItems.find(i => i.href === pathname)?.name || "Panel"}
          </h2>
          <div className="flex items-center gap-4">
            <span className="text-xs font-sans text-muted-foreground italic border-r border-latte pr-4 hidden sm:inline-block">
              {session.user.email}
            </span>
            <div className="h-8 w-8 rounded-full bg-parchment border border-latte grid place-items-center text-espresso font-bold text-xs">
              AD
            </div>
            <button 
              onClick={handleLogout}
              className="ml-2 p-2 text-roast hover:bg-roast/10 rounded-full transition-colors"
              title="Cerrar Sesión"
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>
        
        <div className="flex-1 overflow-y-auto p-8 bg-[var(--line-pattern)] bg-fixed">
          {children}
        </div>
      </main>
    </div>
  );
}
