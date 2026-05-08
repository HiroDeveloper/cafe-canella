"use client";

import { useEffect, useState } from "react";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { Trash2, Search, Filter, CheckCircle, Clock, Trash, ExternalLink, RefreshCcw, MessageSquare } from "lucide-react";
import ConfirmModal from "@/components/admin/ConfirmModal";

export default function PRDashboardPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [confirmState, setConfirmState] = useState<{open: boolean; id: string | null}>({ open: false, id: null });

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    setLoading(true);
    const { data, error } = await supabaseAdmin
      .from("pqrs")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (data) setItems(data);
    setLoading(false);
  }

  const filteredItems = items.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.contact.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = async () => {
    if (!confirmState.id) return;
    await supabaseAdmin.from("pqrs").delete().eq("id", confirmState.id);
    setConfirmState({ open: false, id: null });
    fetchData();
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "resolved" ? "pending" : "resolved";
    await supabaseAdmin.from("pqrs").update({ status: newStatus }).eq("id", id);
    fetchData();
  };

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat("es-CO", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(date));
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-latte/30 pb-6">
        <div>
          <h2 className="font-serif text-3xl font-bold text-espresso italic">Buzón de Entrada</h2>
          <p className="text-muted-foreground font-serif italic text-sm mt-1">Gestión de mensajes y PQRS recibidos.</p>
        </div>
        <button 
          onClick={fetchData}
          className="flex items-center gap-2 text-xs label-stamp bg-white border border-latte px-4 py-2 rounded-full hover:bg-latte/10 transition-all active:scale-95"
        >
          <RefreshCcw size={14} className={loading ? "animate-spin" : ""} />
          Actualizar
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total", value: items.length, color: "bg-espresso text-cream" },
          { label: "Pendientes", value: items.filter(i => i.status === 'pending').length, color: "bg-amber-100 text-amber-800" },
          { label: "Resueltos", value: items.filter(i => i.status === 'resolved').length, color: "bg-emerald-100 text-emerald-800" },
          { label: "Hoy", value: items.filter(i => new Date(i.created_at).toDateString() === new Date().toDateString()).length, color: "bg-blue-100 text-blue-800" },
        ].map((stat, i) => (
          <div key={i} className={`p-4 rounded-2xl border border-latte/20 shadow-sm ${stat.color}`}>
            <div className="label-stamp text-[0.6rem] opacity-70 mb-1">{stat.label}</div>
            <div className="text-2xl font-bold font-serif">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-2xl border border-latte/20 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-latte" size={18} />
          <input
            type="text"
            placeholder="Buscar por cliente, contacto o contenido..."
            className="w-full pl-12 pr-4 py-3 bg-parchment/30 border border-transparent rounded-xl outline-none focus:bg-white focus:border-espresso transition-all font-sans text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative min-w-[200px]">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-latte" size={18} />
          <select
            className="w-full pl-12 pr-4 py-3 bg-parchment/30 border border-transparent rounded-xl outline-none focus:bg-white focus:border-espresso transition-all font-sans text-sm appearance-none cursor-pointer"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Todos los estados</option>
            <option value="pending">Solo Pendientes</option>
            <option value="resolved">Solo Resueltos</option>
          </select>
        </div>
      </div>

      {/* List */}
      <div className="space-y-4">
        {filteredItems.map((item) => (
          <div key={item.id} className="bg-white rounded-3xl border border-latte/20 shadow-sm overflow-hidden hover:shadow-warm transition-all group">
            <div className="flex flex-col md:flex-row">
              <div className={`w-full md:w-1 ${item.status === 'resolved' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              <div className="flex-1 p-6 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] label-stamp px-2.5 py-1 rounded-full ${
                      item.type === 'Queja' || item.type === 'Reclamo' ? 'bg-rose-50 text-rose-600 border border-rose-100' : 
                      item.type === 'Felicitación' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-blue-50 text-blue-600 border border-blue-100'
                    }`}>
                      {item.type}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-sans flex items-center gap-1 uppercase tracking-wider">
                      <Clock size={12} /> {formatDate(item.created_at)}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleStatus(item.id, item.status)}
                      className={`p-2 rounded-full transition-all ${
                        item.status === 'resolved' 
                          ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' 
                          : 'bg-parchment text-latte hover:bg-latte/10 hover:text-espresso'
                      }`}
                      title={item.status === 'resolved' ? 'Marcar como pendiente' : 'Marcar como resuelto'}
                    >
                      <CheckCircle size={18} />
                    </button>
                    <button
                      onClick={() => setConfirmState({ open: true, id: item.id })}
                      className="p-2 rounded-full bg-parchment text-latte hover:bg-rose-50 hover:text-rose-600 transition-all"
                      title="Eliminar mensaje"
                    >
                      <Trash size={18} />
                    </button>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-espresso/5 border border-espresso/10 flex items-center justify-center text-espresso font-serif text-xl font-bold">
                    {item.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-espresso text-xl">{item.name}</h3>
                    <div className="flex items-center gap-2 text-xs text-roast font-sans mt-0.5">
                      <ExternalLink size={12} className="opacity-50" />
                      <span className="font-medium">{item.contact}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-parchment/20 p-5 rounded-2xl border border-latte/10 relative">
                  <p className="text-sm text-espresso/90 leading-relaxed whitespace-pre-wrap italic font-serif">
                    "{item.message}"
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {loading && (
        <div className="py-20 text-center space-y-4">
          <div className="h-10 w-10 border-4 border-espresso/10 border-t-espresso rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground font-serif italic">Consultando buzón...</p>
        </div>
      )}
      {!loading && filteredItems.length === 0 && (
        <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-latte/50">
          <div className="h-16 w-16 bg-parchment text-latte rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare size={32} />
          </div>
          <h3 className="text-espresso font-serif text-lg font-bold">Sin mensajes</h3>
          <p className="text-muted-foreground text-sm font-serif italic">No se encontraron registros que coincidan con los filtros.</p>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmState.open}
        title="Eliminar registro"
        message="¿Estás seguro de que deseas eliminar este mensaje? Esta acción no se puede revertir."
        confirmLabel="Eliminar mensaje"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setConfirmState({ open: false, id: null })}
      />
    </div>
  );
}
