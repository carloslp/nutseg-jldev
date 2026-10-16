'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BiologicalSex, ClinicalFlag, AllergenTag } from '@/lib/types/clinical';

interface NewPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewPatientModal({ isOpen, onClose }: NewPatientModalProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form state
  const [fullName, setFullName] = useState('');
  const [birthDate, setBirthDate] = useState('1995-06-15');
  const [sex, setSex] = useState<BiologicalSex>('male');
  const [heightCm, setHeightCm] = useState('175');
  const [phoneWhatsapp, setPhoneWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [selectedFlags, setSelectedFlags] = useState<ClinicalFlag[]>([]);
  const [selectedAllergies, setSelectedAllergies] = useState<AllergenTag[]>([]);
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const toggleFlag = (flag: ClinicalFlag) => {
    setSelectedFlags((prev) =>
      prev.includes(flag) ? prev.filter((f) => f !== flag) : [...prev, flag]
    );
  };

  const toggleAllergy = (allergy: AllergenTag) => {
    setSelectedAllergies((prev) =>
      prev.includes(allergy) ? prev.filter((a) => a !== allergy) : [...prev, allergy]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/admin/pacientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          birthDate,
          sex,
          heightCm: parseFloat(heightCm),
          phoneWhatsapp: phoneWhatsapp.trim() || undefined,
          email: email.trim() || undefined,
          clinicalFlags: selectedFlags,
          allergies: selectedAllergies,
          notes: notes.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al crear el paciente');
      }

      onClose();
      router.push(`/admin/pacientes/${data.client.id}`);
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al guardar');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-surface-container-lowest rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto border border-outline-variant/30 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-outline-variant/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">person_add</span>
            </div>
            <div>
              <h2 className="font-display font-bold text-lg text-on-surface">Registrar Nuevo Paciente</h2>
              <p className="text-xs text-on-surface-variant">Alta de expediente base, banderas rojas y triage</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl font-medium">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-on-surface mb-1">Nombre Completo *</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ej. Sofía Ramírez Morales"
              className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1">Fecha de Nacimiento *</label>
              <input
                type="date"
                required
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1">Sexo Biológico *</label>
              <select
                value={sex}
                onChange={(e) => setSex(e.target.value as BiologicalSex)}
                className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="male">Masculino</option>
                <option value="female">Femenino</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1">Estatura (cm) *</label>
              <input
                type="number"
                step="0.5"
                required
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
                className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1">Teléfono / WhatsApp</label>
              <input
                type="tel"
                value={phoneWhatsapp}
                onChange={(e) => setPhoneWhatsapp(e.target.value)}
                placeholder="+52 55 1234 5678"
                className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1">Correo Electrónico</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="paciente@correo.com"
                className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {/* Clinical Flags */}
          <div>
            <label className="block text-xs font-semibold text-on-surface mb-1.5">
              Banderas Rojas Clínicas (Triage de Riesgo)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'diabetes_type_2' as ClinicalFlag, label: 'Diabetes Tipo 2' },
                { id: 'hypertension' as ClinicalFlag, label: 'Hipertensión Arterial' },
                { id: 'pregnancy' as ClinicalFlag, label: 'Embarazo / Lactancia' },
                { id: 'renal_pathology' as ClinicalFlag, label: 'Patología Renal / Creatinina Alta' },
                { id: 'eating_disorder_hx' as ClinicalFlag, label: 'Historial de TCA' },
                { id: 'knee_injury' as ClinicalFlag, label: 'Lesión Articular Rodilla' },
                { id: 'shoulder_injury' as ClinicalFlag, label: 'Lesión Articular Hombro' },
                { id: 'lower_back_injury' as ClinicalFlag, label: 'Lesión Columna Lumbar' },
              ].map((flag) => {
                const isSelected = selectedFlags.includes(flag.id);
                return (
                  <button
                    key={flag.id}
                    type="button"
                    onClick={() => toggleFlag(flag.id)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
                      isSelected
                        ? 'bg-amber-600 text-white shadow-xs font-semibold'
                        : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    {isSelected && '✓ '}
                    {flag.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Allergies */}
          <div>
            <label className="block text-xs font-semibold text-on-surface mb-1.5">
              Restricciones Alimentarias & Alergias
            </label>
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'gluten' as AllergenTag, label: 'Gluten (Celiaquía)' },
                { id: 'lactose' as AllergenTag, label: 'Lactosa' },
                { id: 'shellfish' as AllergenTag, label: 'Mariscos' },
                { id: 'tree_nuts' as AllergenTag, label: 'Nueces de árbol' },
                { id: 'peanuts' as AllergenTag, label: 'Cacahuates' },
                { id: 'soy' as AllergenTag, label: 'Soya' },
                { id: 'egg' as AllergenTag, label: 'Huevo' },
                { id: 'fish' as AllergenTag, label: 'Pescado' },
              ].map((all) => {
                const isSelected = selectedAllergies.includes(all.id);
                return (
                  <button
                    key={all.id}
                    type="button"
                    onClick={() => toggleAllergy(all.id)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
                      isSelected
                        ? 'bg-primary text-on-primary shadow-xs font-semibold'
                        : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    {isSelected && '✓ '}
                    {all.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-on-surface mb-1">Notas Clínicas Iniciales</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Objetivos del paciente, antecedentes familiares, estilo de vida..."
              className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
            ></textarea>
          </div>

          <div className="pt-3 border-t border-outline-variant/20 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-on-surface-variant hover:text-on-surface"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary text-xs font-semibold shadow-sm transition-all active:scale-[0.98] disabled:opacity-50 flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">check</span>
              <span>{isSubmitting ? 'Guardando...' : 'Crear Expediente'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
