"use client";

import { useState, useEffect } from "react";
import { Type, Check } from "lucide-react";

const FONT_OPTIONS = [
  {
    name: "Clásico",
    primary: "var(--font-next-serif)",
    secondary: "var(--font-next-sans)",
    preview: "Serif + Sans"
  },
  {
    name: "Elegante",
    primary: "'Cormorant Garamond', serif",
    secondary: "'Montserrat', sans-serif",
    preview: "Garamond + Mont"
  },
  {
    name: "Moderno",
    primary: "'Outfit', sans-serif",
    secondary: "'Outfit', sans-serif",
    preview: "Outfit Modern"
  },
  {
    name: "Vintage",
    primary: "'Playfair Display', serif",
    secondary: "'Montserrat', sans-serif",
    preview: "Playfair + Mont"
  }
];

export default function FontSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFont, setSelectedFont] = useState(FONT_OPTIONS[0].name);

  useEffect(() => {
    const saved = localStorage.getItem("menu-font-choice");
    if (saved) {
      const option = FONT_OPTIONS.find(o => o.name === saved);
      if (option) {
        applyFont(option);
        setSelectedFont(option.name);
      }
    }
  }, []);

  const applyFont = (option: typeof FONT_OPTIONS[0]) => {
    document.documentElement.style.setProperty("--font-primary", option.primary);
    document.documentElement.style.setProperty("--font-secondary", option.secondary);
    localStorage.setItem("menu-font-choice", option.name);
  };

  const handleSelect = (option: typeof FONT_OPTIONS[0]) => {
    applyFont(option);
    setSelectedFont(option.name);
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-24 right-5 sm:bottom-28 sm:right-6 z-40">
      {isOpen && (
        <div className="absolute bottom-16 right-0 bg-cream border border-latte rounded-2xl shadow-warm-lg p-4 w-56 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="label-stamp text-roast mb-3 px-2">Cambiar Tipografía</div>
          <div className="space-y-1">
            {FONT_OPTIONS.map((option) => (
              <button
                key={option.name}
                onClick={() => handleSelect(option)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all text-sm ${
                  selectedFont === option.name
                    ? "bg-espresso text-cream shadow-warm-sm"
                    : "text-espresso hover:bg-latte/20"
                }`}
              >
                <div className="text-left">
                  <div className="font-semibold">{option.name}</div>
                  <div className={`text-[10px] ${selectedFont === option.name ? "text-cream/70" : "text-muted-foreground"}`}>
                    {option.preview}
                  </div>
                </div>
                {selectedFont === option.name && <Check size={14} />}
              </button>
            ))}
          </div>
        </div>
      )}
      
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-center h-12 w-12 rounded-full border border-latte shadow-warm transition-all hover:scale-105 active:scale-95 ${
          isOpen ? "bg-espresso text-cream" : "bg-cream text-espresso"
        }`}
        title="Cambiar tipografía"
      >
        <Type size={20} />
      </button>
    </div>
  );
}
