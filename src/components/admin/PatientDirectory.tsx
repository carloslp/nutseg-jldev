'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ClientProfile } from '@/lib/types/clinical';
import { NewPatientModal } from './NewPatientModal';
import { EditPatientModal } from './EditPatientModal';

interface PatientDirectoryProps {
  initialClients: ClientProfile[];
}

export function PatientDirectory({ initialClients }: PatientDirectoryProps) {
  const [clients, setClients] = useState<ClientProfile[]>(initialClients);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientProfile | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredClients = clients.filter((c) => {
    const matchesSearch =
      c.fullName.toLowerCase().includes(search.toLowerCase()) ||
      (c.phoneWhatsapp && c.phoneWhatsapp.includes(search)) ||
      (c.email && c.email.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && c.isActive !== false) ||
      (statusFilter === 'inactive' && c.isActive === false);

    return matchesSearch && matchesStatus;
  });

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Estás seguro de eliminar el expediente clínico de "${name}"? Esta acción eliminará también sus check-ins, planes y permalinks asociados.`)) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/pacientes/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setClients((prev) => prev.filter((c) => c.id !== id));
      } else {
        alert('Error al eliminar paciente.');
      }
    } catch (e) {
      console.error('Delete error:', e);
      alert('Error de conexión al eliminar paciente.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-12">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-on-surface">Expedientes de Pacientes</h1>
          <p className="text-xs text-on-surface-variant">
            Seguimiento antropométrico, motor de prescripción y despacho de permalinks
          </p>
        </div>

        <button
          onClick={() => setIsNewModalOpen(true)}
          className="py-2.5 px-4 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-semibold text-xs transition-all shadow-sm flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">person_add</span>
          <span>+ Nuevo Paciente</span>
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-xs">
        <div className="relative flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, teléfono o correo..."
            className="w-full px-3.5 py-2 pl-9 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-on-surface-variant">
            search
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-on-surface-variant font-medium">Estado:</span>
          <div className="flex rounded-xl bg-surface-container-low p-1 border border-outline-variant/30 text-xs font-medium">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                statusFilter === 'all'
                  ? 'bg-primary text-on-primary font-semibold shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Todos ({clients.length})
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                statusFilter === 'active'
                  ? 'bg-primary text-on-primary font-semibold shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Activos ({clients.filter((c) => c.isActive !== false).length})
            </button>
            <button
              onClick={() => setStatusFilter('inactive')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                statusFilter === 'inactive'
                  ? 'bg-primary text-on-primary font-semibold shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Inactivos ({clients.filter((c) => c.isActive === false).length})
            </button>
          </div>
        </div>
      </div>

      {/* Directory Grid */}
      {filteredClients.length === 0 ? (
        <div className="p-12 text-center bg-surface-container-lowest rounded-2xl border border-outline-variant/30">
          <span className="material-symbols-outlined text-[48px] text-outline mb-2">person_search</span>
          <p className="text-sm font-semibold text-on-surface">No se encontraron pacientes</p>
          <p className="text-xs text-on-surface-variant mt-1">
            {search ? 'Intenta con otro término de búsqueda o cambia el filtro de estado.' : 'Comienza registrando tu primer paciente.'}
          </p>
          {!search && (
            <button
              onClick={() => setIsNewModalOpen(true)}
              className="mt-4 px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-semibold hover:bg-primary-container transition-all inline-flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">person_add</span>
              <span>Registrar Paciente</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredClients.map((c) => (
            <div
              key={c.id}
              className="p-6 bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-xs flex flex-col justify-between gap-4 hover:border-primary/50 transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary font-bold text-base flex items-center justify-center">
                    {c.fullName.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                  </div>
                  <div>
                    <h2 className="font-bold text-base text-on-surface">{c.fullName}</h2>
                    <span className="text-xs text-on-surface-variant font-mono">
                      {c.sex === 'male' ? 'Hombre' : 'Mujer'} • {c.heightCm} cm
                    </span>
                    {(c.phoneWhatsapp || c.phone) && (
                      <p className="text-[11px] text-on-surface-variant flex items-center gap-1 mt-0.5">
                        <span className="material-symbols-outlined text-[13px] text-emerald-600">chat</span>
                        <span>{c.phoneWhatsapp || c.phone}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                      c.isActive !== false
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {c.isActive !== false ? 'Activo' : 'Inactivo'}
                  </span>
                  <button
                    onClick={() => setEditingClient(c)}
                    className="p-1 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
                    title="Editar expediente"
                  >
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(c.id, c.fullName)}
                    disabled={deletingId === c.id}
                    className="p-1 rounded-lg text-rose-600 hover:text-rose-800 hover:bg-rose-50 transition-colors disabled:opacity-50"
                    title="Eliminar paciente"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              </div>

              {c.clinicalFlags && c.clinicalFlags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {c.clinicalFlags.map((flag) => (
                    <span
                      key={flag}
                      className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[10px] font-semibold border border-amber-200"
                    >
                      {flag.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              )}

              {c.allergies && c.allergies.length > 0 && (
                <div className="flex items-center gap-1 text-[11px] text-rose-700">
                  <span className="material-symbols-outlined text-[14px]">warning</span>
                  <span className="font-medium">Alergias: {c.allergies.join(', ')}</span>
                </div>
              )}

              <div className="flex items-center gap-2 pt-3 border-t border-outline-variant/15">
                <Link
                  href={`/admin/pacientes/${c.id}`}
                  className="flex-1 py-2 px-3 rounded-xl bg-primary hover:bg-primary-container text-on-primary text-xs font-semibold text-center transition-all shadow-xs"
                >
                  Expediente & Check-ins
                </Link>
                <Link
                  href={`/admin/pacientes/${c.id}/plan`}
                  className="py-2 px-3 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold text-center transition-all"
                >
                  Motor Plan
                </Link>
                <Link
                  href={`/admin/pacientes/${c.id}/permalink`}
                  className="py-2 px-3 rounded-xl bg-surface-container hover:bg-surface-container-high text-secondary text-xs font-semibold text-center transition-all"
                >
                  Permalink
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Patient Modal */}
      <NewPatientModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
      />

      {/* Edit Patient Modal */}
      {editingClient && (
        <EditPatientModal
          client={editingClient}
          isOpen={Boolean(editingClient)}
          onClose={() => setEditingClient(null)}
          onUpdated={(updated) => {
            setClients((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
            setEditingClient(null);
          }}
        />
      )}
    </div>
  );
}
