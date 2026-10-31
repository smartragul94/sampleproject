import AuthScreen from '@/components/auth/AuthScreen';
import UpdatePasswordScreen from '@/components/auth/UpdatePasswordScreen';
import ClinicWorkspace from '@/components/layout/ClinicWorkspace';
import Spinner from '@/components/ui/Spinner';
import ClinicProvider from '@/context/ClinicProvider';
import { useSession } from '@/hooks/useSession';
import { isSupabaseConfigured } from '@/lib/supabase';

export default function App() {
  if (!isSupabaseConfigured) return <MissingConfig />;
  return <AppContent />;
}

function MissingConfig() {
  return (
    <div className="flex min-h-dvh items-center justify-center px-6">
      <div className="max-w-md space-y-3 text-center">
        <h1 className="text-xl font-bold text-slate-900">Setup needed</h1>
        <p className="text-sm text-slate-500">
          Add <code className="rounded bg-slate-100 px-1">VITE_SUPABASE_URL</code> and{' '}
          <code className="rounded bg-slate-100 px-1">VITE_SUPABASE_ANON_KEY</code> to your environment (.env file or hosting
          settings), then rebuild the app.
        </p>
      </div>
    </div>
  );
}

function AppContent() {
  const { session, loading, recovering, finishRecovery } = useSession();

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!session) return <AuthScreen />;
  if (recovering) return <UpdatePasswordScreen onDone={finishRecovery} />;

  const fullName = session.user.user_metadata.full_name;
  const userName = typeof fullName === 'string' && fullName.trim() ? fullName : (session.user.email ?? '');

  return (
    <ClinicProvider>
      <ClinicWorkspace userName={userName} />
    </ClinicProvider>
  );
}
