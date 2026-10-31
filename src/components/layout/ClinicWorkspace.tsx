import { useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import AccountsView from '@/views/AccountsView';
import AppointmentsView from '@/views/AppointmentsView';
import BillingView from '@/views/BillingView';
import HomeView from '@/views/HomeView';
import PatientDetailView from '@/views/PatientDetailView';
import PatientsView from '@/views/PatientsView';
import { useClinic } from '@/context/clinicContext';
import { signOut } from '@/lib/auth';
import { errorMessage } from '@/lib/errors';
import { cardClass, iconButton } from '@/lib/ui';
import type { ViewKey } from '@/types/clinic';
import { X } from 'lucide-react';

interface ClinicWorkspaceProps {
  userName: string;
}

export default function ClinicWorkspace({ userName }: ClinicWorkspaceProps) {
  const { actionError, dismissActionError } = useClinic();
  const [view, setView] = useState<ViewKey>('home');
  const [patientId, setPatientId] = useState<string | null>(null);
  const [logoutError, setLogoutError] = useState<string | null>(null);

  const navigate = (next: ViewKey, nextPatientId?: string) => {
    setView(next);
    setPatientId(nextPatientId ?? null);
    window.scrollTo({ top: 0 });
  };

  const openPatient = (id: string) => navigate('patients', id);

  const logout = () => {
    setLogoutError(null);
    signOut().catch((error: unknown) => setLogoutError(errorMessage(error)));
  };

  const errorText = actionError ?? logoutError;
  const dismissError = () => {
    dismissActionError();
    setLogoutError(null);
  };

  const renderView = () => {
    switch (view) {
      case 'home':
        return <HomeView userName={userName} onNavigate={navigate} />;
      case 'appointments':
        return <AppointmentsView onOpenPatient={openPatient} />;
      case 'patients':
        return patientId ? (
          <PatientDetailView patientId={patientId} onBack={() => navigate('patients')} />
        ) : (
          <PatientsView onOpenPatient={openPatient} />
        );
      case 'billing':
        return <BillingView onOpenPatient={openPatient} />;
      case 'accounts':
        return <AccountsView />;
    }
  };

  return (
    <AppShell view={view} userName={userName} onNavigate={navigate} onLogout={logout}>
      {errorText && (
        <div
          role="alert"
          className={`${cardClass} mb-6 flex items-start justify-between gap-3 border-error-100 bg-error-50/90 p-4 text-sm font-medium text-error-700 animate-fade-up`}
        >
          <p>{errorText}</p>
          <button type="button" aria-label="Dismiss" onClick={dismissError} className={iconButton}>
            <X size={16} aria-hidden="true" />
          </button>
        </div>
      )}
      {renderView()}
    </AppShell>
  );
}
