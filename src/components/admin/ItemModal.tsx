"use client";

import { useState, useEffect } from "react";
import { X, Plus, Trash2, Save } from "lucide-react";
import { supabaseAdmin } from "@/lib/supabase-admin";
import ImageUploader from "./ImageUploader";

interface ItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  item?: any;
  categories: any[];
}

export default function ItemModal({ isOpen, onClose, onSave, item, categories }: ItemModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category_id: "",
    is_featured: false,
    is_new: false,
    image_url: "",
  });
  const [prices, setPrices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name,
        description: item.description || "",
        category_id: item.category_id,
        is_featured: item.is_featured || false,
        is_new: item.is_new || false,
        image_url: item.image_url || "",
      });
      setPrices(item.prices?.length > 0 ? item.prices : [{ label: "Precio", price: 0 }]);
    } else {
      setFormData({
        name: "",
        description: "",
        category_id: categories[0]?.id || "",
        is_featured: false,
        is_new: false,
        image_url: "",
      });
      setPrices([{ label: "Precio", price: 0 }]);
    }
    setError(null);
  }, [item, categories, isOpen]);

  if (!isOpen) return null;

  const handleAddPrice = () => {
    setPrices([...prices, { label: "", price: 0 }]);
  };

  const handleRemovePrice = (index: number) => {
    if (prices.length === 1) return; // Al menos un precio
    setPrices(prices.filter((_, i) => i !== index));
  };

  const handlePriceChange = (index: number, field: string, value: any) => {
    const newPrices = [...prices];
    newPrices[index][field] = value;
    setPrices(newPrices);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) { setError("El nombre es obligatorio."); return; }
    if (!formData.category_id) { setError("Selecciona una categoría."); return; }
    setLoading(true);
    setError(null);

    try {
      let itemId = item?.id;

      if (itemId) {
        await supabaseAdmin.from("menu_items").update(formData).eq("id", itemId);
        await supabaseAdmin.from("prices").delete().eq("item_id", itemId);
      } else {
        const { data, error: insertErr } = await supabaseAdmin
          .from("menu_items")
          .insert([formData])
          .select()
          .single();
        if (insertErr) throw insertErr;
        itemId = data.id;
      }

      const pricesToInsert = prices.map(p => ({
        item_id: itemId,
        label: p.label || "Precio",
        price: parseFloat(p.price) || 0,
      }));
      await supabaseAdmin.from("prices").insert(pricesToInsert);

      onSave();
      onClose();
    } catch (err: any) {
      setError(err.message || "Error al guardar. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-espresso/40 backdrop-blur-sm">
      <div className="menu-card w-full max-w-3xl max-h-[92vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-latte flex items-center justify-between bg-cream shrink-0">
          <div>
            <h2 className="font-serif text-xl font-bold text-espresso">
              {item ? "Editar Producto" : "Nuevo Producto"}
            </h2>
            <p className="text-[10px] label-stamp text-roast mt-0.5">
              {item ? `Modificando: ${item.name}` : "Completa los datos del plato o bebida"}
            </p>
          </div>
          <button onClick={onClose} className="text-latte hover:text-espresso transition-colors p-1">
            <X size={22} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-md font-serif italic text-center">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Columna izquierda — Datos */}
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="label-stamp text-roast text-[10px]">Nombre del Plato *</label>
                <input
                  required
                  className="w-full bg-parchment border border-latte px-4 py-2.5 rounded-md outline-none focus:border-espresso font-sans text-sm"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Latte Macchiato"
                />
              </div>

              <div className="space-y-1">
                <label className="label-stamp text-roast text-[10px]">Categoría *</label>
                <select
                  className="w-full bg-parchment border border-latte px-4 py-2.5 rounded-md outline-none focus:border-espresso font-sans text-sm"
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="label-stamp text-roast text-[10px]">Descripción</label>
                <textarea
                  rows={4}
                  className="w-full bg-parchment border border-latte px-4 py-2.5 rounded-md outline-none focus:border-espresso font-serif italic text-sm resize-none"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe el sabor, ingredientes o presentación..."
                />
              </div>

              {/* Precios */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="label-stamp text-roast text-[10px]">Precios / Variantes</label>
                  <button
                    type="button"
                    onClick={handleAddPrice}
                    className="text-botanical flex items-center gap-1 text-[10px] label-stamp hover:text-botanical/70 transition-colors"
                  >
                    <Plus size={12} /> Añadir variante
                  </button>
                </div>
                {prices.map((p, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <input
                      placeholder="Etiqueta (ej: Doble)"
                      className="flex-1 bg-parchment border border-latte px-3 py-2 rounded text-xs outline-none focus:border-espresso"
                      value={p.label}
                      onChange={(e) => handlePriceChange(index, "label", e.target.value)}
                    />
                    <input
                      type="number"
                      min="0"
                      placeholder="Precio COP"
                      className="w-28 bg-parchment border border-latte px-3 py-2 rounded text-xs outline-none focus:border-espresso font-mono"
                      value={p.price}
                      onChange={(e) => handlePriceChange(index, "price", e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemovePrice(index)}
                      disabled={prices.length === 1}
                      className="text-roast/50 hover:text-red-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Switches */}
              <div className="flex gap-6 pt-1">
                {[
                  { key: "is_featured", label: "Destacado" },
                  { key: "is_new", label: "Novedad" },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer">
                    <div
                      onClick={() => setFormData({ ...formData, [key]: !formData[key as keyof typeof formData] })}
                      className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                        formData[key as keyof typeof formData] ? "bg-botanical" : "bg-latte"
                      }`}
                    >
                      <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${
                        formData[key as keyof typeof formData] ? "left-6" : "left-1"
                      }`} />
                    </div>
                    <span className="label-stamp text-[10px] text-roast">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Columna derecha — Imagen */}
            <div className="space-y-2">
              <label className="label-stamp text-roast text-[10px]">Imagen del Producto</label>
              <ImageUploader
                value={formData.image_url}
                onChange={(url) => setFormData({ ...formData, image_url: url })}
                aspectRatio="square"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-latte bg-parchment flex justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-md font-serif italic text-muted-foreground hover:text-espresso border border-latte hover:border-espresso transition-all text-sm"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 bg-espresso text-cream px-8 py-2.5 rounded-md hover:bg-roast transition-colors label-stamp shadow-warm disabled:opacity-50"
          >
            <Save size={18} /> {loading ? "Guardando..." : item ? "Actualizar Producto" : "Crear Producto"}
          </button>
        </div>
      </div>
    </div>
  );
}
