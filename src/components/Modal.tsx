import type { ReactNode } from 'react';
import { X } from 'lucide-react';
import { useEscapeClose } from '../lib/useEscapeClose';
import { useFocusTrap } from '../lib/useFocusTrap';

interface ModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
}

export function Modal({ title, onClose, children }: ModalProps) {
  useEscapeClose(onClose);
  const ref = useFocusTrap<HTMLDivElement>();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" ref={ref} role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose} aria-label="Cerrar">
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
