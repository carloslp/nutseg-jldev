'use client';

import React, { useState } from 'react';
import { FoodCatalogItem, AllergenTag } from '@/lib/types/clinical';

const SMAE_GROUPS: { id: string; name: string; color: string }[] = [
  { id: 'all', name: 'Todos los grupos', color: 'bg-surface-container text-on-surface' },
  { id: 'aoa', name: 'AOA (Proteína)', color: 'bg-rose-50 text-rose-800 border-rose-200' },
  { id: 'cereals', name: 'Cereales y Tubérculos', color: 'bg-amber-50 text-amber-800 border-amber-200' },
  { id: 'legumes', name: 'Leguminosas', color: 'bg-orange-50 text-orange-800 border-orange-200' },
  { id: 'vegetables', name: 'Verduras', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  { id: 'fruits', name: 'Frutas', color: 'bg-cyan-50 text-cyan-800 border-cyan-200' },
  { id: 'fats', name: 'Aceites y Grasas', color: 'bg-yellow-50 text-yellow-800 border-yellow-200' },
  { id: 'milk', name: 'Lácteos / Bebidas', color: 'bg-indigo-50 text-indigo-800 border-indigo-200' },
];

const ALLERGEN_OPTIONS: AllergenTag[] = [
  'lactose',
  'gluten',
  'tree_nuts',
  'peanuts',
  'shellfish',
  'fish',
  'egg',
  'soy',
];

interface FoodCatalogManagerProps {
  initialFoods: FoodCatalogItem[];
}

export function FoodCatalogManager({ initialFoods }: FoodCatalogManagerProps) {
  const [foods, setFoods] = useState<FoodCatalogItem[]>(initialFoods);
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFood, setEditingFood] = useState<FoodCatalogItem | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedNotice, setSeedNotice] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [smaeGroup, setSmaeGroup] = useState<FoodCatalogItem['smaeGroup']>('aoa');
  const [portionQty, setPortionQty] = useState('1');
  const [portionUnit, setPortionUnit] = useState('pieza');
  const [gramsNet, setGramsNet] = useState('100');
  const [kcal, setKcal] = useState('40');
  const [proteinG, setProteinG] = useState('7');
  const [fatG, setFatG] = useState('1');
  const [carbsG, setCarbsG] = useState('0');
  const [selectedAllergens, setSelectedAllergens] = useState<AllergenTag[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredFoods = foods.filter((f) => {
    const matchesGroup = selectedGroup === 'all' || f.smaeGroup === selectedGroup;
    const matchesSearch =
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.portionUnit.toLowerCase().includes(search.toLowerCase());
    return matchesGroup && matchesSearch;
  });

  const openNewModal = () => {
    setEditingFood(null);
    setName('');
    setSmaeGroup('aoa');
    setPortionQty('1');
    setPortionUnit('porción');
    setGramsNet('100');
    setKcal('40');
    setProteinG('7');
    setFatG('1');
    setCarbsG('0');
    setSelectedAllergens([]);
    setIsModalOpen(true);
  };

  const openEditModal = (food: FoodCatalogItem) => {
    setEditingFood(food);
    setName(food.name);
    setSmaeGroup(food.smaeGroup);
    setPortionQty(String(food.portionQty));
    setPortionUnit(food.portionUnit);
    setGramsNet(String(food.gramsNet));
    setKcal(String(food.kcal));
    setProteinG(String(food.proteinG));
    setFatG(String(food.fatG));
    setCarbsG(String(food.carbsG));
    setSelectedAllergens(food.allergenTags || []);
    setIsModalOpen(true);
  };

  const toggleAllergen = (tag: AllergenTag) => {
    setSelectedAllergens((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingFood) {
        // Edit
        const res = await fetch(`/api/admin/alimentos/${editingFood.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            smaeGroup,
            portionQty: parseFloat(portionQty),
            portionUnit,
            gramsNet: parseFloat(gramsNet),
            kcal: parseFloat(kcal),
            proteinG: parseFloat(proteinG),
            fatG: parseFloat(fatG),
            carbsG: parseFloat(carbsG),
            allergenTags: selectedAllergens,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error al actualizar');
        setFoods((prev) => prev.map((f) => (f.id === data.food.id ? data.food : f)));
      } else {
        // Create
        const res = await fetch('/api/admin/alimentos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            smaeGroup,
            portionQty: parseFloat(portionQty),
            portionUnit,
            gramsNet: parseFloat(gramsNet),
            kcal: parseFloat(kcal),
            proteinG: parseFloat(proteinG),
            fatG: parseFloat(fatG),
            carbsG: parseFloat(carbsG),
            allergenTags: selectedAllergens,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error al crear');
        setFoods((prev) => [data.food, ...prev]);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      alert(err.message || 'Error al guardar alimento');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, foodName: string) => {
    if (!confirm(`¿Eliminar "${foodName}" del catálogo?`)) return;

    try {
      const res = await fetch(`/api/admin/alimentos/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setFoods((prev) => prev.filter((f) => f.id !== id));
      } else {
        alert('Error al eliminar');
      }
    } catch {
      alert('Error de conexión');
    }
  };

  const handleSeed = async () => {
    if (!confirm('¿Sincronizar el catálogo base con más de 50 alimentos estándar del SMAE?')) return;
    setIsSeeding(true);
    setSeedNotice(null);

    try {
      const res = await fetch('/api/admin/seed?force=true', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setSeedNotice(`Catálogo sincronizado exitosamente: ${data.foodsCount} alimentos y ${data.exercisesCount} ejercicios.`);
        // Refresh food list
        const refreshed = await fetch('/api/admin/alimentos');
        const refreshedData = await refreshed.json();
        if (refreshedData.foods) setFoods(refreshedData.foods);
      } else {
        alert(data.error || 'Error al ejecutar seed');
      }
    } catch {
      alert('Error de conexión al sincronizar');
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-on-surface">Catálogo de Alimentos SMAE</h1>
          <p className="text-xs text-on-surface-variant">
            Sistema Mexicano de Alimentos Equivalentes • Base de cálculo y exclusión de alérgenos
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSeed}
            disabled={isSeeding}
            className="px-3.5 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold transition-all flex items-center gap-2 disabled:opacity-50"
            title="Sincronizar base de datos SMAE"
          >
            <span className="material-symbols-outlined text-[17px]">sync</span>
            <span>{isSeeding ? 'Sincronizando...' : 'Restaurar SMAE Base'}</span>
          </button>

          <button
            onClick={openNewModal}
            className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-container text-on-primary text-xs font-semibold transition-all shadow-sm flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>+ Nuevo Alimento</span>
          </button>
        </div>
      </div>

      {seedNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          <span>{seedNotice}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-4 bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-xs space-y-3">
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar alimento o platillo por nombre..."
            className="w-full px-3.5 py-2 pl-9 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-on-surface-variant">
            search
          </span>
        </div>

        {/* Group Chips */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {SMAE_GROUPS.map((g) => (
            <button
              key={g.id}
              onClick={() => setSelectedGroup(g.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                selectedGroup === g.id
                  ? 'bg-primary text-on-primary font-semibold shadow-xs'
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
              }`}
            >
              {g.name}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-container-low/70 border-b border-outline-variant/20 text-on-surface-variant font-semibold">
              <tr>
                <th className="py-3 px-4">Alimento</th>
                <th className="py-3 px-4">Grupo SMAE</th>
                <th className="py-3 px-4">Porción</th>
                <th className="py-3 px-4 text-right">Energía</th>
                <th className="py-3 px-4 text-center">P / G / C (g)</th>
                <th className="py-3 px-4">Alérgenos</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/15">
              {filteredFoods.map((f) => (
                <tr key={f.id} className="hover:bg-surface-container-low/40 transition-colors">
                  <td className="py-3 px-4 font-semibold text-on-surface">{f.name}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface text-[10px] font-semibold uppercase">
                      {f.smaeGroup}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-on-surface-variant font-mono">
                    {f.portionQty} {f.portionUnit} ({f.gramsNet}g)
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-on-surface">
                    {f.kcal} kcal
                  </td>
                  <td className="py-3 px-4 text-center font-mono text-[11px] text-on-surface-variant">
                    <span className="text-primary font-semibold">{f.proteinG}P</span> /{' '}
                    <span className="text-amber-700">{f.fatG}G</span> /{' '}
                    <span className="text-emerald-700">{f.carbsG}C</span>
                  </td>
                  <td className="py-3 px-4">
                    {f.allergenTags && f.allergenTags.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {f.allergenTags.map((tag) => (
                          <span
                            key={tag}
                            className="px-1.5 py-0.5 rounded-md bg-rose-50 text-rose-700 text-[10px] font-medium border border-rose-200"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[11px] text-on-surface-variant/50">Ninguno</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEditModal(f)}
                        className="p-1 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
                        title="Editar"
                      >
                        <span className="material-symbols-outlined text-[17px]">edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(f.id, f.name)}
                        className="p-1 rounded-lg text-rose-600 hover:text-rose-800 hover:bg-rose-50"
                        title="Eliminar"
                      >
                        <span className="material-symbols-outlined text-[17px]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add/Edit Food */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface-container-lowest rounded-2xl w-full max-w-lg border border-outline-variant/30 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
              <h2 className="font-display font-bold text-base text-on-surface">
                {editingFood ? 'Editar Alimento SMAE' : 'Agregar Alimento SMAE'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">Nombre del Alimento *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. Salmón a la plancha"
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs text-on-surface"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">Grupo SMAE *</label>
                  <select
                    value={smaeGroup}
                    onChange={(e) => setSmaeGroup(e.target.value as any)}
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs text-on-surface"
                  >
                    <option value="aoa">AOA (Origen Animal)</option>
                    <option value="cereals">Cereales y Tubérculos</option>
                    <option value="legumes">Leguminosas</option>
                    <option value="vegetables">Verduras</option>
                    <option value="fruits">Frutas</option>
                    <option value="fats">Aceites y Grasas</option>
                    <option value="milk">Lácteos / Bebidas</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">Calorías (kcal) *</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={kcal}
                    onChange={(e) => setKcal(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs text-on-surface font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">Cant. Porción *</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={portionQty}
                    onChange={(e) => setPortionQty(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs text-on-surface font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">Unidad *</label>
                  <input
                    type="text"
                    required
                    value={portionUnit}
                    onChange={(e) => setPortionUnit(e.target.value)}
                    placeholder="taza / g / pieza"
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs text-on-surface"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">Gramos Netos</label>
                  <input
                    type="number"
                    step="1"
                    value={gramsNet}
                    onChange={(e) => setGramsNet(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs text-on-surface font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">Proteína (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={proteinG}
                    onChange={(e) => setProteinG(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs text-on-surface font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">Grasa (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={fatG}
                    onChange={(e) => setFatG(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs text-on-surface font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">Carbohidratos (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={carbsG}
                    onChange={(e) => setCarbsG(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs text-on-surface font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1.5">
                  Etiquetas de Alérgenos
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {ALLERGEN_OPTIONS.map((tag) => {
                    const isSelected = selectedAllergens.includes(tag);
                    return (
                      <button
                        type="button"
                        key={tag}
                        onClick={() => toggleAllergen(tag)}
                        className={`px-2 py-1 rounded-lg text-xs font-medium border transition-colors ${
                          isSelected
                            ? 'bg-rose-50 border-rose-300 text-rose-800'
                            : 'bg-surface-container-low border-outline-variant/30 text-on-surface-variant'
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-outline-variant/20 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-on-surface-variant hover:bg-surface-container"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-container text-on-primary text-xs font-semibold transition-all shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? 'Guardando...' : editingFood ? 'Actualizar Alimento' : 'Guardar Alimento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
