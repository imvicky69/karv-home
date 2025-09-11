import { Modal } from 'react-responsive-modal';
import 'react-responsive-modal/styles.css'; // Import the styles
import { FiX, FiZap } from 'react-icons/fi';
import logo from '../../assets/logo.png';

import type { Bill } from '../../types/bill';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  bill: Bill | null;
  onConfirm: () => void;
  isLoading: boolean;
}

const PaymentModal = ({ isOpen, onClose, bill, onConfirm, isLoading }: PaymentModalProps) => {
  if (!bill) return null;

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      center
      classNames={{
        modal: 'custom-modal rounded-2xl p-0',
        closeButton: 'hidden',
      }}
    >
      <div className="p-8 max-w-sm">
        <div className="flex justify-between items-center mb-6">
          <img src={logo} alt="KARV Logo" className="w-24" />
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
            <FiX className="text-text-secondary" />
          </button>
        </div>
        
        <div className="text-center">
          <p className="text-text-secondary">You are paying for</p>
          <h2 className="text-2xl font-bold text-text-primary">{bill.billId}</h2>
          <p className="text-5xl font-bold text-primary my-4">₹{bill.totalAmount}</p>
        </div>

        <div className="bg-primary/10 p-4 rounded-lg text-sm text-primary my-6">
          You will be securely redirected to PhonePe to complete your payment.
        </div>

        <button 
          onClick={onConfirm}
          disabled={isLoading}
          className="w-full button-primary flex items-center justify-center"
        >
          <FiZap className="mr-2" />
          {isLoading ? 'Processing...' : 'Proceed to Pay Securely'}
        </button>
      </div>
    </Modal>
  );
};

export default PaymentModal;