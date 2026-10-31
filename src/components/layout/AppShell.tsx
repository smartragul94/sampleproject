import type { ReactNode } from 'react';
import { CalendarDays, LayoutDashboard, LogOut, Receipt, Users, Wallet, type LucideIcon } from 'lucide-react';
import Logo from '@/components/brand/Logo';
import InstallButton from '@/components/ui/InstallButton';
import { iconButton, secondaryButton } from '@/lib/ui';
import type { ViewKey } from '@/types/clinic';

const NAV: { key: ViewKey; label: string; icon: LucideIcon }[] = [
  { key: 'home', label: 'Home', icon: LayoutDashboard },
  { key: 'appointments', label: 'Appointments', icon: CalendarDays },
  { key: 'patients', label: 'Patients', icon: Users },
  { key: 'billing', label: 'Billing', icon: Receipt },
  { key: 'accounts', label: 'Accounts', icon: Wallet },
];

interface AppShellProps {
  view: ViewKey;
  userName: string;
  onNavigate: (view: ViewKey) => void;
  onLogout: () => void;
  children: ReactNode;
}

export default function AppShell({ view, userName, onNavigate, onLogout, children }: AppShellProps) {
  const bottomOffset = { bottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)' };

  return (
    <div className="min-h-dvh">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col border-r border-white/70 bg-white/70 p-5 backdrop-blur-xl md:flex">
        <Logo />
        <nav className="mt-10 flex flex-col gap-1.5" aria-label="Main">
          {NAV.map((item) => {
            const active = view === item.key;
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => onNavigate(item.key)}
                aria-current={active ? 'page' : undefined}
                className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition ${
                  active
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-600/25'
                    : 'text-slate-600 hover:translate-x-1 hover:bg-white hover:text-slate-900'
                }`}
              >
                <Icon size={18} aria-hidden="true" />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="mt-auto space-y-3">
          <div className="rounded-2xl bg-brand-50 p-4">
            <p className="text-xs font-medium text-slate-500">Signed in as</p>
            <p className="truncate text-sm font-semibold text-slate-800">{userName || 'Clinic team'}</p>
          </div>
          <InstallButton className="w-full" />
          <button type="button" onClick={onLogout} className={`${secondaryButton} w-full`}>
            <LogOut size={16} aria-hidden="true" />
            Log out
          </button>
        </div>
      </aside>

      <header
        className="sticky top-0 z-10 border-b border-white/70 bg-white/85 backdrop-blur-xl md:hidden"
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
      >
        <div className="flex items-center justify-between px-4 py-3">
          <Logo subtitle={false} />
          <button type="button" onClick={onLogout} aria-label="Log out" className={iconButton}>
            <LogOut size={18} aria-hidden="true" />
          </button>
        </div>
      </header>

      <main className="px-4 pb-32 pt-6 sm:px-6 md:ml-64 md:pb-12 md:pt-10 lg:px-10">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>

      <nav
        className="fixed inset-x-3 z-20 flex rounded-2xl border border-white/80 bg-white/90 p-1.5 shadow-xl shadow-slate-900/10 backdrop-blur-xl md:hidden"
        style={bottomOffset}
        aria-label="Main mobile"
      >
        {NAV.map((item) => {
          const active = view === item.key;
          const Icon = item.icon;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onNavigate(item.key)}
              aria-current={active ? 'page' : undefined}
              className={`flex flex-1 flex-col items-center gap-1 rounded-xl py-2 text-[11px] font-semibold transition active:scale-95 ${
                active ? 'bg-brand-50 text-brand-700' : 'text-slate-500'
              }`}
            >
              <Icon size={19} aria-hidden="true" />
              {item.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
