export interface Profile {
  uid: string;
  displayName: string;
  email: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string; // ISO string
  unitType?: 'shop' | 'restaurant' | 'library';
  leaseStartDate?: string; // ISO string
  leaseEndDate?: string; // ISO string
  createdAt: { toDate: () => Date };
  updatedAt: { toDate: () => Date };
}