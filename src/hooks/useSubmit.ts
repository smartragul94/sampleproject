import { useState } from 'react';
import { errorMessage } from '@/lib/errors';

export function useSubmit() {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (task: () => Promise<void>) => {
    setSaving(true);
    setError(null);
    try {
      await task();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const clearError = () => setError(null);

  return { saving, error, submit, clearError };
}
