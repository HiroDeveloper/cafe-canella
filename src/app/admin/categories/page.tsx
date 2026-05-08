"use client";

import { useEffect, useState, useRef } from "react";
import { supabaseAdmin } from "@/lib/supabase-admin";
import {
  Plus, Trash2, Edit3, Save, X, Eye, EyeOff, FolderTree, GripVertical, Check
} from "lucide-react";
import ConfirmModal from "@/components/admin/ConfirmModal";
import FontPicker from "@/components/admin/FontPicker";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]); // { id, name, sort_order }
  const [loading, setLoading] = useState(true);

  // Drag refs para grupos
  const dragGroup = useRef<string | null>(null);
  const dragOverGroup = useRef<string | null>(null);

  // Drag refs para categorías
  const dragCat = useRef<string | null>(null);
  const dragOverCat = useRef<string | null>(null);

  // Estado para editar categoría
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editCatForm, setEditCatForm] = useState({ name: "", slug: "", group: "", is_visible: true, font_family: "" });
  
  // Estado para crear categoría
  const [addingCat, setAddingCat] = useState(false);
  const [newCatForm, setNewCatForm] = useState({ name: "", slug: "", group: "", is_visible: true, font_family: "" });

  // Estado para gestionar grupos
  const [editingGroup, setEditingGroup] = useState<string | null>(null);
  const [editGroupName, setEditGroupName] = useState("");
  const [addingGroup, setAddingGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");

  // Confirm modal
  const [confirm, setConfirm] = useState<{ open: boolean; title: string; message: string; onConfirm: () => void }>({
    open: false, title: "", message: "", onConfirm: () => {}
  });

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    setLoading(true);
    const [{ data: groupsData }, { data: catsData }] = await Promise.all([
      supabaseAdmin.from("groups").select("*").order("sort_order", { ascending: true }),
      supabaseAdmin.from("categories").select("*").order("sort_order", { ascending: true }),
    ]);

    if (groupsData) setGroups(groupsData);
    if (catsData) setCategories(catsData);
    setLoading(false);
  }

  const groupNames = groups.map(g => g.name);

  // ——— Drag: Grupos ———
  const handleDropGroup = async () => {
    if (!dragGroup.current || !dragOverGroup.current || dragGroup.current === dragOverGroup.current) return;

    const dragIdx = groups.findIndex(g => g.id === dragGroup.current);
    const dropIdx = groups.findIndex(g => g.id === dragOverGroup.current);
    if (dragIdx === -1 || dropIdx === -1) return;

    const reordered = [...groups];
    const [moved] = reordered.splice(dragIdx, 1);
    reordered.splice(dropIdx, 0, moved);

    const reindexed = reordered.map((g, i) => ({ ...g, sort_order: i }));
    setGroups(reindexed); // Optimistic

    await Promise.all(
      reindexed.map(g => supabaseAdmin.from("groups").update({ sort_order: g.sort_order }).eq("id", g.id))
    );

    dragGroup.current = null;
    dragOverGroup.current = null;
  };

  // ——— Drag: Categorías ———
  const handleDropCat = async (groupName: string) => {
    if (!dragCat.current || !dragOverCat.current || dragCat.current === dragOverCat.current) return;

    const groupCats = categories.filter(c => (c.group || "General") === groupName);
    const dragIdx = groupCats.findIndex(c => c.id === dragCat.current);
    const dropIdx = groupCats.findIndex(c => c.id === dragOverCat.current);
    if (dragIdx === -1 || dropIdx === -1) return;

    const reordered = [...groupCats];
    const [moved] = reordered.splice(dragIdx, 1);
    reordered.splice(dropIdx, 0, moved);

    const otherCats = categories.filter(c => (c.group || "General") !== groupName);
    const reindexed = reordered.map((c, i) => ({ ...c, sort_order: i }));
    setCategories([...otherCats, ...reindexed]); // Optimistic

    await Promise.all(
      reindexed.map(c => supabaseAdmin.from("categories").update({ sort_order: c.sort_order }).eq("id", c.id))
    );

    dragCat.current = null;
    dragOverCat.current = null;
  };

  // ——— CRUD Grupos ———
  const handleAddGroup = async () => {
    if (!newGroupName.trim()) return;
    const newOrder = groups.length;
    const { data } = await supabaseAdmin
      .from("groups")
      .insert([{ name: newGroupName.trim(), sort_order: newOrder }])
      .select()
      .single();
    if (data) setGroups(prev => [...prev, data]);
    setNewGroupName("");
    setAddingGroup(false);
  };

  const handleRenameGroup = async (group: any) => {
    if (!editGroupName.trim() || editGroupName === group.name) { setEditingGroup(null); return; }
    await Promise.all([
      supabaseAdmin.from("groups").update({ name: editGroupName.trim() }).eq("id", group.id),
      supabaseAdmin.from("categories").update({ group: editGroupName.trim() }).eq("group", group.name),
    ]);
    setEditingGroup(null);
    fetchAll();
  };

  const handleDeleteGroup = (group: any) => {
    const count = categories.filter(c => c.group === group.name).length;
    setConfirm({
      open: true,
      title: `Eliminar grupo "${group.name}"`,
      message: `Las ${count} categorías asignadas quedarán en "General". Esta acción no elimina los productos.`,
      onConfirm: async () => {
        await Promise.all([
          supabaseAdmin.from("groups").delete().eq("id", group.id),
          supabaseAdmin.from("categories").update({ group: "General" }).eq("group", group.name),
        ]);
        fetchAll();
      }
    });
  };

  // ——— CRUD Categorías ———
  const handleSaveCat = async (id: string) => {
    await supabaseAdmin.from("categories").update(editCatForm).eq("id", id);
    setEditingCatId(null);
    fetchAll();
  };

  const handleAddCat = async () => {
    if (!newCatForm.name.trim()) return;
    await supabaseAdmin.from("categories").insert([{
      ...newCatForm,
      slug: newCatForm.slug || newCatForm.name.toLowerCase().normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-"),
      sort_order: categories.length
    }]);
    setAddingCat(false);
    setNewCatForm({ name: "", slug: "", group: groupNames[0] || "General", is_visible: true, font_family: "" });
    fetchAll();
  };

  const handleDeleteCat = (cat: any) => {
    setConfirm({
      open: true,
      title: `Eliminar "${cat.name}"`,
      message: "Se eliminarán la categoría y todos sus productos. Esta acción es irreversible.",
      onConfirm: async () => {
        await supabaseAdmin.from("categories").delete().eq("id", cat.id);
        fetchAll();
      }
    });
  };

  const toggleVisibility = async (cat: any) => {
    await supabaseAdmin.from("categories").update({ is_visible: !cat.is_visible }).eq("id", cat.id);
    setCategories(prev => prev.map(c => c.id === cat.id ? { ...c, is_visible: !c.is_visible } : c));
  };

  // Categorías agrupadas respetando el orden de groups[]
  const categoriesByGroup: Record<string, any[]> = {};
  categories.forEach(c => {
    const g = c.group || "General";
    if (!categoriesByGroup[g]) categoriesByGroup[g] = [];
    categoriesByGroup[g].push(c);
  });

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="font-serif text-2xl font-bold text-espresso">Estructura del Menú</h1>
        <p className="text-muted-foreground font-serif italic text-sm">Gestiona grupos y categorías — arrastra para reordenar.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* ———— PANEL IZQUIERDO: Grupos ———— */}
        <div className="xl:col-span-1 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="label-stamp text-roast flex items-center gap-2">
              <FolderTree size={14} /> Grupos · Orden
            </h2>
            <button
              onClick={() => setAddingGroup(true)}
              className="flex items-center gap-1.5 text-[10px] label-stamp text-botanical hover:text-botanical/70 transition-colors"
            >
              <Plus size={14} /> Nuevo
            </button>
          </div>

          <div className="menu-card overflow-hidden divide-y divide-latte/30">
            {addingGroup && (
              <div className="p-3 bg-botanical/5 flex gap-2">
                <input
                  autoFocus
                  placeholder="Nombre del grupo"
                  className="flex-1 bg-cream border border-latte px-3 py-1.5 rounded text-sm outline-none focus:border-espresso"
                  value={newGroupName}
                  onChange={e => setNewGroupName(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") handleAddGroup(); if (e.key === "Escape") setAddingGroup(false); }}
                />
                <button onClick={handleAddGroup} className="p-1.5 text-botanical hover:bg-botanical/10 rounded"><Save size={16} /></button>
                <button onClick={() => setAddingGroup(false)} className="p-1.5 text-roast hover:bg-roast/10 rounded"><X size={16} /></button>
              </div>
            )}

            {groups.map((group, idx) => (
              <div
                key={group.id}
                draggable
                onDragStart={() => { dragGroup.current = group.id; }}
                onDragEnter={() => { dragOverGroup.current = group.id; }}
                onDragEnd={handleDropGroup}
                onDragOver={e => e.preventDefault()}
                className="flex items-center gap-2 p-3 hover:bg-parchment/40 transition-colors cursor-default"
              >
                <GripVertical size={16} className="text-latte shrink-0 cursor-grab active:cursor-grabbing" />

                <span className="text-[10px] label-stamp text-latte w-5 text-center shrink-0">{idx + 1}</span>

                {editingGroup === group.id ? (
                  <>
                    <input
                      autoFocus
                      className="flex-1 bg-cream border border-latte px-2 py-1 rounded text-sm outline-none focus:border-espresso"
                      value={editGroupName}
                      onChange={e => setEditGroupName(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") handleRenameGroup(group); if (e.key === "Escape") setEditingGroup(null); }}
                    />
                    <button onClick={() => handleRenameGroup(group)} className="p-1 text-botanical hover:bg-botanical/10 rounded"><Check size={15} /></button>
                    <button onClick={() => setEditingGroup(null)} className="p-1 text-roast hover:bg-roast/10 rounded"><X size={15} /></button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 font-sans font-semibold text-espresso text-sm">{group.name}</span>
                    <span className="text-[10px] label-stamp text-latte bg-parchment px-2 py-0.5 rounded-full border border-latte shrink-0">
                      {categoriesByGroup[group.name]?.length || 0}
                    </span>
                    <button onClick={() => { setEditingGroup(group.id); setEditGroupName(group.name); }} className="p-1 text-espresso/50 hover:text-espresso rounded">
                      <Edit3 size={15} />
                    </button>
                    <button onClick={() => handleDeleteGroup(group)} className="p-1 text-roast/50 hover:text-red-500 rounded">
                      <Trash2 size={15} />
                    </button>
                  </>
                )}
              </div>
            ))}

            {groups.length === 0 && !addingGroup && (
              <div className="p-6 text-center text-muted-foreground font-serif italic text-sm">
                No hay grupos. Crea el primero.
              </div>
            )}
          </div>

          <p className="text-[10px] text-muted-foreground label-stamp text-center">
            Arrastra ⠿ para cambiar el orden en el menú
          </p>
        </div>

        {/* ———— PANEL DERECHO: Categorías ———— */}
        <div className="xl:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="label-stamp text-roast">Categorías</h2>
            <button
              onClick={() => { setNewCatForm({ name: "", slug: "", group: groupNames[0] || "General", is_visible: true }); setAddingCat(true); }}
              className="flex items-center gap-2 bg-espresso text-cream px-4 py-2 rounded-md hover:bg-roast transition-colors label-stamp text-[10px]"
            >
              <Plus size={14} /> Nueva categoría
            </button>
          </div>

          {addingCat && (
            <div className="menu-card p-5 bg-botanical/5 space-y-4">
              <h3 className="label-stamp text-botanical text-[10px] flex items-center gap-2"><Plus size={12} /> Nueva categoría</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] label-stamp text-latte">Nombre</label>
                  <input
                    autoFocus
                    className="w-full bg-cream border border-latte px-3 py-2 rounded text-sm outline-none focus:border-espresso"
                    value={newCatForm.name}
                    onChange={e => setNewCatForm({ ...newCatForm, name: e.target.value })}
                    placeholder="Ej: Cafetería Caliente"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] label-stamp text-latte">Grupo</label>
                  <select
                    className="w-full bg-cream border border-latte px-3 py-2 rounded text-sm outline-none focus:border-espresso"
                    value={newCatForm.group}
                    onChange={e => setNewCatForm({ ...newCatForm, group: e.target.value })}
                  >
                    {groupNames.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <FontPicker 
                    label="Tipografía"
                    value={newCatForm.font_family}
                    onChange={val => setNewCatForm({ ...newCatForm, font_family: val })}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button onClick={() => setAddingCat(false)} className="px-4 py-2 text-sm font-serif italic text-muted-foreground hover:text-espresso">Cancelar</button>
                <button onClick={handleAddCat} className="flex items-center gap-2 bg-espresso text-cream px-5 py-2 rounded-md label-stamp text-[10px] hover:bg-roast">
                  <Save size={14} /> Crear
                </button>
              </div>
            </div>
          )}

          {/* Categorías en el orden de los grupos */}
          {groups.map(group => {
            const cats = categoriesByGroup[group.name] || [];
            return (
              <div key={group.id} className="space-y-2">
                <div className="flex items-center gap-2 px-1">
                  <FolderTree size={12} className="text-roast" />
                  <span className="label-stamp text-roast text-[10px]">{group.name}</span>
                  <div className="h-px flex-1 bg-latte/30" />
                  <span className="text-[9px] label-stamp text-latte">{cats.length} categorías</span>
                </div>

                <div className="menu-card overflow-hidden divide-y divide-latte/20">
                  {cats.length === 0 && (
                    <div className="p-4 text-center text-xs text-muted-foreground font-serif italic">
                      Sin categorías asignadas
                    </div>
                  )}
                  {cats.map(cat => (
                    <div
                      key={cat.id}
                      draggable
                      onDragStart={() => { dragCat.current = cat.id; }}
                      onDragEnter={() => { dragOverCat.current = cat.id; }}
                      onDragEnd={() => handleDropCat(group.name)}
                      onDragOver={e => e.preventDefault()}
                      className={`flex items-center gap-3 px-4 py-3 hover:bg-parchment/30 transition-colors cursor-default ${!cat.is_visible ? "opacity-50" : ""}`}
                    >
                      <GripVertical size={16} className="text-latte shrink-0 cursor-grab active:cursor-grabbing" />

                      {editingCatId === cat.id ? (
                        <>
                          <input
                            autoFocus
                            className="flex-1 bg-cream border border-latte px-2 py-1.5 rounded text-sm font-semibold outline-none focus:border-espresso"
                            value={editCatForm.name}
                            onChange={e => setEditCatForm({ ...editCatForm, name: e.target.value })}
                          />
                          <select
                            className="bg-cream border border-latte px-2 py-1.5 rounded text-xs outline-none focus:border-espresso"
                            value={editCatForm.group}
                            onChange={e => setEditCatForm({ ...editCatForm, group: e.target.value })}
                          >
                            {groupNames.map(g => <option key={g} value={g}>{g}</option>)}
                          </select>
                          <div className="w-40">
                            <FontPicker 
                              value={editCatForm.font_family}
                              onChange={val => setEditCatForm({ ...editCatForm, font_family: val })}
                            />
                          </div>
                          <button onClick={() => handleSaveCat(cat.id)} className="p-1.5 text-botanical hover:bg-botanical/10 rounded shrink-0"><Save size={16} /></button>
                          <button onClick={() => setEditingCatId(null)} className="p-1.5 text-roast hover:bg-roast/10 rounded shrink-0"><X size={16} /></button>
                        </>
                      ) : (
                        <>
                          <div className="flex-1 min-w-0">
                            <span className="font-sans font-semibold text-espresso text-sm truncate block">{cat.name}</span>
                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{cat.slug}</span>
                          </div>
                          <button
                            onClick={() => toggleVisibility(cat)}
                            className={`p-1.5 rounded-full shrink-0 transition-colors ${cat.is_visible ? "text-botanical hover:bg-botanical/10" : "text-roast hover:bg-roast/10"}`}
                          >
                            {cat.is_visible ? <Eye size={16} /> : <EyeOff size={16} />}
                          </button>
                          <button
                            onClick={() => { setEditingCatId(cat.id); setEditCatForm({ name: cat.name, slug: cat.slug, group: cat.group || "General", is_visible: cat.is_visible !== false, font_family: cat.font_family || "" }); }}
                            className="p-1.5 text-espresso/50 hover:text-espresso rounded shrink-0"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button onClick={() => handleDeleteCat(cat)} className="p-1.5 text-roast/50 hover:text-red-500 rounded shrink-0">
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {!loading && categories.length === 0 && <div className="p-12 text-center text-muted-foreground font-serif italic">No hay categorías todavía.</div>}
        </div>
      </div>

      <ConfirmModal
        isOpen={confirm.open}
        title={confirm.title}
        message={confirm.message}
        confirmLabel="Sí, continuar"
        variant="danger"
        onConfirm={confirm.onConfirm}
        onCancel={() => setConfirm({ ...confirm, open: false })}
      />
    </div>
  );
}
