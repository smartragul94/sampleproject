import { useState } from 'react';
import { ChevronRight, Clock, Trash2 } from 'lucide-react';
import { useClinic } from '@/context/clinicContext';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { deleteAppointment, setAppointmentStatus } from '@/lib/api/appointments';
import { findPatientName } from '@/lib/calculations';
import { formatDate, formatTime } from '@/lib/format';
import { cardClass, iconButton } from '@/lib/ui';
import { APPOINTMENT_STATUSES, type Appointment, type AppointmentStatus } from '@/types/clinic';

const STATUS_STYLES: Record<AppointmentStatus, string> = {
  Scheduled: 'bg-brand-100 text-brand-800',
  Arrived: 'bg-warning-100 text-warning-700',
  Done: 'bg-success-100 text-success-700',
  Cancelled: 'bg-slate-200 text-slate-700',
};

interface AppointmentListProps {
  appointments: Appointment[];
  showDate?: boolean;
  allowDelete?: boolean;
  onOpenPatient?: (patientId: string) => void;
  emptyText?: string;
}

export default function AppointmentList({
  appointments,
  showDate = false,
  allowDelete = false,
  onOpenPatient,
  emptyText = 'No appointments here yet.',
}: AppointmentListProps) {
  const { data, runAction } = useClinic();
  const [pendingDelete, setPendingDelete] = useState<Appointment | null>(null);

  if (appointments.length === 0) {
    return <div className={`${cardClass} p-8 text-center text-sm text-slate-500`}>{emptyText}</div>;
  }

  const confirmDelete = () => {
    if (!pendingDelete) return;
    const id = pendingDelete.id;
    setPendingDelete(null);
    void runAction(() => deleteAppointment(id));
  };

  return (
    <>
      <ul className="space-y-3">
        {appointments.map((appointment) => {
          const name = findPatientName(data.patients, appointment.patient_id);
          return (
            <li
              key={appointment.id}
              className={`${cardClass} flex flex-col gap-3 p-4 transition hover:-translate-y-0.5 hover:shadow-md sm:flex-row sm:items-center`}
            >
              <div className="flex items-center gap-3 sm:w-44">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                  <Clock size={18} aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{formatTime(appointment.appointment_time)}</p>
                  {showDate && <p className="text-xs text-slate-500">{formatDate(appointment.appointment_date)}</p>}
                </div>
              </div>

              <div className="min-w-0 flex-1">
                {onOpenPatient ? (
                  <button
                    type="button"
                    onClick={() => onOpenPatient(appointment.patient_id)}
                    className="group inline-flex max-w-full items-center gap-1 text-left font-semibold text-slate-900 transition hover:text-brand-700"
                  >
                    <span className="truncate">{name}</span>
                    <ChevronRight size={14} className="shrink-0 opacity-0 transition group-hover:opacity-100" aria-hidden="true" />
                  </button>
                ) : (
                  <p className="font-semibold text-slate-900">{name}</p>
                )}
                <p className="truncate text-sm text-slate-500">{appointment.reason || 'General visit'}</p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <select
                  aria-label="Appointment status"
                  value={appointment.status}
                  onChange={(event) =>
                    void runAction(() => setAppointmentStatus(appointment.id, event.target.value as AppointmentStatus))
                  }
                  className={`rounded-full border-0 py-1.5 pl-3 pr-7 text-xs font-semibold transition focus:outline-none focus:ring-4 focus:ring-brand-500/20 ${STATUS_STYLES[appointment.status]}`}
                >
                  {APPOINTMENT_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                {allowDelete && (
                  <button
                    type="button"
                    aria-label="Delete appointment"
                    onClick={() => setPendingDelete(appointment)}
                    className={iconButton}
                  >
                    <Trash2 size={16} aria-hidden="true" />
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {pendingDelete && (
        <ConfirmModal
          title="Delete appointment?"
          message="This appointment will be removed from the schedule."
          confirmLabel="Delete"
          onConfirm={confirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </>
  );
}
