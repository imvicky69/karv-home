import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import BillListItem from '../../components/bills/BillListItem';
import Card from '../../components/ui/Card'; // Import Card for error/loading states

// Define the shape of the bill data for this page
import type { Bill } from '../../types/bill';

// Local additions to Bill interface are handled via the shared type

const TenantBillsPage = () => {
  const { currentUser } = useAuth();
  const [bills, setBills] = useState<Bill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBillsAndUnits = async () => {
      if (!currentUser) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      try {
        // Step 1: Fetch all units and create a map of [unitId -> unitName] for efficient lookup
        const unitsSnapshot = await getDocs(collection(db, 'units'));
        const unitMap = new Map<string, string>();
        unitsSnapshot.forEach(doc => {
          unitMap.set(doc.id, doc.data().unitName);
        });

        // Step 2: Fetch all bills for the current user, ordered by most recent first
        const q = query(
          collection(db, 'bills'),
          where('tenantUID', '==', currentUser.uid),
          orderBy('billDate', 'desc')
        );
        const billsSnapshot = await getDocs(q);
        
        // Step 3: Combine bill data with the unit name from our map
        const billsList = billsSnapshot.docs.map(doc => {
          const data = doc.data() as Record<string, any>;
          return {
            id: doc.id,
            ...data,
            unitName: unitMap.get(data.unitId) || 'Unknown Unit', // Look up the unit name
            rentAmount: typeof data.rentAmount === 'number' ? data.rentAmount : Number(data.rentAmount) || 0,
            overdueCharges: typeof data.overdueCharges === 'number' ? data.overdueCharges : Number(data.overdueCharges) || 0,
          } as Bill;
        });
        
        setBills(billsList);

      } catch (err) {
        console.error("Error fetching bills:", err);
        setError("Could not load your bill history. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBillsAndUnits();
  }, [currentUser]); // Re-run this effect if the user changes

  const renderContent = () => {
    if (isLoading) {
      return <Card><p>Loading your bill history...</p></Card>;
    }
  
    if (error) {
      return <Card><p className="text-danger text-center">{error}</p></Card>;
    }

    if (bills.length > 0) {
      return (
        <div className="space-y-4">
          {bills.map(bill => (
            <BillListItem key={bill.id} bill={bill} />
          ))}
        </div>
      );
    }
    
    return <Card><p>You have no bill history yet.</p></Card>;
  };

  return (
    <div>
      <h1 className="text-3xl font-bold font-secondary mb-8">Bills & Payments</h1>
      {renderContent()}
    </div>
  );
};

export default TenantBillsPage;