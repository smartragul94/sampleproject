import { useState, type FormEvent } from 'react';
import { useClinic } from '@/context/clinicContext';
import { Field, FormActions, FormError } from '@/components/ui/FormControls';
import { useSubmit } from '@/hooks/useSubmit';
import { createAppointment } from '@/lib/api/appointments';
import { todayISO } from '@/lib/format';
import { fieldClass } from '@/lib/ui';

interface AppointmentFormProps {
  patientId?: string;
  defaultDate?: string;
  onDone: () => void;
}

export default function AppointmentForm({ patientId, defaultDate, onDone }: AppointmentFormProps) {
  const { data, save } = useClinic();
  const { saving, error, submit } = useSubmit();
  const [draft, setDraft] = useState({
    patient_id: patientId ?? data.patients[0]?.id ?? '',
    appointment_date: defaultDate ?? todayISO(),
    appointment_time: '10:00',
    reason: '',
  });

  if (data.patients.length === 0) {
    return (
      <div className="space-y-5">
        <p className="text-sm text-slate-600">Add a patient first, then you can book an appointment for them.</p>
        <div className="flex justify-end">
          <button type="button" onClick={onDone} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700">
            Close
          </button>
        </div>
      </div>
    );
  }

  const set = (key: keyof typeof draft, value: string) => setDraft((d) => ({ ...d, [key]: value }));

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void submit(async () => {
      await save(() =>
        createAppointment({
          patient_id: draft.patient_id,
          appointment_date: draft.appointment_date,
          appointment_time: draft.appointment_time,
          reason: draft.reason.trim() || null,
        }),
      );
      onDone();
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Patient" className="sm:col-span-2">
          <select required className={fieldClass} value={draft.patient_id} onChange={(e) => set('patient_id', e.target.value)}>
            {data.patients.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.name}
                {patient.phone ? ` · ${patient.phone}` : ''}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Date">
          <input
            type="date"
            required
            className={fieldClass}
            value={draft.appointment_date}
            onChange={(e) => set('appointment_date', e.target.value)}
          />
        </Field>
        <Field label="Time">
          <input
            type="time"
            required
            className={fieldClass}
            value={draft.appointment_time}
            onChange={(e) => set('appointment_time', e.target.value)}
          />
        </Field>
        <Field label="Reason" className="sm:col-span-2">
          <input
            placeholder="Check-up, RCT, scaling..."
            className={fieldClass}
            value={draft.reason}
            onChange={(e) => set('reason', e.target.value)}
          />
        </Field>
      </div>
      <FormError message={error} />
      <FormActions onCancel={onDone} saving={saving} submitLabel="Book appointment" />
    </form>
  );
}
