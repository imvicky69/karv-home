export interface Bill {
  id: string;
  billId: string;
  billDate: { toDate: () => Date };
  dueDate: { toDate: () => Date };
  totalAmount: number;
  unitName: string;
  status: 'paid' | 'due' | 'overdue' | string;
  // id: string;
  unitId: string;
  // unitName: string;
  tenantUID: string;
  // billDate: string;
  rentAmount: number;
  overdueCharges: number;
}