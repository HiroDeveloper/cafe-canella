"use client";

import { useState, useEffect } from "react";
import { Category } from "@/lib/types";

interface GroupedCategoryNavProps {
  groupedCategories: Record<string, Category[]>;
}

export default function GroupedCategoryNav({ groupedCategories }: GroupedCategoryNavProps) {
  const groups = Object.keys(groupedCategories);
  const [activeGroup, setActiveGroup] = useState(groups[0] || "");

  // Detectar cuál grupo está en pantalla al hacer scroll
  useEffect(() => {
    const allCategories = Object.values(groupedCategories).flat();

    const observer = new IntersectionObserver(
      (entries) => {
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

  const scrollToGroup = (group: string) => {
    const firstCat = groupedCategories[group]?.[0];
    if (!firstCat) return;
    const el = document.getElementById(`sec-${firstCat.slug}`);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 88;
      window.scrollTo({ top, behavior: "smooth" });
    }
    setActiveGroup(group);
  };

  return (
    <div className="w-full max-w-4xl mx-auto relative">
      <div className="flex items-center sm:justify-center gap-2 py-3 px-5 overflow-x-auto hide-scrollbar [mask-image:linear-gradient(to_right,transparent,black_16px,black_calc(100%-16px),transparent)] sm:[mask-image:none]">
        <div className="w-2 shrink-0 sm:hidden"></div> {/* Spacer */}
        {groups.map((group) => (
          <button
            key={group}
            onClick={() => scrollToGroup(group)}
            className={`px-5 py-2 rounded-full text-[11px] label-stamp whitespace-nowrap transition-all shrink-0 ${
              activeGroup === group
                ? "bg-espresso text-cream shadow-warm-sm"
                : "text-roast hover:bg-latte/30"
            }`}
          >
            {group}
          </button>
        ))}
        <div className="w-2 shrink-0 sm:hidden"></div> {/* Spacer */}
      </div>
    </div>
  );
}
