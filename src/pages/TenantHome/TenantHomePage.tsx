import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

// Import our new UI components
import Card from '../../components/ui/Card';
import StatCard from '../../components/ui/StatCard';
import InfoRow from '../../components/ui/InfoRow';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Badge from '../../components/ui/Badge';

// Import icons
import { FiCreditCard, FiCalendar, FiHome, FiFileText, FiArrowRight } from 'react-icons/fi';

// Define the shape of our data for TypeScript
interface UnitDetails {
  unitName: string;
  rentAmount: number;
  unitId?: string;
  tenantUID?: string;
  tenantEmail?: string;
}

interface BillDetails {
  id?: string;
  billId?: string;
  totalAmount: number;
  dueDate: {
    toDate: () => Date;
  };
  billDate?: {
    toDate: () => Date;
  };
  status: string;
  unitName?: string;
}

const TenantHomePage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [unitDetails, setUnitDetails] = useState<UnitDetails | null>(null);
  const [currentBill, setCurrentBill] = useState<BillDetails | null>(null);
  const [recentBills, setRecentBills] = useState<BillDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPaying, setIsPaying] = useState(false);

  useEffect(() => {
    const fetchTenantData = async () => {
      if (!currentUser) return;
      console.log("Current user:", currentUser.uid, currentUser.email);

      try {
        // Try to fetch unit by user ID first, then by email if needed
        let unitsQuery = query(
          collection(db, 'units'),
          where('currentTenantId', '==', currentUser.uid),
          limit(1)
        );
        const unitSnapshot = await getDocs(unitsQuery);

        if (unitSnapshot.empty && currentUser.email) {
          // If no unit found by UID, try by email
          console.log("No unit found by UID, trying email");
          unitsQuery = query(
            collection(db, 'units'),
            where('tenantEmail', '==', currentUser.email),
            limit(1)
          );
          const emailUnitSnapshot = await getDocs(unitsQuery);
          
          if (!emailUnitSnapshot.empty) {
            const unitData = emailUnitSnapshot.docs[0].data() as UnitDetails;
            setUnitDetails(unitData);
          } else {
            console.log("No unit found by email either");
            setUnitDetails(null);
          }
        } else if (!unitSnapshot.empty) {
          const unitData = unitSnapshot.docs[0].data() as UnitDetails;
          setUnitDetails(unitData);
        } else {
          setUnitDetails(null);
        }

        // --- Query 2: Fetch the user's most recent due/overdue bill ---
        const billsQuery = query(
          collection(db, 'bills'),
          where('tenantUID', '==', currentUser.uid),
          where('status', 'in', ['due', 'overdue']),
          orderBy('billDate', 'desc'),
          limit(1)
        );
        const billSnapshot = await getDocs(billsQuery);

        if (!billSnapshot.empty) {
          const billDoc = billSnapshot.docs[0];
          const billData = billDoc.data() as BillDetails;
          setCurrentBill({ ...billData, id: billDoc.id });
        }

        // --- Query 3: Fetch recent bills (last 3) ---
        const recentBillsQuery = query(
          collection(db, 'bills'),
          where('tenantUID', '==', currentUser.uid),
          orderBy('billDate', 'desc'),
          limit(3)
        );
        const recentBillsSnapshot = await getDocs(recentBillsQuery);
        const recentBillsList = recentBillsSnapshot.docs.map(doc => {
          const data = doc.data() as BillDetails;
          return { ...data, id: doc.id };
        });
        setRecentBills(recentBillsList);

      } catch (err) {
        console.error("Error fetching tenant data:", err);
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setIsLoading(false);
      }
    };

    fetchTenantData();
  }, [currentUser]); // Re-run the effect if the user changes

  // --- PAYMENT HANDLER ---
  const handlePayNow = async () => {
    if (!currentBill) return;
    
    setIsPaying(true);
    try {
      const response = await fetch('https://us-central1-indivio-in.cloudfunctions.net/api/payment/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: String(currentBill.totalAmount) }),
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

  // Display a loading state while fetching data
  if (isLoading) {
    return <LoadingSpinner text="Loading your dashboard..." />;
  }


  // Display an error message if something went wrong
  if (error) {
    return <Card><p className="text-danger">{error}</p></Card>;
  }

  // Show a friendly message if no unit is assigned
  if (!unitDetails) {
    return (
      <Card>
        <h2 className="text-xl font-bold font-secondary mb-4">No Unit Assigned</h2>
        <p className="text-text-secondary">You do not have a unit assigned yet. Please contact the property manager for assistance.</p>
        
        {/* Debug button - visible only in development */}
        {import.meta.env.DEV && (
          <button 
            onClick={async () => {
              const { checkAuthAndData } = await import('../../utils/debug');
              checkAuthAndData();
            }}
            className="mt-4 text-xs text-primary underline"
          >
            Debug Auth & Data
          </button>
        )}
      </Card>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Welcome Banner with Gradient */}
          <div className="bg-gradient-to-r from-primary to-primary-hover rounded-2xl p-8 mb-8 text-white shadow-xl">
            <h1 className="text-4xl font-bold font-secondary mb-2">
              Welcome back, {currentUser?.displayName || 'Tenant'}!
            </h1>
            <p className="text-white/90 text-lg">Here's a summary of your account and recent activity.</p>
          </div>

      {/* Grid for the StatCards */}
      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, staggerChildren: 0.1 }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <StatCard
            title="Amount Due"
            value={`₹${currentBill?.totalAmount || 0}`}
            icon={FiCreditCard}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <StatCard
            title="Due Date"
            value={currentBill ? currentBill.dueDate.toDate().toLocaleDateString() : 'N/A'}
            icon={FiCalendar}
            iconBgColor={currentBill?.status === 'overdue' ? 'bg-danger' : 'bg-primary'}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <StatCard
            title="Your Unit"
            value={unitDetails?.unitName || 'N/A'}
            icon={FiHome}
          />
        </motion.div>
      </motion.div>

      {/* Two Column Layout for Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Rental Details Card */}
        <Card>
          <h2 className="text-xl font-bold font-secondary mb-4 flex items-center">
            <FiHome className="mr-2 text-primary" />
            Rental Details
          </h2>
          <div className="space-y-2">
            <InfoRow label="Unit Name" value={unitDetails?.unitName ?? null} />
            <InfoRow label="Monthly Rent" value={unitDetails ? `₹${unitDetails.rentAmount}` : null} />
            <InfoRow label="Current Bill Status" value={currentBill?.status || 'All clear!'} />
          </div>
          
          {/* Pay button if there's a due or overdue bill */}
          {currentBill && (currentBill.status === 'due' || currentBill.status === 'overdue') && (
            <div className="mt-6">
              <Button
                onClick={handlePayNow}
                disabled={isPaying}
                variant="primary"
                fullWidth
                icon={FiCreditCard}
              >
                {isPaying ? 'Processing...' : `Pay ₹${currentBill.totalAmount} Now`}
              </Button>
            </div>
          )}
        </Card>

        {/* Recent Bills Card */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold font-secondary flex items-center">
              <FiFileText className="mr-2 text-primary" />
              Recent Bills
            </h2>
            <Button
              onClick={() => navigate('/bills')}
              variant="ghost"
              size="sm"
              icon={FiArrowRight}
            >
              View All
            </Button>
          </div>
          {recentBills.length > 0 ? (
            <div className="space-y-3">
              {recentBills.map((bill) => (
                <div key={bill.id} className="flex items-center justify-between p-3 bg-background rounded-lg hover:bg-gray-100 transition-colors">
                  <div>
                    <p className="font-semibold text-text-primary">{bill.billId || 'Bill'}</p>
                    <p className="text-sm text-text-secondary">
                      {bill.billDate ? bill.billDate.toDate().toLocaleDateString('default', { month: 'short', year: 'numeric' }) : 'N/A'}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <p className="font-bold text-text-primary">₹{bill.totalAmount}</p>
                    <Badge variant={bill.status === 'paid' ? 'success' : bill.status === 'overdue' ? 'danger' : 'warning'}>
                      {bill.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-text-secondary text-center py-8">No bills available yet</p>
          )}
        </Card>
      </div>

      </motion.div>
      </div>

      {/* Footer */}
      <footer className="mt-auto py-6 border-t border-gray-200">
        <div className="text-center text-sm text-text-secondary">
          <p className="font-semibold">KARV Homes</p>
          <p>Powered by <a href="https://indivio.in" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">indivio.in</a></p>
        </div>
      </footer>
    </div>
  );
};

export default TenantHomePage;