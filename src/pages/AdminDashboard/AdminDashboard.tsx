import { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore'; // Import firestore functions
import { db } from '../../firebase'; // Import db
import Layout from '../../components/layout/Layout';
import Card from '../../components/ui/Card';
import AddTenantForm from '../../components/tenants/AddTenantForm'; // Import the new form

// Define the shape of our Unit data
type Unit = {
  id: string;
  unitName: string;
};

const AdminDashboard = () => {
  const [vacantUnits, setVacantUnits] = useState<Unit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // This `useEffect` hook runs once when the component loads
  useEffect(() => {
    const fetchVacantUnits = async () => {
      try {
        // Create a query to get documents from the 'units' collection
        // where the 'isVacant' field is true.
        const q = query(collection(db, "units"), where("isVacant", "==", true));
        
        const querySnapshot = await getDocs(q);
        const unitsList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          unitName: doc.data().unitName,
        }));
        
        setVacantUnits(unitsList);
      } catch (error) {
        console.error("Error fetching vacant units: ", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVacantUnits();
  }, []); // The empty array ensures this runs only once.

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {/* ... Header is the same */}
        <header>...</header>

        <main className="space-y-8">
          <Card>
            <h2 className="text-xl font-bold text-text-primary font-secondary">Welcome to KARV!</h2>
            <p className="text-text-secondary mt-2">
              This is where you will manage units and tenants.
            </p>
          </Card>

          {/* Add the new form here */}
          {isLoading ? (
            <p>Loading units...</p>
          ) : (
            <AddTenantForm vacantUnits={vacantUnits} />
          )}
        </main>
      </div>
    </Layout>
  );
};

export default AdminDashboard;