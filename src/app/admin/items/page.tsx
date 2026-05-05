"use client";

import { useEffect, useState } from "react";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { Plus, Trash2, Edit3, Search, Filter, Image as ImageIcon, Check } from "lucide-react";
import ItemModal from "@/components/admin/ItemModal";
import ConfirmModal from "@/components/admin/ConfirmModal";

export default function ItemsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [confirmState, setConfirmState] = useState<{open: boolean; id: string | null}>({ open: false, id: null });

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    setLoading(true);
    const { data: cats } = await supabaseAdmin.from("categories").select("*").order("sort_order");
    const { data: menuItems } = await supabaseAdmin
      .from("menu_items")
      .select("*, categories(name), prices(*)")
      .order("created_at", { ascending: false });
    if (cats) setCategories(cats);
    if (menuItems) setItems(menuItems);
    setLoading(false);
  }

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === "all" || item.category_id === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleDelete = async () => {
    if (!confirmState.id) return;
    await supabaseAdmin.from("menu_items").delete().eq("id", confirmState.id);
    fetchData();
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(price);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-espresso">Gestión de Productos</h1>
          <p className="text-muted-foreground font-serif italic text-sm">Administra los platos y bebidas del menú.</p>
        </div>
        <button
          onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
          className="flex items-center gap-2 bg-espresso text-cream px-4 py-2 rounded-md hover:bg-roast transition-colors label-stamp"
        >
          <Plus size={16} /> Nuevo Producto
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-latte" size={18} />
          <input
            type="text"
            placeholder="Buscar por nombre..."
            className="w-full pl-10 pr-4 py-2 bg-cream border border-latte rounded-md outline-none focus:border-espresso font-sans text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative min-w-[220px]">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-latte" size={18} />
          <select
            className="w-full pl-10 pr-4 py-2 bg-cream border border-latte rounded-md outline-none focus:border-espresso font-sans text-sm appearance-none"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">Todas las categorías</option>
            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
          </select>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <div key={item.id} className="menu-card flex flex-col group hover:shadow-warm-lg transition-all">
            <div className="aspect-video bg-parchment rounded-t-lg border-b border-latte relative overflow-hidden flex items-center justify-center">
              {item.image_url ? (
                <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center text-latte/50">
                  <ImageIcon size={32} />
                  <span className="text-[10px] label-stamp mt-2">Sin imagen</span>
                </div>
              )}
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => { setEditingItem(item); setIsModalOpen(true); }}
                  className="p-1.5 bg-cream/90 text-espresso rounded-full shadow-sm hover:bg-cream"
                >
                  <Edit3 size={14} />
                </button>
                <button
                  onClick={() => setConfirmState({ open: true, id: item.id })}
                  className="p-1.5 bg-roast/90 text-cream rounded-full shadow-sm hover:bg-roast"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="absolute top-2 left-2">
                <span className="bg-espresso/80 backdrop-blur-sm text-cream text-[10px] label-stamp px-2 py-1 rounded">
                  {item.categories?.name}
                </span>
              </div>
            </div>
            <div className="p-5 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-serif font-bold text-espresso leading-tight">{item.name}</h3>
                <span className="text-sm font-sans font-semibold text-roast tabular-nums ml-2 shrink-0">
                  {item.prices?.[0] ? formatPrice(item.prices[0].price) : "—"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground italic font-serif line-clamp-2 flex-1 mb-4">
                {item.description || "Sin descripción."}
              </p>
              <div className="flex gap-2 flex-wrap">
                {item.is_featured && (
                  <span className="bg-botanical/10 text-botanical text-[9px] label-stamp px-1.5 py-0.5 rounded flex items-center gap-1">
                    <Check size={10} /> Destacado
                  </span>
                )}
                {item.is_new && (
                  <span className="bg-roast/10 text-roast text-[9px] label-stamp px-1.5 py-0.5 rounded">Novedad</span>
                )}
                {item.prices?.length > 1 && (
                  <span className="bg-espresso/10 text-espresso text-[9px] label-stamp px-1.5 py-0.5 rounded">
                    {item.prices.length} variantes
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {loading && <div className="p-12 text-center text-muted-foreground font-serif italic">Cargando productos...</div>}
      {!loading && filteredItems.length === 0 && (
        <div className="p-12 text-center text-muted-foreground font-serif italic">No se encontraron productos.</div>
      )}

      <ItemModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={fetchData}
        item={editingItem}
        categories={categories}
      />

      <ConfirmModal
        isOpen={confirmState.open}
        title="Eliminar producto"
        message="Esta acción es irreversible. Se eliminará el producto y todos sus precios asociados."
        confirmLabel="Sí, eliminar"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setConfirmState({ open: false, id: null })}
      />
    </div>
  );
}
