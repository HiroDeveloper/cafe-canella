"use client";

import { useState, useRef } from "react";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { Upload, Link, X, Image as ImageIcon, Loader2 } from "lucide-react";

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  aspectRatio?: "video" | "square" | "wide";
}

export default function ImageUploader({
  value,
  onChange,
  aspectRatio = "video",
}: ImageUploaderProps) {
  const [tab, setTab] = useState<"upload" | "url">("upload");
  const [urlInput, setUrlInput] = useState(value || "");
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const aspectClasses = {
    video: "aspect-video",
    square: "aspect-square",
    wide: "aspect-[3/1]",
  }[aspectRatio];

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    setUploading(true);

    try {
      const ext = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { data, error } = await supabaseAdmin.storage
        .from("menu-images")
        .upload(fileName, file, { upsert: true });

      if (error) throw error;

      const { data: { publicUrl } } = supabaseAdmin.storage
        .from("menu-images")
        .getPublicUrl(data.path);

      onChange(publicUrl);
      setUrlInput(publicUrl);
    } catch (err) {
      console.error("Error subiendo imagen:", err);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
    }
  };

  const handleClear = () => {
    onChange("");
    setUrlInput("");
  };

  return (
    <div className="space-y-3">
      {/* Preview */}
      <div className={`relative ${aspectClasses} rounded-lg border-2 border-latte overflow-hidden bg-parchment`}>
        {value ? (
          <>
            <img
              src={value}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={handleClear}
              className="absolute top-2 right-2 p-1.5 bg-roast/90 text-cream rounded-full hover:bg-roast transition-colors"
            >
              <X size={14} />
            </button>
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-latte/50">
            <ImageIcon size={36} />
            <span className="text-[10px] label-stamp">Sin imagen</span>
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 bg-espresso/60 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2 text-cream">
              <Loader2 className="animate-spin" size={28} />
              <span className="text-xs label-stamp">Subiendo...</span>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border border-latte rounded-md overflow-hidden">
        <button
          type="button"
          onClick={() => setTab("upload")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-[10px] label-stamp transition-colors ${
            tab === "upload"
              ? "bg-espresso text-cream"
              : "bg-cream text-roast hover:bg-parchment"
          }`}
        >
          <Upload size={12} /> Subir archivo
        </button>
        <button
          type="button"
          onClick={() => setTab("url")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-[10px] label-stamp transition-colors ${
            tab === "url"
              ? "bg-espresso text-cream"
              : "bg-cream text-roast hover:bg-parchment"
          }`}
        >
          <Link size={12} /> Usar URL
        </button>
      </div>

      {/* Upload Tab */}
      {tab === "upload" && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${
            dragOver
              ? "border-espresso bg-espresso/5"
              : "border-latte hover:border-roast hover:bg-parchment/50"
          }`}
        >
          <Upload className="mx-auto mb-2 text-latte" size={24} />
          <p className="text-xs font-sans text-muted-foreground">
            Arrastra una imagen aquí o{" "}
            <span className="text-espresso font-semibold underline">haz clic para seleccionar</span>
          </p>
          <p className="text-[10px] text-latte mt-1">JPG, PNG, WebP · Máx. 5MB</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
        </div>
      )}

      {/* URL Tab */}
      {tab === "url" && (
        <div className="flex gap-2">
          <input
            type="url"
            placeholder="https://ejemplo.com/imagen.jpg"
            className="flex-1 bg-parchment border border-latte px-3 py-2 rounded-md outline-none focus:border-espresso text-xs font-sans"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleUrlSubmit()}
          />
          <button
            type="button"
            onClick={handleUrlSubmit}
            className="px-3 py-2 bg-espresso text-cream rounded-md hover:bg-roast transition-colors label-stamp text-[10px]"
          >
            Aplicar
          </button>
        </div>
      )}
    </div>
  );
}
