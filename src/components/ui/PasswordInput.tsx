import { useState, type ChangeEventHandler } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { fieldClass } from '@/lib/ui';

interface PasswordInputProps {
  value: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
  autoComplete: 'current-password' | 'new-password';
  minLength?: number;
}

export default function PasswordInput({ value, onChange, autoComplete, minLength = 6 }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} aria-hidden="true" />
      <input
        type={visible ? 'text' : 'password'}
        required
        minLength={minLength}
        autoComplete={autoComplete}
        value={value}
        onChange={onChange}
        className={`${fieldClass} pl-10 pr-11`}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        aria-pressed={visible}
        className="absolute right-1.5 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:text-slate-700"
      >
        {visible ? <EyeOff size={17} aria-hidden="true" /> : <Eye size={17} aria-hidden="true" />}
      </button>
    </div>
  );
}
