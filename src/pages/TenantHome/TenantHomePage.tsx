import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';

// Import our new UI components
import Card from '../../components/ui/Card';
import StatCard from '../../components/ui/StatCard';
import InfoRow from '../../components/ui/InfoRow';

// Import icons
import { FiDollarSign, FiCalendar, FiHome } from 'react-icons/fi';

// Define the shape of our data for TypeScript
interface UnitDetails {
  unitName: string;
  rentAmount: number;
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

  useEffect(() => {
    const fetchTenantData = async () => {
      if (!currentUser) return;

      try {
        // --- Query 1: Fetch the user's assigned unit ---
        const unitsQuery = query(
          collection(db, 'units'),
          where('tenantUID', '==', currentUser.uid),
          limit(1)
        );
        const unitSnapshot = await getDocs(unitsQuery);

        if (unitSnapshot.empty) {
          throw new Error("No unit assigned to your account.");
        }
        const unitData = unitSnapshot.docs[0].data() as UnitDetails;
        setUnitDetails(unitData);

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

  // Display a loading state while fetching data
  if (isLoading) {
    return <div>Loading your dashboard...</div>;
  }

  // Display an error message if something went wrong
  if (error) {
    return <Card><p className="text-danger">{error}</p></Card>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold font-secondary mb-2">
        Welcome, {currentUser?.displayName || 'Tenant'}!
      </h1>
      <p className="text-text-secondary mb-8">Here's a summary of your account.</p>

      {/* Grid for the StatCards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Amount Due"
          value={`₹${currentBill?.totalAmount || 0}`}
          icon={FiDollarSign}
        />
        <StatCard
          title="Due Date"
          value={currentBill ? currentBill.dueDate.toDate().toLocaleDateString() : 'N/A'}
          icon={FiCalendar}
          iconBgColor={currentBill?.status === 'overdue' ? 'bg-danger' : 'bg-primary'}
        />
        <StatCard
          title="Your Unit"
          value={unitDetails?.unitName || 'N/A'}
          icon={FiHome}
        />
      </div>

      {/* Card for detailed information */}
      <Card>
        <h2 className="text-xl font-bold font-secondary mb-4">Rental Details</h2>
        <div className="space-y-2">
          <InfoRow label="Unit Name" value={unitDetails?.unitName ?? null} />
          <InfoRow label="Monthly Rent" value={unitDetails ? `₹${unitDetails.rentAmount}` : null} />
          <InfoRow label="Current Bill Status" value={currentBill?.status || 'All clear!'} />
        </div>
      </Card>
    </div>
  );
};

export default TenantHomePage;