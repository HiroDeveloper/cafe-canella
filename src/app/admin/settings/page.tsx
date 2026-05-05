"use client";

import { useEffect, useState } from "react";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { 
  Save, 
  Wifi, 
  Clock, 
  MapPin, 
  MessageCircle,
  RefreshCw,
  Camera,
  Share2,
  Type,
  Image as ImageIcon,
  Quote
} from "lucide-react";

export default function SettingsPage() {
  const [info, setInfo] = useState<any>({
    name: "Café Canella",
    tagline: "",
    address: "",
    schedule: "",
    wifi_name: "",
    wifi_password: "",
    whatsapp_number: "",
    instagram_url: "",
    facebook_url: "",
    footer_text: "",
    quote_text: "",
    hero_image_url: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null);

  useEffect(() => {
    fetchInfo();
  }, []);

  async function fetchInfo() {
    setLoading(true);
    const { data } = await supabaseAdmin
      .from("restaurant_info")
      .select("*")
      .single();
    
    if (data) {
      setInfo(data);
    }
    setLoading(false);
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const { error } = await supabaseAdmin
      .from("restaurant_info")
      .update(info)
      .eq("id", 1);
    
    if (error) {
      setMessage({ type: "error", text: "Error al guardar los cambios." });
    } else {
      setMessage({ type: "success", text: "Configuración actualizada correctamente." });
    }
    setSaving(false);
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-12 text-latte">
      <RefreshCw className="animate-spin mb-4" size={32} />
      <p className="font-serif italic">Cargando configuración...</p>
    </div>
  );

  return (
    <div className="max-w-5xl space-y-8 pb-12">
      <div>
        <h1 className="font-serif text-3xl font-bold text-espresso">Ajustes Globales</h1>
        <p className="text-muted-foreground font-serif italic text-sm">Control total sobre la identidad y datos de Café Canella.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {message && (
          <div className={`p-4 rounded-md border ${message.type === "success" ? "bg-botanical/10 border-botanical/20 text-botanical" : "bg-roast/10 border-roast/20 text-roast"} text-sm font-serif italic text-center`}>
            {message.text}
          </div>
        )}

        {/* Funcionalidades */}
        <div className="menu-card p-6 sm:p-8 space-y-6 relative overflow-hidden">
          <h2 className="font-serif text-xl font-bold text-espresso relative border-b border-latte pb-3">Funcionalidades Extras</h2>
          <div className="relative">
            <label className="flex items-center gap-4 cursor-pointer p-2 rounded-lg hover:bg-parchment/50 transition-colors">
              <div
                onClick={() => setInfo({ ...info, show_item_images: info.show_item_images !== false })}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                  info.show_item_images !== false ? "bg-botanical" : "bg-latte"
                }`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                  info.show_item_images !== false ? "left-7" : "left-1"
                }`} />
              </div>
              <div>
                <span className="block font-sans font-semibold text-espresso text-sm">Fotos de productos al hacer clic</span>
                <span className="block text-xs text-muted-foreground font-serif italic mt-0.5">Si está activo, los clientes podrán ver fotos de los productos al hacerles clic.</span>
              </div>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* SECCIÓN HERO / HEADER */}
          <div className="lg:col-span-2 space-y-6">
            <div className="menu-card p-6 space-y-6">
              <h3 className="label-stamp text-roast flex items-center gap-2 border-b border-latte pb-3">
                <Type size={14} /> Cabecera (Hero)
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] label-stamp text-latte">Nombre del Local</label>
                  <input 
                    className="w-full bg-parchment border border-latte px-3 py-2 rounded outline-none focus:border-espresso font-serif font-bold text-lg"
                    value={info.name}
                    onChange={(e) => setInfo({...info, name: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] label-stamp text-latte">Eslogan / Subtítulo</label>
                  <input 
                    className="w-full bg-parchment border border-latte px-3 py-2 rounded outline-none focus:border-espresso font-serif italic text-sm"
                    value={info.tagline}
                    onChange={(e) => setInfo({...info, tagline: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] label-stamp text-latte">URL Imagen de Fondo (Hero)</label>
                <div className="relative">
                  <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-latte" size={14} />
                  <input 
                    className="w-full pl-10 pr-4 py-2 bg-parchment border border-latte rounded outline-none focus:border-espresso font-sans text-xs"
                    value={info.hero_image_url}
                    onChange={(e) => setInfo({...info, hero_image_url: e.target.value})}
                  />
                </div>
                <p className="text-[9px] text-muted-foreground mt-1">Usa una imagen de alta resolución (unsplash, etc.)</p>
              </div>
            </div>

            {/* SECCIÓN FOOTER / FRASES */}
            <div className="menu-card p-6 space-y-6">
              <h3 className="label-stamp text-roast flex items-center gap-2 border-b border-latte pb-3">
                <Quote size={14} /> Pie de Página y Frases
              </h3>
              
              <div className="space-y-1">
                <label className="text-[10px] label-stamp text-latte">Frase Inspiracional (Quote)</label>
                <textarea 
                  rows={2}
                  className="w-full bg-parchment border border-latte px-3 py-2 rounded outline-none focus:border-espresso font-serif italic text-sm"
                  value={info.quote_text}
                  onChange={(e) => setInfo({...info, quote_text: e.target.value})}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] label-stamp text-latte">Texto del Footer (Copyright/Legal)</label>
                <input 
                  className="w-full bg-parchment border border-latte px-3 py-2 rounded outline-none focus:border-espresso font-sans text-xs"
                  value={info.footer_text}
                  onChange={(e) => setInfo({...info, footer_text: e.target.value})}
                />
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA: DATOS RÁPIDOS */}
          <div className="space-y-6">
            {/* Info Bar */}
            <div className="menu-card p-6 space-y-4 bg-cream">
              <h3 className="label-stamp text-roast flex items-center gap-2">
                <Clock size={14} /> Datos del Local
              </h3>
              
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] label-stamp text-latte">Horario</label>
                  <input 
                    className="w-full bg-parchment border border-latte px-3 py-1.5 rounded outline-none focus:border-espresso text-xs"
                    value={info.schedule}
                    onChange={(e) => setInfo({...info, schedule: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] label-stamp text-latte">Dirección</label>
                  <input 
                    className="w-full bg-parchment border border-latte px-3 py-1.5 rounded outline-none focus:border-espresso text-xs"
                    value={info.address}
                    onChange={(e) => setInfo({...info, address: e.target.value})}
                  />
                </div>
              </div>
            </div>

            {/* Wifi */}
            <div className="menu-card p-6 space-y-4">
              <h3 className="label-stamp text-roast flex items-center gap-2">
                <Wifi size={14} /> Wifi
              </h3>
              <div className="space-y-3">
                <input 
                  placeholder="Red"
                  className="w-full bg-parchment border border-latte px-3 py-1.5 rounded text-xs"
                  value={info.wifi_name}
                  onChange={(e) => setInfo({...info, wifi_name: e.target.value})}
                />
                <input 
                  placeholder="Clave"
                  className="w-full bg-parchment border border-latte px-3 py-1.5 rounded text-xs font-mono"
                  value={info.wifi_password}
                  onChange={(e) => setInfo({...info, wifi_password: e.target.value})}
                />
              </div>
            </div>

            {/* Social */}
            <div className="menu-card p-6 space-y-4">
              <h3 className="label-stamp text-roast flex items-center gap-2">
                <Share2 size={14} /> Contacto
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <MessageCircle size={14} className="text-botanical" />
                  <input 
                    placeholder="WhatsApp"
                    className="flex-1 bg-parchment border border-latte px-2 py-1 rounded text-[11px]"
                    value={info.whatsapp_number}
                    onChange={(e) => setInfo({...info, whatsapp_number: e.target.value})}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Camera size={14} className="text-espresso" />
                  <input 
                    placeholder="Instagram URL"
                    className="flex-1 bg-parchment border border-latte px-2 py-1 rounded text-[11px]"
                    value={info.instagram_url}
                    onChange={(e) => setInfo({...info, instagram_url: e.target.value})}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="sticky bottom-6 flex justify-center">
          <button 
            type="submit"
            disabled={saving}
            className="flex items-center gap-3 bg-espresso text-cream px-12 py-4 rounded-full hover:bg-roast transition-all label-stamp shadow-warm-lg hover:scale-105 active:scale-95"
          >
            <Save size={20} /> {saving ? "Guardando cambios..." : "Publicar Actualizaciones"}
          </button>
        </div>
      </form>
    </div>
  );
}
