"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { MessageSquare, Send, CheckCircle2, AlertCircle, X, ShieldCheck } from "lucide-react";

interface PQRSFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PQRSForm({ isOpen, onClose }: PQRSFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    type: "Petición",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [hp, setHp] = useState(""); // Honeypot field

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Honeypot check: if hp is filled, it's likely a bot
    if (hp) {
      console.log("Spam detected");
      setStatus("success"); // Pretend it worked
      return;
    }

    setStatus("loading");

    // Basic sanitization (Supabase does the heavy lifting for SQLi, but we trim)
    const sanitizedData = {
      name: formData.name.trim().substring(0, 100),
      contact: formData.contact.trim().substring(0, 100),
      type: formData.type,
      message: formData.message.trim().substring(0, 1000),
    };

    const { error } = await supabase.from("pqrs").insert([sanitizedData]);

    if (error) {
      console.error(error);
      setStatus("error");
    } else {
      setStatus("success");
      setFormData({ name: "", contact: "", type: "Petición", message: "" });
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-espresso/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="menu-card w-full max-w-xl max-h-[90vh] overflow-y-auto relative shadow-2xl animate-in zoom-in-95 duration-300">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-parchment hover:bg-espresso hover:text-cream rounded-full transition-all z-10"
        >
          <X size={20} />
        </button>

        <div className="p-8 sm:p-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-parchment text-roast border border-latte mb-4">
              <MessageSquare size={24} />
            </div>
            <h2 className="font-serif text-3xl font-bold text-espresso italic">Buzón de PQRS</h2>
            <div className="ornament mt-4">
              <span className="text-roast text-sm">✦</span>
            </div>
            <p className="mt-4 text-muted-foreground font-serif italic text-sm">
              Tu opinión es muy importante. Déjanos tus comentarios de forma segura.
            </p>
          </div>

          {status === "success" ? (
            <div className="flex flex-col items-center justify-center py-8 text-center animate-in zoom-in duration-300">
              <div className="h-20 w-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 size={40} />
              </div>
              <h3 className="text-xl font-serif text-espresso font-semibold">¡Mensaje recibido!</h3>
              <p className="text-muted-foreground text-sm mt-2">Gracias por contactarnos. Revisaremos tu mensaje con prioridad.</p>
              <button 
                onClick={onClose}
                className="mt-8 bg-espresso text-cream px-8 py-2.5 rounded-xl font-serif italic hover:scale-105 transition-all"
              >
                Cerrar Ventana
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Honeypot hidden field */}
              <div className="hidden" aria-hidden="true">
                <input 
                  type="text" 
                  name="website_url" 
                  value={hp} 
                  onChange={(e) => setHp(e.target.value)} 
                  tabIndex={-1} 
                  autoComplete="off"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="label-stamp text-[0.6rem] text-roast ml-1 font-bold">Tu Nombre</label>
                  <input
                    required
                    type="text"
                    maxLength={100}
                    placeholder="Escribe aquí..."
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-cream/50 border border-latte rounded-xl px-4 py-2.5 text-espresso placeholder:text-espresso/30 focus:outline-none focus:ring-2 focus:ring-roast/20 transition-all font-sans"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="label-stamp text-[0.6rem] text-roast ml-1 font-bold">Contacto (Tel/Email)</label>
                  <input
                    required
                    type="text"
                    maxLength={100}
                    placeholder="WhatsApp o correo..."
                    value={formData.contact}
                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                    className="w-full bg-cream/50 border border-latte rounded-xl px-4 py-2.5 text-espresso placeholder:text-espresso/30 focus:outline-none focus:ring-2 focus:ring-roast/20 transition-all font-sans"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="label-stamp text-[0.6rem] text-roast ml-1 font-bold">Asunto del Mensaje</label>
                <div className="relative">
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full bg-cream/50 border border-latte rounded-xl px-4 py-2.5 text-espresso focus:outline-none focus:ring-2 focus:ring-roast/20 transition-all appearance-none cursor-pointer font-sans"
                  >
                    <option>Petición</option>
                    <option>Queja</option>
                    <option>Reclamo</option>
                    <option>Sugerencia</option>
                    <option>Felicitación</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-latte">
                    <Send size={14} className="rotate-90" />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="label-stamp text-[0.6rem] text-roast ml-1 font-bold">Descripción del Mensaje</label>
                <textarea
                  required
                  rows={4}
                  maxLength={1000}
                  placeholder="Cuéntanos más detalles..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-cream/50 border border-latte rounded-xl px-4 py-2.5 text-espresso placeholder:text-espresso/30 focus:outline-none focus:ring-2 focus:ring-roast/20 transition-all resize-none font-serif italic"
                ></textarea>
              </div>

              {status === "error" && (
                <div className="flex items-center gap-2 text-rose-600 bg-rose-50 p-3 rounded-xl text-xs border border-rose-100">
                  <AlertCircle size={14} />
                  <span>Ocurrió un error. Verifica tu conexión e intenta de nuevo.</span>
                </div>
              )}

              <div className="flex flex-col gap-3 pt-2">
                <button
                  disabled={status === "loading"}
                  type="submit"
                  className="w-full bg-espresso text-cream rounded-xl py-4 font-serif font-bold text-lg shadow-warm hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {status === "loading" ? (
                    <div className="h-6 w-6 border-2 border-cream/30 border-t-cream rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send size={20} />
                      <span>Enviar Comentario</span>
                    </>
                  )}
                </button>
                <div className="flex items-center justify-center gap-2 text-[10px] label-stamp text-muted-foreground/60">
                  <ShieldCheck size={12} />
                  <span>Protección anti-spam activada</span>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
