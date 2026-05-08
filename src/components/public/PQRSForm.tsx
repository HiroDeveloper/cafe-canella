"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { MessageSquare, Send, CheckCircle2, AlertCircle } from "lucide-react";

export default function PQRSForm() {
  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    type: "Petición",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    const { error } = await supabase.from("pqrs").insert([formData]);

    if (error) {
      console.error(error);
      setStatus("error");
    } else {
      setStatus("success");
      setFormData({ name: "", contact: "", type: "Petición", message: "" });
      setTimeout(() => setStatus("idle"), 5000);
    }
  };

  return (
    <section id="pqrs" className="max-w-2xl mx-auto px-6 py-16 scroll-mt-24">
      <div className="menu-card p-8 sm:p-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-parchment text-roast border border-latte mb-4">
            <MessageSquare size={24} />
          </div>
          <h2 className="font-serif text-3xl font-bold text-espresso italic">Preguntas, Quejas y Respuestas</h2>
          <div className="ornament mt-4">
            <span className="text-roast text-sm">✦</span>
          </div>
          <p className="mt-4 text-muted-foreground font-serif italic text-sm">
            Tu opinión es muy importante para nosotros. Déjanos tus comentarios o inquietudes.
          </p>
        </div>

        {status === "success" ? (
          <div className="flex flex-col items-center justify-center py-8 text-center animate-in zoom-in duration-300">
            <CheckCircle2 size={48} className="text-emerald-600 mb-4" />
            <h3 className="text-xl font-serif text-espresso font-semibold">¡Mensaje enviado!</h3>
            <p className="text-muted-foreground text-sm mt-2">Gracias por contactarnos. Revisaremos tu mensaje pronto.</p>
            <button 
              onClick={() => setStatus("idle")}
              className="mt-6 text-roast font-serif italic border-b border-roast/30 hover:border-roast transition-all"
            >
              Enviar otro mensaje
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="label-stamp text-[0.6rem] text-roast ml-1">Nombre Completo</label>
                <input
                  required
                  type="text"
                  placeholder="Tu nombre..."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-cream/50 border border-latte rounded-xl px-4 py-2.5 text-espresso placeholder:text-espresso/30 focus:outline-none focus:ring-2 focus:ring-roast/20 transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="label-stamp text-[0.6rem] text-roast ml-1">WhatsApp o Email</label>
                <input
                  required
                  type="text"
                  placeholder="Cómo contactarte..."
                  value={formData.contact}
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                  className="w-full bg-cream/50 border border-latte rounded-xl px-4 py-2.5 text-espresso placeholder:text-espresso/30 focus:outline-none focus:ring-2 focus:ring-roast/20 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="label-stamp text-[0.6rem] text-roast ml-1">Tipo de Mensaje</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full bg-cream/50 border border-latte rounded-xl px-4 py-2.5 text-espresso focus:outline-none focus:ring-2 focus:ring-roast/20 transition-all appearance-none cursor-pointer"
              >
                <option>Petición</option>
                <option>Queja</option>
                <option>Reclamo</option>
                <option>Sugerencia</option>
                <option>Felicitación</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="label-stamp text-[0.6rem] text-roast ml-1">Mensaje</label>
              <textarea
                required
                rows={4}
                placeholder="Escribe aquí tu mensaje..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full bg-cream/50 border border-latte rounded-xl px-4 py-2.5 text-espresso placeholder:text-espresso/30 focus:outline-none focus:ring-2 focus:ring-roast/20 transition-all resize-none"
              ></textarea>
            </div>

            {status === "error" && (
              <div className="flex items-center gap-2 text-rose-600 bg-rose-50 p-3 rounded-xl text-xs">
                <AlertCircle size={14} />
                <span>Ocurrió un error al enviar el mensaje. Intenta de nuevo.</span>
              </div>
            )}

            <button
              disabled={status === "loading"}
              type="submit"
              className="w-full bg-espresso text-cream rounded-xl py-3.5 font-serif font-semibold shadow-warm hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:scale-100"
            >
              {status === "loading" ? (
                <div className="h-5 w-5 border-2 border-cream/30 border-t-cream rounded-full animate-spin" />
              ) : (
                <>
                  <Send size={18} />
                  <span>Enviar Mensaje</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
