import { useState } from 'react';
import { ArrowRight, Banknote, CalendarPlus, Receipt, Target, TrendingDown, TrendingUp, UserPlus, Users, Wallet } from 'lucide-react';
import { useClinic } from '@/context/clinicContext';
import Modal from '@/components/ui/Modal';
import StatCard from '@/components/ui/StatCard';
import AppointmentList from '@/components/appointments/AppointmentList';
import AppointmentForm from '@/components/forms/AppointmentForm';
import BillForm from '@/components/forms/BillForm';
import ExpenseForm from '@/components/forms/ExpenseForm';
import PatientForm from '@/components/forms/PatientForm';
import TargetForm from '@/components/forms/TargetForm';
import { expensesIn, incomeIn, incomeOn, totalOutstanding } from '@/lib/calculations';
import { formatINR, greetingForNow, monthLabel, todayISO } from '@/lib/format';
import { cardClass, chipButton, secondaryButton } from '@/lib/ui';
import type { ViewKey } from '@/types/clinic';

type HomeDialog = 'patient' | 'appointment' | 'bill' | 'expense' | 'target';

const QUICK_ACTIONS: { key: HomeDialog; label: string; hint: string; icon: typeof UserPlus; tile: string }[] = [
  { key: 'patient', label: 'New patient', hint: 'Register details', icon: UserPlus, tile: 'bg-brand-50 text-brand-700' },
  { key: 'appointment', label: 'Book visit', hint: 'Pick a slot', icon: CalendarPlus, tile: 'bg-accent-100 text-accent-600' },
  { key: 'bill', label: 'Create bill', hint: 'Treatments and dues', icon: Receipt, tile: 'bg-success-100 text-success-700' },
  { key: 'expense', label: 'Add expense', hint: 'Log clinic spend', icon: Banknote, tile: 'bg-warning-100 text-warning-700' },
];

const DIALOG_TITLES: Record<HomeDialog, string> = {
  patient: 'New patient',
  appointment: 'Book appointment',
  bill: 'Create bill',
  expense: 'Add expense',
  target: 'Monthly income target',
};

interface HomeViewProps {
  userName: string;
  onNavigate: (view: ViewKey, patientId?: string) => void;
}

export default function HomeView({ userName, onNavigate }: HomeViewProps) {
  const { data } = useClinic();
  const [dialog, setDialog] = useState<HomeDialog | null>(null);

  const today = todayISO();
  const month = today.slice(0, 7);
  const todays = data.appointments.filter((a) => a.appointment_date === today);
  const collectedToday = incomeOn(data.payments, today);
  const monthIncome = incomeIn(data.payments, month);
  const monthExpenses = expensesIn(data.expenses, month);
  const outstanding = totalOutstanding(data.bills, data.payments);
  const target = data.monthlyTarget;
  const progress = target > 0 ? Math.min(100, Math.round((monthIncome / target) * 100)) : 0;
  const firstName = userName.trim().split(/\s+/)[0] ?? '';
  const close = () => setDialog(null);

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 p-6 text-white shadow-xl shadow-brand-900/20 animate-fade-up sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-20 right-20 h-44 w-44 rounded-full border border-white/15" />
        <div className="relative">
          <p className="text-sm font-medium text-brand-100">
            {greetingForNow()}
            {firstName ? `, ${firstName}` : ''}
          </p>
          <h1 className="mt-1 text-2xl font-bold leading-tight sm:text-3xl">
            {todays.length === 1 ? 'You have 1 appointment today' : `You have ${todays.length} appointments today`}
          </h1>
          <div className="mt-6 grid max-w-md grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
              <p className="text-xs text-brand-100">Collected today</p>
              <p className="mt-1 text-xl font-semibold">{formatINR(collectedToday)}</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
              <p className="text-xs text-brand-100">Patients</p>
              <p className="mt-1 text-xl font-semibold">{data.patients.length}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard label={`Income, ${monthLabel(month)}`} value={formatINR(monthIncome)} icon={TrendingUp} tone="success" />
        <StatCard label="Expenses this month" value={formatINR(monthExpenses)} icon={TrendingDown} tone="error" />
        <StatCard label="Pending dues" value={formatINR(outstanding)} icon={Wallet} tone={outstanding > 0 ? 'warning' : 'success'} />
        <StatCard label="Visits today" value={String(todays.length)} icon={Users} tone="accent" />
      </section>

      <section className="grid gap-4 lg:grid-cols-5">
        <div className={`${cardClass} flex flex-col justify-between p-6 lg:col-span-2`}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-slate-500">Monthly income target</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{target > 0 ? `${progress}% reached` : 'Not set yet'}</p>
            </div>
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
              <Target size={20} aria-hidden="true" />
            </span>
          </div>
          {target > 0 && (
            <>
              <div className="mt-6 h-2.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-brand-400 to-accent-500 transition-all duration-700"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="mt-3 text-xs text-slate-500">
                {formatINR(monthIncome)} of {formatINR(target)} collected this month
              </p>
            </>
          )}
          <button type="button" onClick={() => setDialog('target')} className={`${secondaryButton} mt-6 self-start`}>
            {target > 0 ? 'Change target' : 'Set target'}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:col-span-3 lg:gap-4">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.key}
                type="button"
                onClick={() => setDialog(action.key)}
                className={`${cardClass} group flex flex-col items-start gap-4 p-5 text-left transition hover:-translate-y-1 hover:shadow-lg active:scale-[0.98]`}
              >
                <span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${action.tile}`}>
                  <Icon size={20} aria-hidden="true" />
                </span>
                <span>
                  <span className="block font-semibold text-slate-900">{action.label}</span>
                  <span className="block text-xs text-slate-500">{action.hint}</span>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900">Today’s schedule</h2>
          <button type="button" onClick={() => onNavigate('appointments')} className={chipButton}>
            View all
            <ArrowRight size={14} aria-hidden="true" />
          </button>
        </div>
        <AppointmentList
          appointments={todays}
          onOpenPatient={(patientId) => onNavigate('patients', patientId)}
          emptyText="No visits scheduled for today."
        />
      </section>

      {dialog && (
        <Modal title={DIALOG_TITLES[dialog]} onClose={close}>
          {dialog === 'patient' && <PatientForm onDone={close} />}
          {dialog === 'appointment' && <AppointmentForm onDone={close} />}
          {dialog === 'bill' && <BillForm onDone={close} />}
          {dialog === 'expense' && <ExpenseForm onDone={close} />}
          {dialog === 'target' && <TargetForm onDone={close} />}
        </Modal>
      )}
    </div>
  );
}
