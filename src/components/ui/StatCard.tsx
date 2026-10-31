import type { LucideIcon } from 'lucide-react';
import { cardClass } from '@/lib/ui';

export type StatTone = 'brand' | 'success' | 'error' | 'warning' | 'accent';

const TONES: Record<StatTone, { tile: string; value: string }> = {
  brand: { tile: 'bg-brand-50 text-brand-700', value: 'text-slate-900' },
  success: { tile: 'bg-success-100 text-success-700', value: 'text-success-700' },
  error: { tile: 'bg-error-100 text-error-700', value: 'text-error-700' },
  warning: { tile: 'bg-warning-100 text-warning-700', value: 'text-warning-700' },
  accent: { tile: 'bg-accent-100 text-accent-600', value: 'text-slate-900' },
};

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  tone?: StatTone;
}

export default function StatCard({ label, value, icon: Icon, tone = 'brand' }: StatCardProps) {
  const styles = TONES[tone];
  return (
    <div className={`${cardClass} p-4 transition hover:-translate-y-0.5 hover:shadow-md sm:p-5`}>
      <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${styles.tile}`}>
        <Icon size={18} aria-hidden="true" />
      </span>
      <p className="mt-4 text-xs font-medium text-slate-500">{label}</p>
      <p className={`mt-1 text-xl font-bold tracking-tight sm:text-2xl ${styles.value}`}>{value}</p>
    </div>
  );
}
