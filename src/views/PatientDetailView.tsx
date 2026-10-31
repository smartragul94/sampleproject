import { useState } from 'react';
import { ArrowLeft, CalendarPlus, Pencil, Plus, Receipt, Trash2 } from 'lucide-react';
import { useClinic } from '@/context/clinicContext';
import Modal from '@/components/ui/Modal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import StatCard from '@/components/ui/StatCard';
import AppointmentList from '@/components/appointments/AppointmentList';
import BillList from '@/components/billing/BillList';
import CaseSheetList from '@/components/patients/CaseSheetList';
import AppointmentForm from '@/components/forms/AppointmentForm';
import BillForm from '@/components/forms/BillForm';
import CaseSheetForm from '@/components/forms/CaseSheetForm';
import PatientForm from '@/components/forms/PatientForm';
import { deletePatient } from '@/lib/api/patients';
import { billTotal, totalOutstanding } from '@/lib/calculations';
import { formatDate, formatINR, initials, todayISO } from '@/lib/format';
import { cardClass, chipButton, iconButton, secondaryButton } from '@/lib/ui';
import { SEX_OPTIONS } from '@/types/clinic';

type DetailDialog = 'edit' | 'delete' | 'caseSheet' | 'bill' | 'appointment';

interface PatientDetailViewProps {
  patientId: string;
  onBack: () => void;
}

export default function PatientDetailView({ patientId, onBack }: PatientDetailViewProps) {
  const { data, runAction } = useClinic();
  const [dialog, setDialog] = useState<DetailDialog | null>(null);

  const patient = data.patients.find((p) => p.id === patientId);
  if (!patient) {
    return (
      <div className={`${cardClass} space-y-4 p-8 text-center`}>
        <p className="text-sm text-slate-600">This patient could not be found.</p>
        <button type="button" onClick={onBack} className={secondaryButton}>
          Back to patients
        </button>
      </div>
    );
  }

  const close = () => setDialog(null);
  const sheets = data.caseSheets.filter((c) => c.patient_id === patientId);
  const bills = data.bills.filter((b) => b.patient_id === patientId);
  const appointments = data.appointments.filter((a) => a.patient_id === patientId);
  const billed = bills.reduce((sum, bill) => sum + billTotal(bill), 0);
  const dues = totalOutstanding(bills, data.payments);
  const today = todayISO();
  const nextVisit = appointments.find((a) => a.appointment_date >= today && a.status === 'Scheduled');
  const sex = SEX_OPTIONS.find((option) => option.value === patient.sex)?.label;

  const confirmDelete = () => {
    setDialog(null);
    onBack();
    void runAction(() => deletePatient(patient.id));
  };

  return (
    <div className="space-y-8 animate-fade-up">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button type="button" onClick={onBack} className={`${chipButton} px-3.5 py-2`}>
          <ArrowLeft size={14} aria-hidden="true" />
          All patients
        </button>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setDialog('edit')} className={secondaryButton}>
            <Pencil size={15} aria-hidden="true" />
            Edit
          </button>
          <button type="button" aria-label="Delete patient" onClick={() => setDialog('delete')} className={iconButton}>
            <Trash2 size={16} aria-hidden="true" />
          </button>
        </div>
      </div>

      <section className={`${cardClass} relative overflow-hidden p-6 sm:p-8`}>
        <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-brand-50" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
          <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-brand-500 to-brand-800 text-2xl font-bold text-white shadow-lg shadow-brand-700/30">
            {initials(patient.name)}
          </span>
          <div className="min-w-0 space-y-1">
            <h1 className="text-2xl font-bold text-slate-900">{patient.name}</h1>
            <p className="text-sm text-slate-500">
              {[patient.age ? `${patient.age} yrs` : null, sex, patient.phone].filter(Boolean).join(' · ') ||
                'No details added'}
            </p>
            {patient.address && <p className="text-sm text-slate-500">{patient.address}</p>}
            <p className="text-xs text-slate-400">Registered {formatDate(patient.registered_on)}</p>
          </div>
        </div>
        {patient.medical_history && (
          <div className="relative mt-6 rounded-2xl bg-accent-100/60 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Medical history and allergies</p>
            <p className="mt-1 whitespace-pre-line text-sm text-slate-800">{patient.medical_history}</p>
          </div>
        )}
      </section>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <StatCard label="Visits recorded" value={String(sheets.length)} icon={Pencil} />
        <StatCard label="Total billed" value={formatINR(billed)} icon={Receipt} tone="accent" />
        <StatCard label="Pending dues" value={formatINR(dues)} icon={Receipt} tone={dues > 0 ? 'warning' : 'success'} />
        <StatCard
          label="Next visit"
          value={nextVisit ? formatDate(nextVisit.appointment_date) : 'Not booked'}
          icon={CalendarPlus}
        />
      </section>

      <section className="space-y-4">
        <SectionHeader title="Case sheets" actionLabel="Add case sheet" onAction={() => setDialog('caseSheet')} />
        <CaseSheetList sheets={sheets} />
      </section>

      <section className="space-y-4">
        <SectionHeader title="Bills" actionLabel="New bill" onAction={() => setDialog('bill')} />
        <BillList bills={[...bills].reverse()} showPatient={false} emptyText="No bills for this patient." />
      </section>

      <section className="space-y-4">
        <SectionHeader title="Appointments" actionLabel="Book visit" onAction={() => setDialog('appointment')} />
        <AppointmentList appointments={appointments} showDate allowDelete emptyText="No appointments booked." />
      </section>

      {dialog === 'edit' && (
        <Modal title="Edit patient" onClose={close}>
          <PatientForm patient={patient} onDone={close} />
        </Modal>
      )}
      {dialog === 'caseSheet' && (
        <Modal title="New case sheet" onClose={close}>
          <CaseSheetForm patientId={patient.id} onDone={close} />
        </Modal>
      )}
      {dialog === 'bill' && (
        <Modal title="Create bill" onClose={close}>
          <BillForm patientId={patient.id} onDone={close} />
        </Modal>
      )}
      {dialog === 'appointment' && (
        <Modal title="Book appointment" onClose={close}>
          <AppointmentForm patientId={patient.id} onDone={close} />
        </Modal>
      )}
      {dialog === 'delete' && (
        <ConfirmModal
          title={`Delete ${patient.name}?`}
          message="This removes the patient along with their case sheets, appointments and bills. This cannot be undone."
          confirmLabel="Delete patient"
          onConfirm={confirmDelete}
          onCancel={close}
        />
      )}
    </div>
  );
}

function SectionHeader({ title, actionLabel, onAction }: { title: string; actionLabel: string; onAction: () => void }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      <button type="button" onClick={onAction} className={chipButton}>
        <Plus size={14} aria-hidden="true" />
        {actionLabel}
      </button>
    </div>
  );
}
