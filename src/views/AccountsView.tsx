import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useClinic } from '@/context/clinicContext';
import Modal from '@/components/ui/Modal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import ExpenseForm from '@/components/forms/ExpenseForm';
import { deleteExpense } from '@/lib/api/accounts';
import { expensesIn, incomeIn } from '@/lib/calculations';
import { formatDate, formatINR, monthLabel, recentMonths } from '@/lib/format';
import { cardClass, iconButton, primaryButton } from '@/lib/ui';
import type { Expense } from '@/types/clinic';

export default function AccountsView() {
  const { data, runAction } = useClinic();
  const [adding, setAdding] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Expense | null>(null);

  const months = recentMonths(6);

  const confirmDelete = () => {
    if (!pendingDelete) return;
    const id = pendingDelete.id;
    setPendingDelete(null);
    void runAction(() => deleteExpense(id));
  };

  return (
    <div className="space-y-8 animate-fade-up">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">Last six months</p>
          <h1 className="text-2xl font-bold text-slate-900">Accounts</h1>
        </div>
        <button type="button" onClick={() => setAdding(true)} className={primaryButton}>
          <Plus size={16} aria-hidden="true" />
          Add expense
        </button>
      </header>

      <section className={`${cardClass} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-sm">
            <thead className="bg-slate-50/80 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th scope="col" className="px-5 py-3 font-semibold">Month</th>
                <th scope="col" className="px-5 py-3 text-right font-semibold">Income</th>
                <th scope="col" className="px-5 py-3 text-right font-semibold">Expenses</th>
                <th scope="col" className="px-5 py-3 text-right font-semibold">Net</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {months.map((month) => {
                const income = incomeIn(data.payments, month);
                const expenses = expensesIn(data.expenses, month);
                const net = income - expenses;
                return (
                  <tr key={month} className="transition hover:bg-brand-50/50">
                    <td className="px-5 py-3.5 font-medium text-slate-900">{monthLabel(month)}</td>
                    <td className="px-5 py-3.5 text-right text-slate-700">{formatINR(income)}</td>
                    <td className="px-5 py-3.5 text-right text-slate-700">{formatINR(expenses)}</td>
                    <td className={`px-5 py-3.5 text-right font-semibold ${net < 0 ? 'text-error-700' : 'text-success-700'}`}>
                      {formatINR(net)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Expenses</h2>
        {data.expenses.length === 0 ? (
          <div className={`${cardClass} p-8 text-center text-sm text-slate-500`}>No expenses recorded yet.</div>
        ) : (
          <ul className="space-y-3">
            {data.expenses.map((expense) => (
              <li key={expense.id} className={`${cardClass} flex items-center gap-4 p-4`}>
                <span className="rounded-lg bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">
                  {expense.category}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900">{expense.note || expense.category}</p>
                  <p className="text-xs text-slate-500">{formatDate(expense.expense_date)}</p>
                </div>
                <p className="font-semibold text-slate-900">{formatINR(expense.amount)}</p>
                <button
                  type="button"
                  aria-label="Delete expense"
                  onClick={() => setPendingDelete(expense)}
                  className={iconButton}
                >
                  <Trash2 size={16} aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {adding && (
        <Modal title="Add expense" onClose={() => setAdding(false)}>
          <ExpenseForm onDone={() => setAdding(false)} />
        </Modal>
      )}

      {pendingDelete && (
        <ConfirmModal
          title="Delete this expense?"
          message="This expense will be removed from your accounts."
          confirmLabel="Delete"
          onConfirm={confirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  );
}
