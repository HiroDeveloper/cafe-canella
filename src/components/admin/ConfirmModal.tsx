"use client";

import { useEffect } from "react";
import { AlertTriangle, Info, X } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "info";
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  variant = "danger",
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  // Cerrar con ESC
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    if (isOpen) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const colors = {
    danger: {
      bg: "bg-red-50",
      border: "border-red-100",
      icon: "text-red-400",
      btn: "bg-roast hover:bg-red-600 text-cream",
    },
    warning: {
      bg: "bg-amber-50",
      border: "border-amber-100",
      icon: "text-amber-400",
      btn: "bg-espresso hover:bg-roast text-cream",
    },
    info: {
      bg: "bg-parchment",
      border: "border-latte",
      icon: "text-roast",
      btn: "bg-espresso hover:bg-roast text-cream",
    },
  }[variant];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-espresso/50 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative menu-card w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className={`p-6 ${colors.bg} border-b ${colors.border}`}>
          <div className="flex items-start gap-4">
            <div className={`${colors.icon} shrink-0 mt-0.5`}>
              {variant === "info" ? (
                <Info size={22} />
              ) : (
                <AlertTriangle size={22} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-serif font-bold text-espresso text-lg leading-tight">
                {title}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground font-sans leading-relaxed">
                {message}
              </p>
            </div>
            <button
              onClick={onCancel}
              className="text-latte hover:text-espresso transition-colors shrink-0"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="p-4 bg-cream flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-5 py-2 rounded-md font-serif italic text-muted-foreground hover:text-espresso border border-latte hover:border-espresso transition-all text-sm"
          >
            {cancelLabel}
          </button>
          <button
            onClick={() => { onConfirm(); onCancel(); }}
            className={`px-5 py-2 rounded-md label-stamp text-sm transition-all shadow-warm-sm ${colors.btn}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
