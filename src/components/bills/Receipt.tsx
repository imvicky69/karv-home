import logo from '../../assets/logo.png'; // Your logo
import type { Bill } from '../../types/bill';
import { FiCheckCircle, FiCalendar, FiHome } from 'react-icons/fi';

interface Tenant {
  displayName?: string | null;
  email?: string | null;
}

interface ReceiptProps {
  bill: Bill;
  tenant: Tenant | null;
  receiptId: string; // The ID of the div, used for targeting
}

const ICON_SIZE = 16; // consistent icon size for alignment

const Receipt = ({ bill, tenant, receiptId }: ReceiptProps) => {
  const paymentDate = new Date();
  const billMonth = bill.billDate?.toDate?.().toLocaleString('default', { month: 'long', year: 'numeric' }) ?? '';
  const dueDate = bill.dueDate?.toDate?.();
  const rent = Number(bill.rentAmount ?? 0);
  const overdue = Number(bill.overdueCharges ?? 0);
  const total = Number(bill.totalAmount ?? rent + overdue);
  // Determine paid status: prefer explicit flag if present, otherwise assume paid when totalAmount > 0
  const isPaid = bill.status === 'paid';

  // Small helper to render an icon + label with aligned layout
  const Label = ({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) => (
    <div className="flex items-center text-sm text-gray-700">
      <span className="flex items-center justify-center w-5 h-5 mr-2 flex-shrink-0">{icon}</span>
      <span>{children}</span>
    </div>
  );

  return (
    <div
      id={receiptId}
      className="p-6 bg-white text-black w-[780px] mx-auto shadow-lg border border-gray-200" 
      style={{ fontFamily: 'Inter, Arial, sans-serif' }}
    >
      {/* Header */}
      <header className="flex justify-between items-start pb-4 border-b border-gray-100">
        <div className="flex items-center">
          <img src={logo} alt="KARV Logo" className="w-28 h-auto" />
          <div className="ml-3">
            <h1 className="text-2xl font-semibold text-primary">KARV Homes</h1>
            <p className="text-xs text-gray-500">Property Management</p>
          </div>
        </div>

        <div className="text-right">
          <div className="inline-flex items-center bg-primary/10 text-primary px-3 py-2 rounded-md">
            <FiCheckCircle size={18} className="mr-2 text-green-600" />
            <div className="text-sm font-semibold">RECEIPT</div>
          </div>
          <div className="mt-2 text-xs text-gray-600">
            <div>Receipt #: <span className="font-medium">{bill.billId}</span></div>
            <div>Issued: <span className="font-medium">{paymentDate.toLocaleDateString()}</span></div>
          </div>
        </div>
      </header>

      {/* Main rows */}
      <section className="grid grid-cols-2 gap-4 mt-5">
        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="text-sm font-semibold text-gray-800 mb-2">Billed To</h3>
          <div className="space-y-1">
            <div className="text-sm font-medium">{tenant?.displayName ?? 'Tenant'}</div>
            <div className="text-xs text-gray-600">{tenant?.email ?? ''}</div>
            <div className="text-xs text-gray-600">Unit: {bill.unitName}</div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="text-sm font-semibold text-gray-800 mb-2">Details</h3>
          <div className="space-y-2">
            <Label icon={<FiCalendar size={ICON_SIZE} className="text-primary" />}>Period: <span className="font-medium ml-1">{billMonth || '—'}</span></Label>
            <Label icon={<FiCalendar size={ICON_SIZE} className="text-gray-500" />}>Due: <span className="font-medium ml-1">{dueDate ? dueDate.toLocaleDateString() : '—'}</span></Label>
            <Label icon={<FiCheckCircle size={ICON_SIZE} className="text-green-600" />}>Status: <span className="font-medium ml-1">{isPaid ? 'Paid' : 'Pending'}</span></Label>
          </div>
        </div>
      </section>

      {/* Breakdown */}
      <div className="mt-6">
        <div className="text-sm font-semibold text-gray-800 mb-2">Payment Breakdown</div>
        <div className="bg-white border border-gray-100 rounded-md overflow-hidden">
          <div className="flex items-center justify-between p-3 text-sm">
            <div className="flex items-center">
              <span className="flex items-center justify-center w-5 h-5 mr-3 flex-shrink-0"><FiHome size={ICON_SIZE} className="text-primary" /></span>
              <div>
                <div className="font-medium">Monthly Rent</div>
                <div className="text-xs text-gray-500">{bill.unitName}</div>
              </div>
            </div>
            <div className="font-medium">₹{rent.toFixed(2)}</div>
          </div>

          {overdue > 0 && (
            <div className="flex items-center justify-between p-3 text-sm bg-red-50">
              <div className="flex items-center">
                <span className="flex items-center justify-center w-5 h-5 mr-3 flex-shrink-0 text-red-600">⚠️</span>
                <div>
                  <div className="font-medium text-red-700">Overdue Charges</div>
                  <div className="text-xs text-red-600">Late fee</div>
                </div>
              </div>
              <div className="font-medium text-red-700">₹{overdue.toFixed(2)}</div>
            </div>
          )}
        </div>
      </div>

      {/* Total */}
      <div className="flex justify-end mt-4">
        <div className="w-64 bg-gray-50 p-3 rounded-md border border-gray-100">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <div>Subtotal</div>
            <div>₹{(rent + overdue).toFixed(2)}</div>
          </div>
          <div className="flex justify-between text-lg font-semibold text-primary">
            <div>Total</div>
            <div>₹{total.toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* Small footer */}
      <footer className="mt-6 text-center text-xs text-gray-500">
        Thank you for your payment. For support, email <a href="mailto:support@karvhomes.com" className="text-primary underline">support@karvhomes.com</a>
      </footer>
    </div>
  );
};

export default Receipt;