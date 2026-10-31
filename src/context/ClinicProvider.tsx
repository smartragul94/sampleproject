import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { ClinicContext, type ClinicContextValue } from '@/context/clinicContext';
import Spinner from '@/components/ui/Spinner';
import { fetchClinicData } from '@/lib/api/load';
import { errorMessage } from '@/lib/errors';
import { primaryButton } from '@/lib/ui';
import type { ClinicData } from '@/types/clinic';

type Task = () => Promise<unknown>;

export default function ClinicProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<ClinicData | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setData(await fetchClinicData());
  }, []);

  const retryLoad = useCallback(() => {
    setLoadError(null);
    reload().catch((error: unknown) => setLoadError(errorMessage(error)));
  }, [reload]);

  useEffect(() => {
    retryLoad();
  }, [retryLoad]);

  const save = useCallback(
    async (task: Task) => {
      await task();
      await reload();
    },
    [reload],
  );

  const runAction = useCallback(
    async (task: Task) => {
      setActionError(null);
      try {
        await save(task);
      } catch (error) {
        setActionError(errorMessage(error));
      }
    },
    [save],
  );

  const dismissActionError = useCallback(() => setActionError(null), []);

  const value = useMemo<ClinicContextValue | null>(
    () => (data ? { data, save, runAction, actionError, dismissActionError } : null),
    [data, save, runAction, actionError, dismissActionError],
  );

  if (!value) {
    if (!loadError) {
      return (
        <div className="flex min-h-dvh items-center justify-center">
          <Spinner />
        </div>
      );
    }
    return (
      <div className="flex min-h-dvh items-center justify-center px-6">
        <div className="max-w-sm space-y-4 text-center">
          <h1 className="text-xl font-bold text-slate-900">We could not load your clinic data</h1>
          <p className="text-sm text-slate-500">{loadError}</p>
          <button type="button" onClick={retryLoad} className={primaryButton}>
            Try again
          </button>
        </div>
      </div>
    );
  }

  return <ClinicContext.Provider value={value}>{children}</ClinicContext.Provider>;
}
