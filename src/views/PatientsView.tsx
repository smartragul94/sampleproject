import { useMemo, useState } from 'react';
import { ChevronRight, Plus, Search, Users } from 'lucide-react';
import { useClinic } from '@/context/clinicContext';
import Modal from '@/components/ui/Modal';
import PatientForm from '@/components/forms/PatientForm';
import { billDue } from '@/lib/calculations';
import { formatINR, initials } from '@/lib/format';
import { cardClass, fieldClass, primaryButton } from '@/lib/ui';

interface PatientsViewProps {
  onOpenPatient: (patientId: string) => void;
}

export default function PatientsView({ onOpenPatient }: PatientsViewProps) {
  const { data } = useClinic();
  const [query, setQuery] = useState('');
  const [adding, setAdding] = useState(false);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return data.patients;
    return data.patients.filter(
      (patient) => patient.name.toLowerCase().includes(needle) || (patient.phone ?? '').includes(needle),
    );
  }, [data.patients, query]);

  return (
    <div className="space-y-6 animate-fade-up">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{data.patients.length} registered</p>
          <h1 className="text-2xl font-bold text-slate-900">Patients</h1>
        </div>
        <div className="flex gap-2">
          <div className="relative flex-1 sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} aria-hidden="true" />
            <input
              type="search"
              placeholder="Search name or phone"
              aria-label="Search patients"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className={`${fieldClass} pl-10`}
            />
          </div>
          <button type="button" onClick={() => setAdding(true)} className={primaryButton}>
            <Plus size={16} aria-hidden="true" />
            <span className="hidden sm:inline">New patient</span>
          </button>
        </div>
      </header>

      {visible.length === 0 ? (
        <div className={`${cardClass} flex flex-col items-center gap-3 p-10 text-center`}>
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
            <Users size={24} aria-hidden="true" />
          </span>
          <p className="font-semibold text-slate-900">{query ? 'No matching patients' : 'No patients yet'}</p>
          <p className="text-sm text-slate-500">
            {query ? 'Try a different name or phone number.' : 'Add your first patient to start booking visits.'}
          </p>
        </div>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {visible.map((patient) => {
            const dues = data.bills
              .filter((bill) => bill.patient_id === patient.id)
              .reduce((sum, bill) => sum + billDue(bill, data.payments), 0);
            return (
              <li key={patient.id}>
                <button
                  type="button"
                  onClick={() => onOpenPatient(patient.id)}
                  className={`${cardClass} group flex w-full items-center gap-4 p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md`}
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-800 text-sm font-bold text-white">
                    {initials(patient.name)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold text-slate-900">{patient.name}</span>
                    <span className="block truncate text-xs text-slate-500">
                      {[patient.age ? `${patient.age} yrs` : null, patient.phone].filter(Boolean).join(' · ') || 'No details'}
                    </span>
                  </span>
                  {dues > 0 && (
                    <span className="rounded-full bg-warning-100 px-2.5 py-1 text-xs font-semibold text-warning-700">
                      {formatINR(dues)}
                    </span>
                  )}
                  <ChevronRight size={18} className="shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-brand-600" aria-hidden="true" />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {adding && (
        <Modal title="New patient" onClose={() => setAdding(false)}>
          <PatientForm onDone={() => setAdding(false)} />
        </Modal>
      )}
    </div>
  );
}
