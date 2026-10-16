'use client';

import React, { useState } from 'react';
import { ExerciseCatalogItem, EquipmentType } from '@/lib/types/clinical';

const PATTERNS: { id: string; name: string }[] = [
  { id: 'all', name: 'Todos los patrones' },
  { id: 'squat', name: 'Squat (Rodilla)' },
  { id: 'hinge', name: 'Hinge (Cadera)' },
  { id: 'push_h', name: 'Push Horizontal' },
  { id: 'push_v', name: 'Push Vertical' },
  { id: 'pull_h', name: 'Pull Horizontal' },
  { id: 'pull_v', name: 'Pull Vertical' },
  { id: 'core', name: 'Core & Estabilidad' },
  { id: 'arms', name: 'Brazos / Accesorios' },
];

const EQUIPMENT_OPTIONS: { id: string; name: string }[] = [
  { id: 'all', name: 'Cualquier equipo' },
  { id: 'gym', name: 'Gimnasio completo' },
  { id: 'dumbbells', name: 'Mancuernas' },
  { id: 'bodyweight', name: 'Peso corporal' },
  { id: 'machine', name: 'Máquinas guiadas' },
  { id: 'bands', name: 'Bandas elásticas' },
];

const JOINT_STRESS_OPTIONS: ('knee' | 'shoulder' | 'lower_back' | 'wrist')[] = [
  'knee',
  'shoulder',
  'lower_back',
  'wrist',
];

interface ExerciseCatalogManagerProps {
  initialExercises: ExerciseCatalogItem[];
}

