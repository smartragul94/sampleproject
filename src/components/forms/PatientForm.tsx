import { useState, type FormEvent } from 'react';
import { useClinic } from '@/context/clinicContext';
import { Field, FormActions, FormError } from '@/components/ui/FormControls';
import { useSubmit } from '@/hooks/useSubmit';
import { savePatient } from '@/lib/api/patients';
import { fieldClass } from '@/lib/ui';
import { SEX_OPTIONS, type Patient, type PatientInput, type Sex } from '@/types/clinic';

interface PatientFormProps {
  patient?: Patient;
  onDone: () => void;
}

interface PatientDraft {
  name: string;
  age: string;
  sex: string;
  phone: string;
  address: string;
  medical_history: string;
}

export default function PatientForm({ patient, onDone }: PatientFormProps) {
  const { save } = useClinic();
  const { saving, error, submit } = useSubmit();
  const [draft, setDraft] = useState<PatientDraft>({
    name: patient?.name ?? '',
    age: patient?.age?.toString() ?? '',
    sex: patient?.sex ?? '',
    phone: patient?.phone ?? '',
    address: patient?.address ?? '',
    medical_history: patient?.medical_history ?? '',
  });

  const set = (key: keyof PatientDraft, value: string) => setDraft((d) => ({ ...d, [key]: value }));

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const input: PatientInput = {
      name: draft.name.trim(),
      age: draft.age === '' ? null : Number(draft.age),
      sex: draft.sex === '' ? null : (draft.sex as Sex),
      phone: draft.phone.trim() || null,
      address: draft.address.trim() || null,
      medical_history: draft.medical_history.trim() || null,
    };
    void submit(async () => {
      await save(() => savePatient(input, patient?.id));
      onDone();
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name" className="sm:col-span-2">
          <input required className={fieldClass} value={draft.name} onChange={(e) => set('name', e.target.value)} />
        </Field>
        <Field label="Age">
          <input
            type="number"
            min={0}
            max={150}
            className={fieldClass}
            value={draft.age}
            onChange={(e) => set('age', e.target.value)}
          />
        </Field>
        <Field label="Sex">
          <select className={fieldClass} value={draft.sex} onChange={(e) => set('sex', e.target.value)}>
            <option value="">Not specified</option>
            {SEX_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Phone">
          <input type="tel" className={fieldClass} value={draft.phone} onChange={(e) => set('phone', e.target.value)} />
        </Field>
        <Field label="Address">
          <input className={fieldClass} value={draft.address} onChange={(e) => set('address', e.target.value)} />
        </Field>
        <Field label="Medical history and allergies" className="sm:col-span-2">
          <textarea
            rows={3}
            placeholder="e.g. diabetes, penicillin allergy"
            className={fieldClass}
            value={draft.medical_history}
            onChange={(e) => set('medical_history', e.target.value)}
          />
        </Field>
      </div>
      <FormError message={error} />
      <FormActions onCancel={onDone} saving={saving} submitLabel={patient ? 'Save changes' : 'Add patient'} />
    </form>
  );
}
