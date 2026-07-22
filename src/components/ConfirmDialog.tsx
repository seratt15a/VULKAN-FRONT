import { AlertTriangle } from 'lucide-react';
import { useEscapeClose } from '../lib/useEscapeClose';
import { useFocusTrap } from '../lib/useFocusTrap';

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ title, message, confirmLabel = 'Eliminar', onConfirm, onCancel }: ConfirmDialogProps) {
  useEscapeClose(onCancel);
  const ref = useFocusTrap<HTMLDivElement>();

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal confirm-dialog" ref={ref} role="alertdialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}>
        <div className="confirm-icon">
          <AlertTriangle size={22} />
        </div>
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="modal-actions" style={{ justifyContent: 'center' }}>
          <button className="btn btn-outline" onClick={onCancel}>
            Cancelar
          </button>
          <button className="btn btn-danger-solid" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
