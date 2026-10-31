import { useState, type FormEvent } from 'react';
import { KeyRound } from 'lucide-react';
import Logo from '@/components/brand/Logo';
import { Field, FormError } from '@/components/ui/FormControls';
import PasswordInput from '@/components/ui/PasswordInput';
import { useSubmit } from '@/hooks/useSubmit';
import { updatePassword } from '@/lib/auth';
import { cardClass, primaryButton } from '@/lib/ui';

export default function UpdatePasswordScreen({ onDone }: { onDone: () => void }) {
  const [password, setPassword] = useState('');
  const { saving, error, submit } = useSubmit();

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void submit(async () => {
      await updatePassword(password);
      onDone();
    });
  };

  return (
    <div className="flex min-h-dvh items-center justify-center px-5 py-10">
      <div className={`${cardClass} w-full max-w-md animate-fade-up p-7 sm:p-8`}>
        <div className="mb-6 flex justify-center">
          <Logo />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Set a new password</h1>
        <p className="mt-1 text-sm text-slate-500">Choose a new password for your clinic account.</p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <Field label="New password">
            <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
            <span className="block text-xs text-slate-500">At least 6 characters.</span>
          </Field>
          <FormError message={error} />
          <button type="submit" disabled={saving} className={`${primaryButton} w-full py-3`}>
            <KeyRound size={16} aria-hidden="true" />
            {saving ? 'Please wait...' : 'Update password'}
          </button>
        </form>
      </div>
    </div>
  );
}
