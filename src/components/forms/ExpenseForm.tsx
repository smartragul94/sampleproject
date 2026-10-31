import { useState, type FormEvent } from 'react';
import { useClinic } from '@/context/clinicContext';
import { Field, FormActions, FormError } from '@/components/ui/FormControls';
import { useSubmit } from '@/hooks/useSubmit';
import { createExpense } from '@/lib/api/accounts';
import { todayISO } from '@/lib/format';
import { fieldClass } from '@/lib/ui';
import { EXPENSE_CATEGORIES } from '@/types/clinic';

interface ExpenseFormProps {
  onDone: () => void;
}

export default function ExpenseForm({ onDone }: ExpenseFormProps) {
  const { save } = useClinic();
  const { saving, error, submit } = useSubmit();
  const [draft, setDraft] = useState({
    expense_date: todayISO(),
    category: EXPENSE_CATEGORIES[0],
    amount: '',
    note: '',
  });

  const set = (key: keyof typeof draft, value: string) => setDraft((d) => ({ ...d, [key]: value }));

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const amount = Number(draft.amount);
    void submit(async () => {
      if (!(amount > 0)) throw new Error('Enter an amount greater than zero.');
      await save(() =>
        createExpense({
          expense_date: draft.expense_date,
          category: draft.category,
          amount,
          note: draft.note.trim() || null,
        }),
      );
      onDone();
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Date">
          <input
            type="date"
            required
            className={fieldClass}
            value={draft.expense_date}
            onChange={(e) => set('expense_date', e.target.value)}
          />
        </Field>
        <Field label="Category">
          <select className={fieldClass} value={draft.category} onChange={(e) => set('category', e.target.value)}>
            {EXPENSE_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Amount (₹)">
          <input
            type="number"
            min={1}
            required
            className={fieldClass}
            value={draft.amount}
            onChange={(e) => set('amount', e.target.value)}
          />
        </Field>
        <Field label="Note">
          <input className={fieldClass} value={draft.note} onChange={(e) => set('note', e.target.value)} />
        </Field>
      </div>
      <FormError message={error} />
      <FormActions onCancel={onDone} saving={saving} submitLabel="Add expense" />
    </form>
  );
}
