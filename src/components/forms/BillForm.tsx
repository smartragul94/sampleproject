import { useState, type FormEvent } from 'react';
import { useClinic } from '@/context/clinicContext';
import { Field, FormActions, FormError } from '@/components/ui/FormControls';
import { useSubmit } from '@/hooks/useSubmit';
import { addPayment, createBill } from '@/lib/api/billing';
import { sumAmounts } from '@/lib/calculations';
import { todayISO } from '@/lib/format';
import { fieldClass } from '@/lib/ui';
import { PAYMENT_MODES, type BillItem, type PaymentMode } from '@/types/clinic';

interface BillFormProps {
  patientId?: string;
  onDone: () => void;
}

export function parseTreatments(text: string): BillItem[] {
  const items = text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const match = line.match(/^(.*?)[\s:–-]*(\d[\d,]*(?:\.\d+)?)\s*$/);
      if (!match || !match[1].trim()) {
        throw new Error(`Add an amount to "${line}", for example: Scaling - 800`);
      }
      return { name: match[1].trim(), amount: Number(match[2].replace(/,/g, '')) };
    });
  if (items.length === 0) throw new Error('Add at least one treatment.');
  return items;
}

export default function BillForm({ patientId, onDone }: BillFormProps) {
  const { data, save } = useClinic();
  const { saving, error, submit } = useSubmit();
  const [draft, setDraft] = useState({
    patient_id: patientId ?? data.patients[0]?.id ?? '',
    bill_date: todayISO(),
    treatments: '',
    received: '',
    mode: 'Cash' as PaymentMode,
  });

  if (data.patients.length === 0) {
    return (
      <div className="space-y-5">
        <p className="text-sm text-slate-600">Add a patient first, then you can create a bill for them.</p>
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
      const items = parseTreatments(draft.treatments);
      const total = sumAmounts(items);
      const received = Number(draft.received || 0);
      if (received > total) throw new Error('The amount received cannot be more than the bill total.');

      await save(async () => {
        const billId = await createBill({ patient_id: draft.patient_id, bill_date: draft.bill_date, items });
        if (received > 0) {
          await addPayment({ bill_id: billId, payment_date: draft.bill_date, amount: received, mode: draft.mode });
        }
      });
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
              </option>
            ))}
          </select>
        </Field>
        <Field label="Bill date">
          <input
            type="date"
            required
            className={fieldClass}
            value={draft.bill_date}
            onChange={(e) => set('bill_date', e.target.value)}
          />
        </Field>
        <Field label="Amount received now (optional)">
          <input
            type="number"
            min={0}
            className={fieldClass}
            value={draft.received}
            onChange={(e) => set('received', e.target.value)}
          />
        </Field>
        <Field label="Treatments, one per line" className="sm:col-span-2">
          <textarea
            required
            rows={4}
            placeholder={'Scaling - 800\nFilling - 1200'}
            className={fieldClass}
            value={draft.treatments}
            onChange={(e) => set('treatments', e.target.value)}
          />
        </Field>
        <Field label="Payment mode">
          <select className={fieldClass} value={draft.mode} onChange={(e) => set('mode', e.target.value)}>
            {PAYMENT_MODES.map((mode) => (
              <option key={mode} value={mode}>
                {mode}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <FormError message={error} />
      <FormActions onCancel={onDone} saving={saving} submitLabel="Create bill" />
    </form>
  );
}
