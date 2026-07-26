import { Printer } from 'lucide-react';
import { Modal } from './Modal';
import { formatCurrency, formatDate } from '../lib/format';
import type { Payment } from '../data/types';

interface PaymentReceiptProps {
  payment: Payment;
  memberName: string;
  onClose: () => void;
}

export function PaymentReceipt({ payment, memberName, onClose }: PaymentReceiptProps) {
  return (
    <Modal title="Recibo de pago" onClose={onClose}>
      <div className="receipt-print-area">
        <div className="receipt-brand">
          VUL<span>KAN</span>
        </div>
        <p className="receipt-sub">Comprobante de pago</p>

        <div className="receipt-row">
          <span>Recibo #</span>
          <strong>{payment.id}</strong>
        </div>
        <div className="receipt-row">
          <span>Miembro</span>
          <strong>{memberName}</strong>
        </div>
        <div className="receipt-row">
          <span>Plan</span>
          <strong>{payment.plan}</strong>
        </div>
        <div className="receipt-row">
          <span>Fecha</span>
          <strong>{formatDate(payment.date)}</strong>
        </div>
        <div className="receipt-row">
          <span>Estado</span>
          <strong style={{ textTransform: 'capitalize' }}>{payment.status}</strong>
        </div>
        <div className="receipt-total">
          <span>Total</span>
          <strong>{formatCurrency(payment.amount)}</strong>
        </div>
      </div>

      <div className="modal-actions no-print">
        <button type="button" className="btn btn-outline" onClick={onClose}>
          Cerrar
        </button>
        <button type="button" className="btn btn-primary" onClick={() => window.print()}>
          <Printer size={14} /> Imprimir
        </button>
      </div>
    </Modal>
  );
}
