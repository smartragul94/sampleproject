import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useClinic } from '@/context/clinicContext';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { deleteCaseSheet } from '@/lib/api/patients';
import { formatDate } from '@/lib/format';
import { cardClass, iconButton } from '@/lib/ui';
import type { CaseSheet } from '@/types/clinic';

export default function CaseSheetList({ sheets }: { sheets: CaseSheet[] }) {
  const { runAction } = useClinic();
  const [pendingDelete, setPendingDelete] = useState<CaseSheet | null>(null);

  if (sheets.length === 0) {
    return <div className={`${cardClass} p-8 text-center text-sm text-slate-500`}>No case sheets yet.</div>;
  }

  const confirmDelete = () => {
    if (!pendingDelete) return;
    const id = pendingDelete.id;
    setPendingDelete(null);
    void runAction(() => deleteCaseSheet(id));
  };

  return (
    <>
      <ul className="space-y-3">
        {sheets.map((sheet) => {
          const fields = [
            ['Complaint', sheet.chief_complaint],
            ['Diagnosis', sheet.diagnosis],
            ['Treatment', sheet.treatment],
            ['Prescription', sheet.prescription],
          ].filter((entry): entry is [string, string] => Boolean(entry[1]));

          return (
            <li key={sheet.id} className={`${cardClass} p-5`}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-lg bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">
                    {formatDate(sheet.visit_date)}
                  </span>
                  {sheet.teeth && (
                    <span className="rounded-lg bg-accent-100 px-2.5 py-1 text-xs font-semibold text-slate-800">
                      Teeth {sheet.teeth}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  aria-label="Delete case sheet"
                  onClick={() => setPendingDelete(sheet)}
                  className={iconButton}
                >
                  <Trash2 size={16} aria-hidden="true" />
                </button>
              </div>
              {fields.length > 0 && (
                <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                  {fields.map(([label, value]) => (
                    <div key={label}>
                      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</dt>
                      <dd className="mt-1 whitespace-pre-line text-sm text-slate-700">{value}</dd>
                    </div>
                  ))}
                </dl>
              )}
              {sheet.next_visit && (
                <p className="mt-4 text-xs font-semibold text-brand-700">Next visit: {formatDate(sheet.next_visit)}</p>
              )}
            </li>
          );
        })}
      </ul>

      {pendingDelete && (
        <ConfirmModal
          title="Delete this case sheet?"
          message="This visit record will be permanently removed."
          confirmLabel="Delete"
          onConfirm={confirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </>
  );
}
