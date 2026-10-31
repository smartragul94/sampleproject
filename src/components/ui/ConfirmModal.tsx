import Modal from '@/components/ui/Modal';
import { dangerButton, secondaryButton } from '@/lib/ui';

interface ConfirmModalProps {
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({ title, message, confirmLabel, onConfirm, onCancel }: ConfirmModalProps) {
  return (
    <Modal title={title} onClose={onCancel}>
      <div className="space-y-6">
        <p className="text-sm leading-relaxed text-slate-600">{message}</p>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={onCancel} className={secondaryButton}>
            Keep it
          </button>
          <button type="button" onClick={onConfirm} className={dangerButton}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
