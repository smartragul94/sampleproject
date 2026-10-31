import { useState, type ChangeEvent, type FormEvent } from 'react';
import { ArrowLeft, ArrowRight, Mail, User } from 'lucide-react';
import Logo from '@/components/brand/Logo';
import { Field, FormError } from '@/components/ui/FormControls';
import InstallButton from '@/components/ui/InstallButton';
import PasswordInput from '@/components/ui/PasswordInput';
import { useSubmit } from '@/hooks/useSubmit';
import { sendPasswordReset, signIn, signUp } from '@/lib/auth';
import { fieldClass, cardClass, primaryButton } from '@/lib/ui';

type Mode = 'signin' | 'signup' | 'forgot';

const COPY: Record<Mode, { title: string; subtitle: string; submit: string }> = {
  signin: {
    title: 'Welcome back',
    subtitle: 'Sign in to manage today’s patients, appointments and bills.',
    submit: 'Sign in',
  },
  signup: {
    title: 'Create your account',
    subtitle: 'Set up your login for the Vedanthika clinic workspace.',
    submit: 'Create account',
  },
  forgot: {
    title: 'Reset your password',
    subtitle: 'Enter your email and we will send you a link to choose a new password.',
    submit: 'Send reset link',
  },
};

const HIGHLIGHTS = [
  'Book and track appointments in one calendar',
  'Case sheets, prescriptions and visit history',
  'Bills, payments and monthly income at a glance',
];

export default function AuthScreen() {
  const [mode, setMode] = useState<Mode>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [notice, setNotice] = useState<string | null>(null);
  const { saving, error, submit, clearError } = useSubmit();
  const copy = COPY[mode];

  const switchMode = (next: Mode) => {
    setMode(next);
    setNotice(null);
    clearError();
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNotice(null);
    void submit(async () => {
      const cleanEmail = email.trim();
      if (mode === 'signin') {
        await signIn(cleanEmail, password);
        return;
      }
      if (mode === 'forgot') {
        await sendPasswordReset(cleanEmail);
        setNotice('If an account exists for this email, a reset link is on its way. Check your inbox.');
        return;
      }
      const hasSession = await signUp(name.trim(), cleanEmail, password);
      if (!hasSession) {
        setMode('signin');
        setPassword('');
        setNotice('Account created. Please confirm your email using the link we sent, then sign in.');
      }
    });
  };

  const onChange = (setter: (value: string) => void) => (event: ChangeEvent<HTMLInputElement>) =>
    setter(event.target.value);

  return (
    <div className="relative min-h-dvh overflow-hidden">
      <div className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-brand-400/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-accent-400/30 blur-3xl" />

      <div className="relative mx-auto grid min-h-dvh max-w-6xl items-center gap-12 px-5 py-10 lg:grid-cols-2 lg:px-10">
        <section className="hidden animate-fade-up lg:block">
          <Logo />
          <h1 className="mt-12 text-4xl font-bold leading-tight tracking-tight text-slate-900">
            Your clinic, <span className="text-brand-600">beautifully organised.</span>
          </h1>
          <ul className="mt-8 space-y-4">
            {HIGHLIGHTS.map((item) => (
              <li key={item} className="flex items-center gap-3 text-slate-600">
                <span className="h-2 w-2 rounded-full bg-accent-500" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="mx-auto w-full max-w-md animate-fade-up">
          <div className={`${cardClass} p-7 sm:p-8`}>
            <div className="mb-6 flex justify-center lg:hidden">
              <Logo />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">{copy.title}</h2>
            <p className="mt-1 text-sm text-slate-500">{copy.subtitle}</p>

            {mode === 'forgot' ? (
              <button
                type="button"
                onClick={() => switchMode('signin')}
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-800"
              >
                <ArrowLeft size={15} aria-hidden="true" />
                Back to sign in
              </button>
            ) : (
              <div role="tablist" className="mt-6 grid grid-cols-2 rounded-xl bg-slate-100 p-1">
                {(['signin', 'signup'] as const).map((item) => (
                  <button
                    key={item}
                    type="button"
                    role="tab"
                    aria-selected={mode === item}
                    onClick={() => switchMode(item)}
                    className={`rounded-lg py-2 text-sm font-semibold transition ${
                      mode === item ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {item === 'signin' ? 'Sign in' : 'New account'}
                  </button>
                ))}
              </div>
            )}

            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              {mode === 'signup' && (
                <Field label="Your name">
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} aria-hidden="true" />
                    <input
                      required
                      autoComplete="name"
                      value={name}
                      onChange={onChange(setName)}
                      className={`${fieldClass} pl-10`}
                    />
                  </div>
                </Field>
              )}
              <Field label="Email">
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} aria-hidden="true" />
                  <input
                    type="email"
                    inputMode="email"
                    autoCapitalize="none"
                    autoCorrect="off"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={onChange(setEmail)}
                    className={`${fieldClass} pl-10`}
                  />
                </div>
              </Field>
              {mode !== 'forgot' && (
                <Field label="Password">
                  <PasswordInput
                    value={password}
                    onChange={onChange(setPassword)}
                    autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                  />
                  {mode === 'signup' && <span className="block text-xs text-slate-500">At least 6 characters.</span>}
                </Field>
              )}
              {mode === 'signin' && (
                <div className="-mt-1 text-right">
                  <button
                    type="button"
                    onClick={() => switchMode('forgot')}
                    className="text-sm font-semibold text-brand-700 hover:text-brand-800"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              <FormError message={error} />
              {notice && (
                <p role="status" className="rounded-xl bg-success-100 px-3.5 py-2.5 text-sm font-medium text-success-700">
                  {notice}
                </p>
              )}

              <button type="submit" disabled={saving} className={`${primaryButton} w-full py-3`}>
                {saving ? 'Please wait...' : copy.submit}
                {!saving && <ArrowRight size={16} aria-hidden="true" />}
              </button>
            </form>

            <InstallButton className="mt-4 w-full" />
          </div>
        </section>
      </div>
    </div>
  );
}
