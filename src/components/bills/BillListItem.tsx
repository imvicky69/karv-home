import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheckCircle, FiAlertTriangle, FiClock, FiChevronDown, FiDownload } from 'react-icons/fi';
import { toast } from 'react-toastify';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Import our other components
import Receipt from './Receipt';
import type { Bill } from '../../types/bill';
interface Tenant {
  displayName?: string | null;
  email?: string | null;
}

interface BillListItemProps {
  bill: Bill;
  tenant?: Tenant; // The current user object from useAuth(); optional here
}

// Helper object to manage status styles and icons
const statusConfig = {
  paid: { icon: FiCheckCircle, color: 'text-success', bgColor: 'bg-success/10', text: 'Paid' },
  overdue: { icon: FiAlertTriangle, color: 'text-danger', bgColor: 'bg-danger/10', text: 'Overdue' },
  due: { icon: FiClock, color: 'text-yellow-500', bgColor: 'bg-yellow-500/10', text: 'Due' },
  default: { icon: FiClock, color: 'text-text-secondary', bgColor: 'bg-gray-500/10', text: 'Unknown' }
};

const BillListItem = ({ bill, tenant }: BillListItemProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPaying, setIsPaying] = useState(false);

  const receiptId = `receipt-${bill.id}`;

  // --- RECEIPT LOGIC ---
  const handleDownloadReceipt = async () => {
    setIsGenerating(true);
    const receiptElement = document.getElementById(receiptId);
    if (!receiptElement) return;

    try {
      const canvas = await html2canvas(receiptElement, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Receipt-${bill.billId}.pdf`);
    } catch (err) {
      console.error('Receipt generation error', err);
      toast.error('Failed to generate receipt.');
    } finally {
      setIsGenerating(false);
    }
  };

  // --- PAYMENT LOGIC ---
  const handlePayNow = async () => {
    setIsPaying(true);
    try {
      const response = await fetch('https://us-central1-indivio-in.cloudfunctions.net/api/payment/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: String(bill.totalAmount) }),
      });
      const data = await response.json();
      if (data.success && data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        toast.error('Payment initiation failed.');
      }
    } catch (err) {
      console.error('Payment initiation error', err);
      toast.error('Payment initiation failed.');
    } finally {
      setIsPaying(false);
    }
  };

  const statusToUse = bill.status;
  const config = statusConfig[statusToUse as keyof typeof statusConfig] || statusConfig.default;
  const Icon = config.icon;
  const billMonth = bill.billDate.toDate().toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <>
      <div style={{ position: 'absolute', left: '-9999px', top: 0, zIndex: -1 }}>
        <Receipt bill={bill} tenant={tenant ?? null} receiptId={receiptId} />
      </div>

      <motion.div layout className="bg-surface rounded-xl shadow-md overflow-hidden">
        <div 
          className="flex items-center justify-between p-4 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center">
            <div className={`p-3 rounded-full ${config.bgColor}`}>
              <Icon className={config.color} size={24} />
            </div>
            <div className="ml-4">
              <p className="font-bold text-text-primary">{bill.billId}</p>
              <p className={`text-sm font-semibold ${config.color}`}>{config.text}</p>
            </div>
          </div>
          <div className="flex items-center">
            <p className="text-lg font-bold text-text-primary mr-4">₹{bill.totalAmount}</p>
            <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.3 }}>
              <FiChevronDown size={20} className="text-text-secondary" />
            </motion.div>
          </div>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="px-4 pb-4 border-t border-gray-200"
            >
              <div className="pt-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-text-secondary">Unit</span><span className="font-semibold">{bill.unitName}</span></div>
                <div className="flex justify-between"><span className="text-text-secondary">Bill for</span><span className="font-semibold">{billMonth}</span></div>
                <div className="flex justify-between"><span className="text-text-secondary">Due Date</span><span className="font-semibold">{bill.dueDate.toDate().toLocaleDateString()}</span></div>
              </div>
              
              <div className="mt-4 space-y-2">
                {statusToUse === 'paid' && (
                  <button 
                    onClick={handleDownloadReceipt}
                    disabled={isGenerating}
                    className="w-full flex items-center justify-center font-semibold bg-white border border-gray-300 rounded-lg py-2 px-4 hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    <FiDownload className="mr-2" />
                    {isGenerating ? 'Generating...' : 'Download Receipt'}
                  </button>
                )}
                
                {(statusToUse === 'due' || statusToUse === 'overdue') && (
                  <>
                    <button
                      onClick={handlePayNow}
                      disabled={isPaying}
                      className="w-full flex items-center justify-center font-semibold bg-primary text-white rounded-lg py-2 px-4 hover:bg-primary-dark transition-colors disabled:opacity-50"
                    >
                      {isPaying ? 'Processing...' : 'Pay Now'}
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
};

export default BillListItem;