export function ExerciseCatalogManager({ initialExercises }: ExerciseCatalogManagerProps) {
  const [exercises, setExercises] = useState<ExerciseCatalogItem[]>(initialExercises);
  const [selectedPattern, setSelectedPattern] = useState('all');
  const [selectedEquipment, setSelectedEquipment] = useState('all');
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState<ExerciseCatalogItem | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedNotice, setSeedNotice] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [movementPattern, setMovementPattern] = useState<ExerciseCatalogItem['movementPattern']>('squat');
  const [primaryMuscle, setPrimaryMuscle] = useState('Cuádriceps');
  const [equipmentRequired, setEquipmentRequired] = useState<EquipmentType | 'bands'>('dumbbells');
  const [difficulty, setDifficulty] = useState<ExerciseCatalogItem['difficulty']>('intermediate');
  const [jointStressTags, setJointStressTags] = useState<('knee' | 'shoulder' | 'lower_back' | 'wrist')[]>([]);
  const [defaultSets, setDefaultSets] = useState('3');
  const [defaultReps, setDefaultReps] = useState('10-12');
  const [defaultRestSec, setDefaultRestSec] = useState('90');
  const [instructions, setInstructions] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredExercises = exercises.filter((ex) => {
    const matchesPattern = selectedPattern === 'all' || ex.movementPattern === selectedPattern;
    const matchesEquipment = selectedEquipment === 'all' || ex.equipmentRequired === selectedEquipment;
    const matchesSearch =
      ex.name.toLowerCase().includes(search.toLowerCase()) ||
      ex.primaryMuscle.toLowerCase().includes(search.toLowerCase());
    return matchesPattern && matchesEquipment && matchesSearch;
  });

  const openNewModal = () => {
    setEditingExercise(null);
    setName('');
    setMovementPattern('squat');
    setPrimaryMuscle('Cuádriceps');
    setEquipmentRequired('dumbbells');
    setDifficulty('intermediate');
    setJointStressTags([]);
    setDefaultSets('3');
    setDefaultReps('10-12');
    setDefaultRestSec('90');
    setInstructions('');
    setVideoUrl('');
    setIsModalOpen(true);
  };

  const openEditModal = (ex: ExerciseCatalogItem) => {
    setEditingExercise(ex);
    setName(ex.name);
    setMovementPattern(ex.movementPattern);
    setPrimaryMuscle(ex.primaryMuscle);
    setEquipmentRequired(ex.equipmentRequired);
    setDifficulty(ex.difficulty);
    setJointStressTags(ex.jointStressTags || []);
    setDefaultSets(String(ex.defaultSets));
    setDefaultReps(ex.defaultReps);
    setDefaultRestSec(String(ex.defaultRestSec));
    setInstructions(ex.instructions || '');
    setVideoUrl(ex.videoUrl || '');
    setIsModalOpen(true);
  };

  const toggleJointTag = (tag: 'knee' | 'shoulder' | 'lower_back' | 'wrist') => {
    setJointStressTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingExercise) {
        const res = await fetch(`/api/admin/ejercicios/${editingExercise.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            movementPattern,
            primaryMuscle,
            equipmentRequired,
            difficulty,
            jointStressTags,
            defaultSets: parseInt(defaultSets, 10),
            defaultReps,
            defaultRestSec: parseInt(defaultRestSec, 10),
            instructions: instructions.trim() || undefined,
            videoUrl: videoUrl.trim() || undefined,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error al actualizar');
        setExercises((prev) => prev.map((item) => (item.id === data.exercise.id ? data.exercise : item)));
      } else {
        const res = await fetch('/api/admin/ejercicios', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            movementPattern,
            primaryMuscle,
            equipmentRequired,
            difficulty,
            jointStressTags,
            defaultSets: parseInt(defaultSets, 10),
            defaultReps,
            defaultRestSec: parseInt(defaultRestSec, 10),
            instructions: instructions.trim() || undefined,
            videoUrl: videoUrl.trim() || undefined,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error al crear');
        setExercises((prev) => [data.exercise, ...prev]);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      alert(err.message || 'Error al guardar ejercicio');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, exName: string) => {
    if (!confirm(`¿Eliminar "${exName}" del catálogo biomecánico?`)) return;

    try {
      const res = await fetch(`/api/admin/ejercicios/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setExercises((prev) => prev.filter((e) => e.id !== id));
      } else {
        alert('Error al eliminar');
      }
    } catch {
      alert('Error de conexión');
    }
  };

  const handleSeed = async () => {
    if (!confirm('¿Sincronizar el catálogo base con más de 40 ejercicios biomecánicos?')) return;
    setIsSeeding(true);
    setSeedNotice(null);

    try {
      const res = await fetch('/api/admin/seed?force=true', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setSeedNotice(`Catálogo biomecánico sincronizado exitosamente: ${data.exercisesCount} ejercicios.`);
        const refreshed = await fetch('/api/admin/ejercicios');
        const refreshedData = await refreshed.json();
        if (refreshedData.exercises) setExercises(refreshedData.exercises);
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
          <h1 className="font-display text-2xl font-bold text-on-surface">Catálogo Biomecánico de Ejercicios</h1>
          <p className="text-xs text-on-surface-variant">
            Patrones de movimiento, equipamiento y prevención de estrés articular en rodilla, hombro y columna
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSeed}
            disabled={isSeeding}
            className="px-3.5 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[17px]">sync</span>
            <span>{isSeeding ? 'Sincronizando...' : 'Restaurar Ejercicios Base'}</span>
          </button>

          <button
            onClick={openNewModal}
            className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-container text-on-primary text-xs font-semibold transition-all shadow-sm flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>+ Nuevo Ejercicio</span>
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
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar ejercicio o grupo muscular..."
              className="w-full px-3.5 py-2 pl-9 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-on-surface-variant">
              search
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-on-surface-variant font-medium">Equipo:</span>
            <select
              value={selectedEquipment}
              onChange={(e) => setSelectedEquipment(e.target.value)}
              className="px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs text-on-surface"
            >
              {EQUIPMENT_OPTIONS.map((eq) => (
                <option key={eq.id} value={eq.id}>
                  {eq.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Pattern Chips */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {PATTERNS.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedPattern(p.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                selectedPattern === p.id
                  ? 'bg-primary text-on-primary font-semibold shadow-xs'
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
              }`}
            >
              {p.name}
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
                <th className="py-3 px-4">Ejercicio</th>
                <th className="py-3 px-4">Patrón</th>
                <th className="py-3 px-4">Equipo</th>
                <th className="py-3 px-4">Series / Reps</th>
                <th className="py-3 px-4">Estrés Articular</th>
                <th className="py-3 px-4 text-center">Video Demo</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/15">
              {filteredExercises.map((ex) => (
                <tr key={ex.id} className="hover:bg-surface-container-low/40 transition-colors">
                  <td className="py-3 px-4">
                    <p className="font-semibold text-on-surface">{ex.name}</p>
                    <p className="text-[11px] text-on-surface-variant">{ex.primaryMuscle}</p>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface text-[10px] font-semibold uppercase">
                      {ex.movementPattern}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-on-surface-variant capitalize">
                    {ex.equipmentRequired}
                  </td>
                  <td className="py-3 px-4 text-on-surface-variant font-mono">
                    {ex.defaultSets} × {ex.defaultReps} ({ex.defaultRestSec}s)
                  </td>
                  <td className="py-3 px-4">
                    {ex.jointStressTags && ex.jointStressTags.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {ex.jointStressTags.map((tag) => (
                          <span
                            key={tag}
                            className="px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[10px] font-medium border border-amber-200"
                          >
                            ⚠️ {tag}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[10px] font-medium border border-emerald-200">
                        ✓ Safe Articular
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {ex.videoUrl ? (
                      <a
                        href={ex.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-primary hover:underline text-[11px] font-medium"
                      >
                        <span className="material-symbols-outlined text-[16px]">play_circle</span>
                        <span>Ver Demo</span>
                      </a>
                    ) : (
                      <span className="text-[11px] text-on-surface-variant/40">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEditModal(ex)}
                        className="p-1 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
                        title="Editar"
                      >
                        <span className="material-symbols-outlined text-[17px]">edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(ex.id, ex.name)}
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

      {/* Modal Add/Edit Exercise */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface-container-lowest rounded-2xl w-full max-w-lg border border-outline-variant/30 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
              <h2 className="font-display font-bold text-base text-on-surface">
                {editingExercise ? 'Editar Ejercicio Biomecánico' : 'Agregar Nuevo Ejercicio'}
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
                <label className="block text-xs font-semibold text-on-surface mb-1">Nombre del Ejercicio *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. Press de Banca Plano con Mancuernas"
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs text-on-surface"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">Patrón de Movimiento *</label>
                  <select
                    value={movementPattern}
                    onChange={(e) => setMovementPattern(e.target.value as any)}
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs text-on-surface"
                  >
                    <option value="squat">Squat (Dominante Rodilla)</option>
                    <option value="hinge">Hinge (Bisagra Cadera)</option>
                    <option value="push_h">Push Horizontal</option>
                    <option value="push_v">Push Vertical</option>
                    <option value="pull_h">Pull Horizontal</option>
                    <option value="pull_v">Pull Vertical</option>
                    <option value="core">Core & Anti-movimiento</option>
                    <option value="arms">Brazos / Accesorios</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">Músculo Principal</label>
                  <input
                    type="text"
                    value={primaryMuscle}
                    onChange={(e) => setPrimaryMuscle(e.target.value)}
                    placeholder="Ej. Pectoral Mayor"
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs text-on-surface"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">Equipamiento *</label>
                  <select
                    value={equipmentRequired}
                    onChange={(e) => setEquipmentRequired(e.target.value as any)}
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs text-on-surface"
                  >
                    <option value="gym">Gimnasio Completo</option>
                    <option value="dumbbells">Mancuernas</option>
                    <option value="bodyweight">Peso Corporal</option>
                    <option value="machine">Máquinas Guiadas</option>
                    <option value="bands">Bandas Elásticas</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">Dificultad</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as any)}
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs text-on-surface"
                  >
                    <option value="beginner">Principiante</option>
                    <option value="intermediate">Intermedio</option>
                    <option value="advanced">Avanzado</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">Series</label>
                  <input
                    type="number"
                    value={defaultSets}
                    onChange={(e) => setDefaultSets(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs text-on-surface font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">Repeticiones</label>
                  <input
                    type="text"
                    value={defaultReps}
                    onChange={(e) => setDefaultReps(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs text-on-surface font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">Descanso (seg)</label>
                  <input
                    type="number"
                    value={defaultRestSec}
                    onChange={(e) => setDefaultRestSec(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs text-on-surface font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1.5">
                  Articulaciones con Carga / Estrés Biomecánico
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {JOINT_STRESS_OPTIONS.map((tag) => {
                    const isSelected = jointStressTags.includes(tag);
                    return (
                      <button
                        type="button"
                        key={tag}
                        onClick={() => toggleJointTag(tag)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                          isSelected
                            ? 'bg-amber-50 border-amber-300 text-amber-800'
                            : 'bg-surface-container-low border-outline-variant/30 text-on-surface-variant'
                        }`}
                      >
                        ⚠️ {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">URL de Video Demostrativo</label>
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs text-on-surface"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">Instrucciones Biomecánicas</label>
                <textarea
                  rows={2}
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="Claves de ejecución y seguridad articular..."
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs text-on-surface"
                />
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
                  {isSubmitting ? 'Guardando...' : editingExercise ? 'Actualizar Ejercicio' : 'Guardar Ejercicio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
