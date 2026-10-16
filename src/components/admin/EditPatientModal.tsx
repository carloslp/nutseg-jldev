'use client';

import React, { useState } from 'react';
import { ClientProfile, BiologicalSex, ClinicalFlag, AllergenTag } from '@/lib/types/clinical';

interface EditPatientModalProps {
  client: ClientProfile;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: (client: ClientProfile) => void;
}

export function EditPatientModal({ client, isOpen, onClose, onUpdated }: EditPatientModalProps) {
  const [fullName, setFullName] = useState(client.fullName);
  const [birthDate, setBirthDate] = useState(client.birthDate);
  const [sex, setSex] = useState<BiologicalSex>(client.sex);
  const [heightCm, setHeightCm] = useState(String(client.heightCm));
  const [phoneWhatsapp, setPhoneWhatsapp] = useState(client.phoneWhatsapp || client.phone || '');
  const [email, setEmail] = useState(client.email || '');
  const [selectedFlags, setSelectedFlags] = useState<ClinicalFlag[]>(client.clinicalFlags || []);
  const [selectedAllergies, setSelectedAllergies] = useState<AllergenTag[]>(client.allergies || []);
  const [notes, setNotes] = useState(client.notes || '');
  const [isActive, setIsActive] = useState(client.isActive !== false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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
      const res = await fetch(`/api/admin/pacientes/${client.id}`, {
        method: 'PUT',
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
          isActive,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al actualizar expediente');

      onUpdated(data.client);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al guardar cambios');
    } finally {
      setIsSubmitting(false);
    }
  };

  const clinicalFlagsList: { id: ClinicalFlag; label: string }[] = [
    { id: 'diabetes_type_2', label: 'Diabetes Tipo 2' },
    { id: 'hypertension', label: 'Hipertensión Arterial' },
    { id: 'pregnancy', label: 'Embarazo en Curso' },
    { id: 'renal_pathology', label: 'Patología Renal / ERC' },
    { id: 'eating_disorder_hx', label: 'Historial de TCA' },
    { id: 'knee_injury', label: 'Lesión Articular Rodilla' },
    { id: 'shoulder_injury', label: 'Lesión Articular Hombro' },
    { id: 'lower_back_injury', label: 'Lesión Lumbar / Espalda' },
  ];

  const allergensList: { id: AllergenTag; label: string }[] = [
    { id: 'lactose', label: 'Lactosa / Lácteos' },
    { id: 'gluten', label: 'Gluten / Trigo' },
    { id: 'tree_nuts', label: 'Frutos Secos (Nueces/Almendras)' },
    { id: 'peanuts', label: 'Cacahuates' },
    { id: 'shellfish', label: 'Mariscos / Crustáceos' },
    { id: 'fish', label: 'Pescados' },
    { id: 'egg', label: 'Huevo' },
    { id: 'soy', label: 'Soya' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-surface-container-lowest rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto border border-outline-variant/30 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-outline-variant/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">edit_note</span>
            </div>
            <div>
              <h2 className="font-display font-bold text-lg text-on-surface">Editar Ficha del Paciente</h2>
              <p className="text-xs text-on-surface-variant">Actualización de datos base, banderas rojas y restricciones</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Form Body */}
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
                className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs text-on-surface font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1">Sexo Biológico *</label>
              <select
                value={sex}
                onChange={(e) => setSex(e.target.value as BiologicalSex)}
                className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs text-on-surface"
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
                className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs text-on-surface font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1">Teléfono / WhatsApp</label>
              <input
                type="text"
                value={phoneWhatsapp}
                onChange={(e) => setPhoneWhatsapp(e.target.value)}
                className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs text-on-surface font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1">Correo Electrónico</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs text-on-surface"
              />
            </div>
          </div>

          {/* Status Toggle */}
          <div className="flex items-center gap-3 p-3 bg-surface-container-low rounded-xl border border-outline-variant/20">
            <input
              type="checkbox"
              id="isActiveCheck"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 text-primary rounded"
            />
            <label htmlFor="isActiveCheck" className="text-xs font-semibold text-on-surface cursor-pointer">
              Expediente activo (en seguimiento regular)
            </label>
          </div>

          {/* Clinical Flags */}
          <div>
            <label className="block text-xs font-semibold text-on-surface mb-1.5 flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-amber-600">flag</span>
              <span>Banderas Rojas Clínicas (Triage Médico)</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {clinicalFlagsList.map((f) => {
                const isSelected = selectedFlags.includes(f.id);
                return (
                  <button
                    type="button"
                    key={f.id}
                    onClick={() => toggleFlag(f.id)}
                    className={`flex items-center gap-2 p-2 rounded-xl text-xs font-medium border text-left transition-all ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500/40 text-amber-700'
                        : 'bg-surface-container-low border-outline-variant/20 text-on-surface-variant hover:bg-surface-container'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {isSelected ? 'check_box' : 'check_box_outline_blank'}
                    </span>
                    <span>{f.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Allergens */}
          <div>
            <label className="block text-xs font-semibold text-on-surface mb-1.5 flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-rose-600">no_food</span>
              <span>Alergias e Intolerancias (Exclusión Estricta SMAE)</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {allergensList.map((a) => {
                const isSelected = selectedAllergies.includes(a.id);
                return (
                  <button
                    type="button"
                    key={a.id}
                    onClick={() => toggleAllergy(a.id)}
                    className={`flex items-center gap-1.5 p-2 rounded-xl text-xs font-medium border text-left transition-all ${
                      isSelected
                        ? 'bg-rose-500/10 border-rose-500/40 text-rose-700'
                        : 'bg-surface-container-low border-outline-variant/20 text-on-surface-variant hover:bg-surface-container'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[15px]">
                      {isSelected ? 'check_circle' : 'radio_button_unchecked'}
                    </span>
                    <span className="truncate">{a.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-on-surface mb-1">Notas Clínicas Adicionales</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs text-on-surface"
            />
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-outline-variant/20 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-on-surface-variant hover:bg-surface-container"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-container text-on-primary text-xs font-semibold transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
