"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Category } from "@/lib/types";

interface GroupedCategoryNavProps {
  groupedCategories: Record<string, Category[]>;
}

export default function GroupedCategoryNav({ groupedCategories }: GroupedCategoryNavProps) {
  const groups = Object.keys(groupedCategories);
  const [activeGroup, setActiveGroup] = useState(groups[0] || "");

  // Flag que bloquea el IntersectionObserver mientras un scroll programático está activo
  const isScrollingRef = useRef(false);
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Detectar cuál grupo está en pantalla al hacer scroll manual
  useEffect(() => {
    const allCategories = Object.values(groupedCategories).flat();

    const observer = new IntersectionObserver(
      (entries) => {
        // Si el scroll fue iniciado por nosotros, ignorar los eventos del observer
        if (isScrollingRef.current) return;

        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const slug = entry.target.id.replace("sec-", "");
            for (const [group, cats] of Object.entries(groupedCategories)) {
              if (cats.some((c) => c.slug === slug)) {
                setActiveGroup(group);
                break;
              }
            }
          }
        });
      },
      { threshold: 0.2, rootMargin: "-80px 0px -50% 0px" }
    );

    allCategories.forEach((cat) => {
      const el = document.getElementById(`sec-${cat.slug}`);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [groupedCategories]);

  const scrollToGroup = useCallback((group: string) => {
    // Cancelar el timer anterior si el usuario hace clic antes de que termine
    if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);

    // Bloquear el observer y actualizar el activo inmediatamente
    isScrollingRef.current = true;
    setActiveGroup(group);

    const groupId = `group-${group.toLowerCase().replace(/\s+/g, "-")}`;
    const el = document.getElementById(groupId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }

    // Liberar el bloqueo después de que el scroll suave termine (~800 ms)
    scrollTimerRef.current = setTimeout(() => {
      isScrollingRef.current = false;
    }, 800);
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto relative">
      <div className="flex items-center sm:justify-center gap-2 py-3 px-5 overflow-x-auto hide-scrollbar [mask-image:linear-gradient(to_right,transparent,black_16px,black_calc(100%-16px),transparent)] sm:[mask-image:none]">
        <div className="w-2 shrink-0 sm:hidden" /> {/* Spacer */}
        {groups.map((group) => (
          <button
            key={group}
            onClick={() => scrollToGroup(group)}
            data-active={activeGroup === group ? "true" : "false"}
            className={`nav-pill px-5 py-2 rounded-full text-[11px] label-stamp whitespace-nowrap shrink-0 ${
              activeGroup !== group ? "text-roast hover:bg-latte/30" : ""
            }`}
          >
            {group}
          </button>
        ))}
        <div className="w-2 shrink-0 sm:hidden" /> {/* Spacer */}
      </div>
    </div>
  );
}
