import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import { toast } from 'react-toastify';

// Import our new UI components
import Card from '../../components/ui/Card';
import StatCard from '../../components/ui/StatCard';
import InfoRow from '../../components/ui/InfoRow';

// Import icons
import { FiCreditCard, FiCalendar, FiHome } from 'react-icons/fi';

// Define the shape of our data for TypeScript
interface UnitDetails {
  unitName: string;
  rentAmount: number;
  unitId?: string;
  tenantUID?: string;
  tenantEmail?: string;
}

interface BillDetails {
  totalAmount: number;
  dueDate: {
    toDate: () => Date;
  };
  status: string;
}

const TenantHomePage = () => {
  const { currentUser } = useAuth();
  const [unitDetails, setUnitDetails] = useState<UnitDetails | null>(null);
  const [currentBill, setCurrentBill] = useState<BillDetails | null>(null);
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
          const billData = billSnapshot.docs[0].data() as BillDetails;
          setCurrentBill(billData);
        }

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
    return (
      <motion.div 
        className="flex items-center justify-center min-h-[400px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading your dashboard...</p>
        </div>
      </motion.div>
    );
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
          <h1 className="text-3xl font-bold font-secondary mb-2">
            Welcome back, {currentUser?.displayName || 'Tenant'}!
          </h1>
          <p className="text-text-secondary mb-8">Here's a summary of your account.</p>

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

      {/* Card for detailed information */}
      <Card className="mb-8">
        <h2 className="text-xl font-bold font-secondary mb-4">Rental Details</h2>
        <div className="space-y-2">
          <InfoRow label="Unit Name" value={unitDetails?.unitName ?? null} />
          <InfoRow label="Monthly Rent" value={unitDetails ? `₹${unitDetails.rentAmount}` : null} />
          <InfoRow label="Current Bill Status" value={currentBill?.status || 'All clear!'} />
        </div>
        
        {/* Pay button if there's a due or overdue bill */}
        {currentBill && (currentBill.status === 'due' || currentBill.status === 'overdue') && (
          <div className="mt-6">
            <button
              onClick={handlePayNow}
              disabled={isPaying}
              className="w-full flex items-center justify-center font-semibold bg-primary text-white rounded-lg py-3 px-4 hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              {isPaying ? 'Processing...' : `Pay ₹${currentBill.totalAmount} Now`}
            </button>
          </div>
        )}
      </Card>

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