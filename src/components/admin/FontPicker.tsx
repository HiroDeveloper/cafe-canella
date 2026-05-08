"use client";

import { Type } from "lucide-react";

const FONTS = [
  { name: "Serif (Default)", value: "var(--font-next-serif)" },
  { name: "Sans (Default)", value: "var(--font-next-sans)" },
  { name: "Playfair Display", value: "'Playfair Display', serif" },
  { name: "Montserrat", value: "'Montserrat', sans-serif" },
  { name: "Cormorant", value: "'Cormorant Garamond', serif" },
  { name: "Outfit", value: "'Outfit', sans-serif" },
];

interface FontPickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

export default function FontPicker({ value, onChange, label }: FontPickerProps) {
  return (
    <div className="space-y-1.5">
      {label && <label className="label-stamp text-[10px] text-roast">{label}</label>}
      <div className="relative group">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-latte group-focus-within:text-espresso transition-colors">
          <Type size={14} />
        </div>
        <select
          value={value || "var(--font-next-serif)"}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-parchment border border-latte rounded-md outline-none focus:border-espresso font-sans text-xs appearance-none cursor-pointer"
          style={{ fontFamily: value }}
        >
          {FONTS.map((font) => (
            <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>
              {font.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
