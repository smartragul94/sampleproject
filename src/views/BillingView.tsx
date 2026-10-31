import { useMemo, useState } from 'react';
import { Receipt, Plus, Wallet, CircleCheck } from 'lucide-react';
import { useClinic } from '@/context/clinicContext';
import Modal from '@/components/ui/Modal';
import StatCard from '@/components/ui/StatCard';
import BillList from '@/components/billing/BillList';
import BillForm from '@/components/forms/BillForm';
import { billDue, billTotal, totalOutstanding } from '@/lib/calculations';
import { formatINR } from '@/lib/format';
import { cardClass, primaryButton } from '@/lib/ui';

type BillFilter = 'all' | 'outstanding' | 'settled';

const FILTERS: { key: BillFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'outstanding', label: 'Outstanding' },
  { key: 'settled', label: 'Settled' },
];

interface BillingViewProps {
  onOpenPatient: (patientId: string) => void;
}

export default function BillingView({ onOpenPatient }: BillingViewProps) {
  const { data } = useClinic();
  const [filter, setFilter] = useState<BillFilter>('all');
  const [creating, setCreating] = useState(false);

  const billed = data.bills.reduce((sum, bill) => sum + billTotal(bill), 0);
  const collected = data.payments.reduce((sum, payment) => sum + payment.amount, 0);
  const outstanding = totalOutstanding(data.bills, data.payments);

  const visible = useMemo(
    () =>
      data.bills.filter((bill) => {
        const due = billDue(bill, data.payments);
        if (filter === 'outstanding') return due > 0;
        if (filter === 'settled') return due <= 0;
        return true;
      }),
    [data.bills, data.payments, filter],
  );

  return (
    <div className="space-y-8 animate-fade-up">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{data.bills.length} bills</p>
          <h1 className="text-2xl font-bold text-slate-900">Billing</h1>
        </div>
        <button type="button" onClick={() => setCreating(true)} className={primaryButton}>
          <Plus size={16} aria-hidden="true" />
          New bill
        </button>
      </header>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        <StatCard label="Total billed" value={formatINR(billed)} icon={Receipt} />
        <StatCard label="Collected" value={formatINR(collected)} icon={CircleCheck} tone="success" />
        <StatCard label="Outstanding" value={formatINR(outstanding)} icon={Wallet} tone={outstanding > 0 ? 'warning' : 'success'} />
      </section>

      <div className={`${cardClass} inline-flex w-full rounded-2xl p-1.5 sm:w-auto`} role="tablist" aria-label="Filter bills">
        {FILTERS.map((item) => (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={filter === item.key}
            onClick={() => setFilter(item.key)}
            className={`flex-1 rounded-xl px-5 py-2 text-sm font-semibold transition sm:flex-none ${
              filter === item.key ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <BillList
        bills={visible}
        onOpenPatient={onOpenPatient}
        emptyText={filter === 'all' ? 'No bills yet. Create the first one.' : 'No bills in this view.'}
      />

      {creating && (
        <Modal title="Create bill" onClose={() => setCreating(false)}>
          <BillForm onDone={() => setCreating(false)} />
        </Modal>
      )}
    </div>
  );
}
