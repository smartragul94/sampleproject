import { useState, type FormEvent } from 'react';
import { useClinic } from '@/context/clinicContext';
import { Field, FormActions, FormError } from '@/components/ui/FormControls';
import { useSubmit } from '@/hooks/useSubmit';
import { createCaseSheet } from '@/lib/api/patients';
import { todayISO } from '@/lib/format';
import { fieldClass } from '@/lib/ui';

interface CaseSheetFormProps {
  patientId: string;
  onDone: () => void;
}

const TEXT_FIELDS: { key: 'chief_complaint' | 'diagnosis' | 'treatment' | 'prescription'; label: string }[] = [
  { key: 'chief_complaint', label: 'Chief complaint' },
  { key: 'diagnosis', label: 'Diagnosis' },
  { key: 'treatment', label: 'Treatment done / plan' },
  { key: 'prescription', label: 'Prescription' },
];

export default function CaseSheetForm({ patientId, onDone }: CaseSheetFormProps) {
  const { save } = useClinic();
  const { saving, error, submit } = useSubmit();
  const [draft, setDraft] = useState({
    visit_date: todayISO(),
    chief_complaint: '',
    teeth: '',
    diagnosis: '',
    treatment: '',
    prescription: '',
    next_visit: '',
  });

  const set = (key: keyof typeof draft, value: string) => setDraft((d) => ({ ...d, [key]: value }));

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void submit(async () => {
      await save(() =>
        createCaseSheet({
          patient_id: patientId,
          visit_date: draft.visit_date,
          chief_complaint: draft.chief_complaint.trim() || null,
          teeth: draft.teeth.trim() || null,
          diagnosis: draft.diagnosis.trim() || null,
          treatment: draft.treatment.trim() || null,
          prescription: draft.prescription.trim() || null,
          next_visit: draft.next_visit || null,
        }),
      );
      onDone();
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Visit date">
          <input
            type="date"
            required
            className={fieldClass}
            value={draft.visit_date}
            onChange={(e) => set('visit_date', e.target.value)}
          />
        </Field>
        <Field label="Teeth involved (FDI no.)">
          <input
            placeholder="e.g. 36, 37"
            className={fieldClass}
            value={draft.teeth}
            onChange={(e) => set('teeth', e.target.value)}
          />
        </Field>
        {TEXT_FIELDS.map((field) => (
          <Field key={field.key} label={field.label} className="sm:col-span-2">
            <textarea
              rows={2}
              className={fieldClass}
              value={draft[field.key]}
              onChange={(e) => set(field.key, e.target.value)}
            />
          </Field>
        ))}
        <Field label="Next visit">
          <input
            type="date"
            className={fieldClass}
            value={draft.next_visit}
            onChange={(e) => set('next_visit', e.target.value)}
          />
        </Field>
      </div>
      <FormError message={error} />
      <FormActions onCancel={onDone} saving={saving} submitLabel="Save case sheet" />
    </form>
  );
}
