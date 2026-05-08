"use client";

import { useState } from "react";
import { MessageSquarePlus } from "lucide-react";
import PQRSForm from "./PQRSForm";

export default function PQRSButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="max-w-4xl mx-auto px-6 py-12 border-t border-latte/30">
        <div className="menu-card p-10 text-center bg-parchment/30">
          <h3 className="font-serif text-2xl font-bold text-espresso mb-4 italic">¿Tienes alguna duda o sugerencia?</h3>
          <p className="text-muted-foreground font-serif italic text-sm mb-8 max-w-md mx-auto">
            Tu feedback nos ayuda a mejorar. Haz clic en el botón para dejarnos un mensaje.
          </p>
          <button
            onClick={() => setIsOpen(true)}
            className="inline-flex items-center gap-3 bg-espresso text-cream px-8 py-4 rounded-2xl font-serif font-bold text-lg shadow-warm hover:scale-105 active:scale-95 transition-all"
          >
            <MessageSquarePlus size={22} />
            Buzón de PQRS
          </button>
        </div>
      </div>

      <PQRSForm isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
