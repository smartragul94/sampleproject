import { useState, type FormEvent } from 'react';
import { useClinic } from '@/context/clinicContext';
import { Field, FormActions, FormError } from '@/components/ui/FormControls';
import { useSubmit } from '@/hooks/useSubmit';
import { saveMonthlyTarget } from '@/lib/api/accounts';
import { fieldClass } from '@/lib/ui';

interface TargetFormProps {
  onDone: () => void;
}

export default function TargetForm({ onDone }: TargetFormProps) {
  const { data, save } = useClinic();
  const { saving, error, submit } = useSubmit();
  const [amount, setAmount] = useState(data.monthlyTarget ? String(data.monthlyTarget) : '');

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = Number(amount);
    void submit(async () => {
      if (!(value >= 0)) throw new Error('Enter a valid target amount.');
      await save(() => saveMonthlyTarget(value));
      onDone();
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Field label="Monthly income target (₹)">
        <input
          type="number"
          min={0}
          required
          className={fieldClass}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </Field>
      <FormError message={error} />
      <FormActions onCancel={onDone} saving={saving} submitLabel="Save target" />
    </form>
  );
}
