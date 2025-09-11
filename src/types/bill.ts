export interface Bill {
  id: string;
  billId: string;
  status: 'paid' | 'overdue' | 'due' | string;
  totalAmount: number;
  dueDate: { toDate: () => Date };
  unitId?: string;
  unitName?: string;
  paymentDate?: { toDate: () => Date };
  billDate: { toDate: () => Date };
  rentAmount?: number;
  overdueCharges?: number;
}
