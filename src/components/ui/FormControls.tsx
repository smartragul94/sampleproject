import type { ReactNode } from 'react';
import { primaryButton, secondaryButton } from '@/lib/ui';

export function Field({ label, className = '', children }: { label: string; className?: string; children: ReactNode }) {
  return (
    <label className={`block space-y-1.5 ${className}`}>
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</span>
      {children}
    </label>
  );
}

export function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p role="alert" className="rounded-xl bg-error-100 px-3.5 py-2.5 text-sm font-medium text-error-700">
      {message}
    </p>
  );
}

export function FormActions({
  onCancel,
  saving,
  submitLabel,
}: {
  onCancel: () => void;
  saving: boolean;
  submitLabel: string;
}) {
  return (
    <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
      <button type="button" onClick={onCancel} className={secondaryButton}>
        Cancel
      </button>
      <button type="submit" disabled={saving} className={primaryButton}>
        {saving ? 'Saving...' : submitLabel}
      </button>
    </div>
  );
}
