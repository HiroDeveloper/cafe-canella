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
  Quote,
  QrCode,
  ShieldAlert
} from "lucide-react";
import ImageUploader from "@/components/admin/ImageUploader";
import { QRCodeSVG } from "qrcode.react";

const FacebookIcon = ({ size = 14, className = "" }: { size?: number, className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
  </svg>
);

const InstagramIcon = ({ size = 14, className = "" }: { size?: number, className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
  </svg>
);

export default function SettingsPage() {
  const [info, setInfo] = useState<any>({
    name: "Café Canella",
    tagline: "",
    address: "",
    schedule: "",
    wifi_name: "",
    wifi_password: "",
    whatsapp_number: "",
    whatsapp_message: "",
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
            <div className="h-px bg-latte/30 my-2" />
            <label className="flex items-center gap-4 cursor-pointer p-2 rounded-lg hover:bg-parchment/50 transition-colors">
              <div
                onClick={() => setInfo({ ...info, is_closed: !info.is_closed })}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                  info.is_closed ? "bg-roast" : "bg-latte"
                }`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                  info.is_closed ? "left-7" : "left-1"
                }`} />
              </div>
              <div>
                <span className="flex items-center gap-2 font-sans font-semibold text-espresso text-sm">
                  <ShieldAlert size={16} className={info.is_closed ? "text-roast" : "text-latte"} />
                  Modo Mantenimiento / Cerrado
                </span>
                <span className="block text-xs text-muted-foreground font-serif italic mt-0.5">Si está activo, el menú público mostrará un mensaje de que están cerrados y nadie podrá ver los productos.</span>
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

              <div className="space-y-2">
                <label className="text-[10px] label-stamp text-latte">Imagen de Fondo (Hero)</label>
                <div className="bg-parchment rounded-lg border border-latte/50 p-2">
                  <ImageUploader 
                    value={info.hero_image_url} 
                    onChange={(url) => setInfo({...info, hero_image_url: url})} 
                  />
                </div>
                <p className="text-[9px] text-muted-foreground mt-1">Sube una foto o pega una URL. Recomendado: foto apaisada de alta resolución.</p>
              </div>
            </div>

            {/* SECCIÓN FOOTER / FRASES */}
            <div className="menu-card p-6 space-y-6">
              <h3 className="label-stamp text-roast flex items-center gap-2 border-b border-latte pb-3">
                <Quote size={14} /> Recomendaciones y Frases
              </h3>
              
              <div className="space-y-1">
                <label className="text-[10px] label-stamp text-latte">Recomendaciones del Día</label>
                <input 
                  placeholder="Ej: Ice Latte, Limonada de Lychee, Granizado Mango"
                  className="w-full bg-parchment border border-latte px-3 py-2 rounded outline-none focus:border-espresso font-serif italic text-sm"
                  value={info.recommendations ?? "Ice Latte, Limonada de Lychee, Granizado Mango"}
                  onChange={(e) => setInfo({...info, recommendations: e.target.value})}
                />
                <p className="text-[9px] text-muted-foreground mt-1">Separa cada producto con una coma (,)</p>
              </div>

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
              <h3 className="label-stamp text-roast flex items-center gap-2 border-b border-latte pb-3">
                <Share2 size={14} /> Contacto y Redes
              </h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] label-stamp text-latte flex items-center gap-1">
                      <InstagramIcon size={12} className="text-espresso" /> Instagram
                    </label>
                    <input 
                      placeholder="https://instagram.com/..."
                      className="w-full bg-parchment border border-latte px-3 py-2 rounded outline-none focus:border-espresso font-sans text-xs"
                      value={info.instagram_url}
                      onChange={(e) => setInfo({...info, instagram_url: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] label-stamp text-latte flex items-center gap-1">
                      <FacebookIcon size={12} className="text-espresso" /> Facebook
                    </label>
                    <input 
                      placeholder="https://facebook.com/..."
                      className="w-full bg-parchment border border-latte px-3 py-2 rounded outline-none focus:border-espresso font-sans text-xs"
                      value={info.facebook_url}
                      onChange={(e) => setInfo({...info, facebook_url: e.target.value})}
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <label className="text-[10px] label-stamp text-latte flex items-center gap-1 mb-2">
                    <MessageCircle size={12} className="text-botanical" /> Pedidos por WhatsApp
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input 
                      placeholder="Número (ej. 573001234567)"
                      className="w-full bg-parchment border border-latte px-3 py-2 rounded outline-none focus:border-espresso font-sans text-xs"
                      value={info.whatsapp_number}
                      onChange={(e) => setInfo({...info, whatsapp_number: e.target.value})}
                    />
                    <textarea 
                      placeholder="Mensaje automático (Ej: Hola, quisiera pedir...)"
                      rows={1}
                      className="w-full bg-parchment border border-latte px-3 py-2 rounded outline-none focus:border-espresso font-sans text-xs resize-none"
                      value={info.whatsapp_message || ""}
                      onChange={(e) => setInfo({...info, whatsapp_message: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* QR Generator */}
            <div className="menu-card p-6 space-y-4">
              <h3 className="label-stamp text-roast flex items-center gap-2">
                <QrCode size={14} /> Tu Código QR
              </h3>
              <div className="flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-latte/50 shadow-sm">
                {typeof window !== 'undefined' && (
                  <QRCodeSVG 
                    value={window.location.origin} 
                    size={150} 
                    bgColor={"#ffffff"}
                    fgColor={"#352A21"} 
                    level={"H"} 
                    includeMargin={true}
                  />
                )}
                <p className="text-[10px] text-muted-foreground text-center mt-3 font-serif">
                  Escanea para ver el menú.
                  <br />
                  <span className="font-sans font-semibold text-espresso">{typeof window !== 'undefined' ? window.location.origin : ''}</span>
                </p>
                <button 
                  type="button"
                  onClick={() => {
                    const svg = document.querySelector('.menu-card svg');
                    if (!svg) return;
                    const svgData = new XMLSerializer().serializeToString(svg);
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    const img = new Image();
                    img.onload = () => {
                      canvas.width = img.width;
                      canvas.height = img.height;
                      ctx?.drawImage(img, 0, 0);
                      const pngFile = canvas.toDataURL('image/png');
                      const downloadLink = document.createElement('a');
                      downloadLink.download = 'menu-qr.png';
                      downloadLink.href = `${pngFile}`;
                      downloadLink.click();
                    };
                    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
                  }}
                  className="mt-4 bg-espresso/10 hover:bg-espresso/20 text-espresso text-xs px-4 py-2 rounded font-semibold transition-colors"
                >
                  Descargar PNG
                </button>
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
