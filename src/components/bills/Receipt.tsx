import logo from '../../assets/logo.png'; // Your logo
import type { Bill } from '../../types/bill';

interface Tenant {
  displayName?: string | null;
  email?: string | null;
}

interface ReceiptProps {
  bill: Bill;
  tenant: Tenant | null;
  receiptId: string; // The ID of the div, used for targeting
}

const Receipt = ({ bill, tenant, receiptId }: ReceiptProps) => {
  const paymentDate = bill.paymentDate ? bill.paymentDate.toDate() : new Date();
  const billMonth = bill.billDate.toDate().toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    // This div is the container that we will "screenshot"
    <div id={receiptId} className="p-8 bg-white text-black w-[800px]">
      <header className="flex justify-between items-center pb-4 border-b">
        <img src={logo} alt="KARV Logo" className="w-40" />
        <div className="text-right">
          <h1 className="text-4xl font-bold uppercase text-gray-800">Receipt</h1>
          <p className="text-gray-500">Receipt #: {bill.billId}</p>
        </div>
      </header>

      <section className="flex justify-between my-8">
        <div>
          <h2 className="font-bold text-gray-600">Bill To:</h2>
          <p>{tenant?.displayName}</p>
          <p>{tenant?.email}</p>
        </div>
        <div className="text-right">
          <p><span className="font-bold text-gray-600">Payment Date:</span> {paymentDate.toLocaleDateString()}</p>
          <p><span className="font-bold text-gray-600">Bill For:</span> {billMonth}</p>
        </div>
      </section>

      <table className="w-full text-left">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-3 font-bold text-gray-600">Description</th>
            <th className="p-3 font-bold text-gray-600 text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="p-3 border-b">Rent for {bill.unitName}</td>
            <td className="p-3 border-b text-right">₹{(bill.rentAmount ?? 0).toFixed(2)}</td>
          </tr>
          {(bill.overdueCharges ?? 0) > 0 && (
            <tr>
              <td className="p-3 border-b">Overdue Charges</td>
              <td className="p-3 border-b text-right">₹{(bill.overdueCharges ?? 0).toFixed(2)}</td>
            </tr>
          )}
        </tbody>
      </table>

      <section className="flex justify-end mt-8">
        <div className="w-1/2">
          <div className="flex justify-between p-3">
            <span className="font-bold text-gray-600">Subtotal</span>
            <span>₹{bill.totalAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between p-3 bg-gray-100 rounded-lg">
            <span className="font-bold text-lg text-gray-800">Total Paid</span>
            <span className="font-bold text-lg text-gray-800">₹{bill.totalAmount.toFixed(2)}</span>
          </div>
        </div>
      </section>

      <footer className="text-center text-gray-500 mt-16">
        <p>Thank you for your payment!</p>
        <p>KARV | Your Address Here | Your Contact Info Here</p>
      </footer>
    </div>
  );
};

export default Receipt;