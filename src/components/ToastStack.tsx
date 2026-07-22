import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useToast, type ToastType } from '../context/ToastContext';

const iconByType: Record<ToastType, typeof CheckCircle2> = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

export function ToastStack() {
  const { toasts, dismissToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="toast-stack">
      {toasts.map((t) => {
        const Icon = iconByType[t.type];
        return (
          <div key={t.id} className={`toast toast-${t.type}`}>
            <Icon size={18} />
            <span>{t.message}</span>
            <button className="toast-close" onClick={() => dismissToast(t.id)} aria-label="Cerrar notificación">
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
