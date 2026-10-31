import { useState } from 'react';
import { Download, Share, X } from 'lucide-react';
import { useInstallPrompt } from '@/hooks/useInstallPrompt';
import { secondaryButton } from '@/lib/ui';

export default function InstallButton({ className = '' }: { className?: string }) {
  const { canInstall, showIosHint, install } = useInstallPrompt();
  const [hintOpen, setHintOpen] = useState(false);

  if (canInstall) {
    return (
      <button type="button" onClick={() => void install()} className={`${secondaryButton} ${className}`}>
        <Download size={16} aria-hidden="true" />
        Install app
      </button>
    );
  }

  if (showIosHint) {
    return (
      <div className={className}>
        <button type="button" onClick={() => setHintOpen((o) => !o)} className={`${secondaryButton} w-full`}>
          <Download size={16} aria-hidden="true" />
          Install app
        </button>
        {hintOpen && (
          <div className="mt-2 flex items-start justify-between gap-3 rounded-xl bg-brand-50 p-3 text-xs leading-relaxed text-slate-600">
            <p>
              Tap the <Share size={13} className="mx-0.5 inline -translate-y-px" aria-hidden="true" />
              <strong> Share </strong> button in Safari, then choose <strong>Add to Home Screen</strong>.
            </p>
            <button type="button" aria-label="Close" onClick={() => setHintOpen(false)} className="text-slate-400">
              <X size={14} aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    );
  }

  return null;
}
