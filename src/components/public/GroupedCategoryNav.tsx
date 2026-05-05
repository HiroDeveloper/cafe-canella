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
    <div className="max-w-4xl mx-auto px-6">
      <div className="flex items-center justify-center gap-2 py-3 overflow-x-auto hide-scrollbar">
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
      </div>
    </div>
  );
}
