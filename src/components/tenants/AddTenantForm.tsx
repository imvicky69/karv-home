import { useState } from 'react';
// Step 1: Import Firebase functions and our initialized instance
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../firebase'; 
// Step 2: Import the toast notification library
import { toast } from 'react-toastify';
import Card from '../ui/Card';

type Unit = {
  id: string;
  unitName: string;
};

interface AddTenantFormProps {
  vacantUnits: Unit[];
}

const AddTenantForm = ({ vacantUnits }: AddTenantFormProps) => {
  // --- STATE MANAGEMENT ---
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedUnitId, setSelectedUnitId] = useState('');
  const [rentAmount, setRentAmount] = useState('');
  // Add a loading state to prevent multiple submissions
  const [isLoading, setIsLoading] = useState(false);

  // --- FORM SUBMISSION HANDLER ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Step 3: Prepare the data object that our cloud function expects
    const tenantData = {
      name,
      email,
      phoneNumber,
      selectedUnitId,
      rentAmount,
    };

    try {
      // Step 4: Get a reference to our deployed 'createTenant' function
      const createTenant = httpsCallable(functions, 'createTenant');
      
      // Step 5: Call the function and wait for the result
      const result = await createTenant(tenantData);

      // Step 6: Handle the successful response from the function in a type-safe way
      const data = (result as unknown as { data?: unknown })?.data;
      function isMessageResponse(obj: unknown): obj is { message: string } {
        if (typeof obj !== 'object' || obj === null) return false;
        const maybe = obj as Record<string, unknown>;
        return typeof maybe['message'] === 'string';
      }
      const message = isMessageResponse(data) ? data.message : 'Tenant created.';
      toast.success(message);
      
      // Reset the form fields after successful submission
      setName('');
      setEmail('');
      setPhoneNumber('');
      setSelectedUnitId('');
      setRentAmount('');

    } catch (error: unknown) {
      // Step 7: Handle any errors returned by the function
      let errorMessage = 'An unknown error occurred.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      console.error('Error creating tenant:', error);
      toast.error(errorMessage);
    } finally {
      // Step 8: Re-enable the button whether it succeeded or failed
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <h2 className="text-xl font-bold text-text-primary font-secondary mb-6">
        Add New Tenant
      </h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ... (All the input fields are exactly the same as before) ... */}
        <div className="md:col-span-2">
          <label htmlFor="name" className="block text-sm font-medium text-text-secondary">Full Name</label>
          <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 w-full input-field" />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-text-secondary">Email Address</label>
          <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 w-full input-field" />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-text-secondary">Phone Number</label>
          <input type="tel" id="phone" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required className="mt-1 w-full input-field" />
        </div>
        <div>
          <label htmlFor="unit" className="block text-sm font-medium text-text-secondary">Assign Unit</label>
          <select id="unit" value={selectedUnitId} onChange={(e) => setSelectedUnitId(e.target.value)} required className="mt-1 w-full input-field">
            <option value="" disabled>Select a unit...</option>
            {vacantUnits.map((unit) => (
              <option key={unit.id} value={unit.id}>{unit.unitName}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="rent" className="block text-sm font-medium text-text-secondary">Monthly Rent (INR)</label>
          <input type="number" id="rent" value={rentAmount} onChange={(e) => setRentAmount(e.target.value)} required className="mt-1 w-full input-field" />
        </div>
        
        <div className="md:col-span-2">
          {/* Disable the button while loading to prevent double-clicks */}
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full font-bold text-white bg-primary rounded-lg shadow-md py-3 px-4 hover:bg-primary-hover transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Creating Tenant...' : 'Add Tenant'}
          </button>
        </div>
      </form>
    </Card>
  );
};

export default AddTenantForm;