import { useState, type FormEvent } from 'react';
import { useClinic } from '@/context/clinicContext';
import { Field, FormActions, FormError } from '@/components/ui/FormControls';
import { useSubmit } from '@/hooks/useSubmit';
import { addPayment } from '@/lib/api/billing';
import { formatINR, todayISO } from '@/lib/format';
import { fieldClass } from '@/lib/ui';
import { PAYMENT_MODES, type Bill, type PaymentMode } from '@/types/clinic';

interface PaymentFormProps {
  bill: Bill;
  due: number;
  onDone: () => void;
}

export default function PaymentForm({ bill, due, onDone }: PaymentFormProps) {
  const { save } = useClinic();
  const { saving, error, submit } = useSubmit();
  const [amount, setAmount] = useState(String(due));
  const [mode, setMode] = useState<PaymentMode>('Cash');

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = Number(amount);
    void submit(async () => {
      if (!(value > 0)) throw new Error('Enter an amount greater than zero.');
      if (value > due) throw new Error(`The amount cannot be more than the due ${formatINR(due)}.`);
      await save(() =>
        addPayment({ bill_id: bill.id, payment_date: todayISO(), amount: value, mode }),
      );
      onDone();
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="rounded-2xl bg-warning-100 px-4 py-3 text-sm text-warning-700">
        Amount due: <span className="font-bold">{formatINR(due)}</span>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Amount received (₹)">
          <input
            type="number"
            min={1}
            max={due}
            required
            className={fieldClass}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </Field>
        <Field label="Mode">
          <select className={fieldClass} value={mode} onChange={(e) => setMode(e.target.value as PaymentMode)}>
            {PAYMENT_MODES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <FormError message={error} />
      <FormActions onCancel={onDone} saving={saving} submitLabel="Record payment" />
    </form>
  );
}
