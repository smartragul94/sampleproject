import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useClinic } from '@/context/clinicContext';
import Modal from '@/components/ui/Modal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import PaymentForm from '@/components/forms/PaymentForm';
import { deleteBill } from '@/lib/api/billing';
import { billDue, billPaid, billTotal, findPatientName } from '@/lib/calculations';
import { formatDate, formatINR } from '@/lib/format';
import { cardClass, chipButton, iconButton } from '@/lib/ui';
import type { Bill } from '@/types/clinic';

interface BillListProps {
  bills: Bill[];
  showPatient?: boolean;
  onOpenPatient?: (patientId: string) => void;
  emptyText?: string;
}

export default function BillList({
  bills,
  showPatient = true,
  onOpenPatient,
  emptyText = 'No bills yet.',
}: BillListProps) {
  const { data, runAction } = useClinic();
  const [collecting, setCollecting] = useState<Bill | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Bill | null>(null);

  if (bills.length === 0) {
    return <div className={`${cardClass} p-8 text-center text-sm text-slate-500`}>{emptyText}</div>;
  }

  const confirmDelete = () => {
    if (!pendingDelete) return;
    const id = pendingDelete.id;
    setPendingDelete(null);
    void runAction(() => deleteBill(id));
  };

  return (
    <>
      <ul className="grid gap-4 md:grid-cols-2">
        {bills.map((bill) => {
          const due = billDue(bill, data.payments);
          const name = findPatientName(data.patients, bill.patient_id);
          return (
            <li key={bill.id} className={`${cardClass} flex flex-col p-5 transition hover:-translate-y-0.5 hover:shadow-md`}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  {showPatient &&
                    (onOpenPatient ? (
                      <button
                        type="button"
                        onClick={() => onOpenPatient(bill.patient_id)}
                        className="truncate text-left font-semibold text-slate-900 hover:text-brand-700"
                      >
                        {name}
                      </button>
                    ) : (
                      <p className="truncate font-semibold text-slate-900">{name}</p>
                    ))}
                  <p className="text-xs text-slate-500">{formatDate(bill.bill_date)}</p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                    due > 0 ? 'bg-warning-100 text-warning-700' : 'bg-success-100 text-success-700'
                  }`}
                >
                  {due > 0 ? `Due ${formatINR(due)}` : 'Settled'}
                </span>
              </div>

              <ul className="mt-4 space-y-1.5 border-y border-slate-100 py-3">
                {bill.items.map((item, index) => (
                  <li key={`${item.name}-${index}`} className="flex justify-between gap-3 text-sm">
                    <span className="truncate text-slate-600">{item.name}</span>
                    <span className="font-medium text-slate-800">{formatINR(item.amount)}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-4 flex items-end justify-between gap-3">
                <div className="flex gap-5 text-sm">
                  <div>
                    <p className="text-xs text-slate-500">Total</p>
                    <p className="font-semibold text-slate-900">{formatINR(billTotal(bill))}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Paid</p>
                    <p className="font-semibold text-success-700">{formatINR(billPaid(bill, data.payments))}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {due > 0 && (
                    <button type="button" onClick={() => setCollecting(bill)} className={chipButton}>
                      Collect
                    </button>
                  )}
                  <button type="button" aria-label="Delete bill" onClick={() => setPendingDelete(bill)} className={iconButton}>
                    <Trash2 size={16} aria-hidden="true" />
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {collecting && (
        <Modal title="Collect payment" onClose={() => setCollecting(null)}>
          <PaymentForm
            bill={collecting}
            due={billDue(collecting, data.payments)}
            onDone={() => setCollecting(null)}
          />
        </Modal>
      )}

      {pendingDelete && (
        <ConfirmModal
          title="Delete this bill?"
          message="The bill and every payment recorded against it will be removed."
          confirmLabel="Delete bill"
          onConfirm={confirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </>
  );
}
