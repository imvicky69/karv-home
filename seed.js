import admin from 'firebase-admin';
import fs from 'fs';

// Initialize Firebase Admin SDK
const serviceAccount = JSON.parse(fs.readFileSync('./serviceAccountKey.json', 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// Sample data
const sampleUnits = [
  {
    unitName: 'GL1',
    rentAmount: 15000,
    currentTenantId: 'tenant2_uid',
    tenantEmail: 'tenant2@example.com',
  },
  {
    unitName: 'GL2',
    rentAmount: 12000,
    currentTenantId: 'tenant4_uid',
    tenantEmail: 'tenant4@example.com',
  },
  {
    unitName: 'GL3',
    rentAmount: 18000,
    currentTenantId: 'tenant3_uid',
    tenantEmail: 'tenant3@example.com',
  },
  {
    unitName: 'GR1',
    rentAmount: 14000,
    currentTenantId: 'tenant5_uid',
    tenantEmail: 'tenant5@example.com',
  },
  {
    unitName: 'GR2',
    rentAmount: 16000,
    currentTenantId: 'tenant3_uid',
    tenantEmail: 'tenant3@example.com',
  },
  {
    unitName: 'GR3',
    rentAmount: 17000,
    currentTenantId: 'tenant3_uid',
    tenantEmail: 'tenant3@example.com',
  },
  {
    unitName: 'F1',
    rentAmount: 13000,
    currentTenantId: 'tenant6_uid',
    tenantEmail: 'tenant6@example.com',
  },
  {
    unitName: 'VR',
    rentAmount: 20000,
    currentTenantId: 'BFanJ73mtbMdfhOJ6Ka6s1SxDWi2',
    tenantEmail: 'rajvicky97988@gmail.com',
  },
];

const sampleProfiles = [
  {
    uid: 'BFanJ73mtbMdfhOJ6Ka6s1SxDWi2',
    displayName: 'Raj Vicky',
    email: 'rajvicky97988@gmail.com',
    phone: '+91 9876543210',
    address: '123 Main Street, Apartment 4B, Mumbai, Maharashtra 400001',
    dateOfBirth: '1990-05-15',
    unitType: 'library',
    leaseStartDate: '2024-01-01',
    leaseEndDate: '2025-12-31',
    createdAt: admin.firestore.Timestamp.fromDate(new Date('2024-01-01')),
    updatedAt: admin.firestore.Timestamp.fromDate(new Date('2024-01-01')),
  },
  {
    uid: 'tenant2_uid',
    displayName: 'Jane Smith',
    email: 'tenant2@example.com',
    phone: '+91 9876543212',
    address: '456 Oak Avenue, Suite 2A, Delhi, Delhi 110001',
    dateOfBirth: '1985-08-20',
    unitType: 'shop',
    leaseStartDate: '2024-02-01',
    leaseEndDate: '2025-01-31',
    createdAt: admin.firestore.Timestamp.fromDate(new Date('2024-02-01')),
    updatedAt: admin.firestore.Timestamp.fromDate(new Date('2024-02-01')),
  },
  {
    uid: 'tenant3_uid',
    displayName: 'Bob Johnson',
    email: 'tenant3@example.com',
    phone: '+91 9876543214',
    address: '789 Pine Road, Unit 3C, Bangalore, Karnataka 560001',
    dateOfBirth: '1978-12-10',
    unitType: 'restaurant',
    leaseStartDate: '2024-03-01',
    leaseEndDate: '2026-02-28',
    createdAt: admin.firestore.Timestamp.fromDate(new Date('2024-03-01')),
    updatedAt: admin.firestore.Timestamp.fromDate(new Date('2024-03-01')),
  },
  {
    uid: 'tenant4_uid',
    displayName: 'Alice Brown',
    email: 'tenant4@example.com',
    phone: '+91 9876543216',
    address: '321 Elm Street, Chennai, Tamil Nadu 600001',
    dateOfBirth: '1982-03-12',
    unitType: 'shop',
    leaseStartDate: '2024-04-01',
    leaseEndDate: '2025-03-31',
    createdAt: admin.firestore.Timestamp.fromDate(new Date('2024-04-01')),
    updatedAt: admin.firestore.Timestamp.fromDate(new Date('2024-04-01')),
  },
  {
    uid: 'tenant5_uid',
    displayName: 'Charlie Wilson',
    email: 'tenant5@example.com',
    phone: '+91 9876543218',
    address: '654 Maple Avenue, Pune, Maharashtra 411001',
    dateOfBirth: '1975-11-25',
    unitType: 'restaurant',
    leaseStartDate: '2024-05-01',
    leaseEndDate: '2025-04-30',
    createdAt: admin.firestore.Timestamp.fromDate(new Date('2024-05-01')),
    updatedAt: admin.firestore.Timestamp.fromDate(new Date('2024-05-01')),
  },
  {
    uid: 'tenant6_uid',
    displayName: 'Diana Davis',
    email: 'tenant6@example.com',
    phone: '+91 9876543220',
    address: '987 Cedar Lane, Hyderabad, Telangana 500001',
    dateOfBirth: '1992-07-08',
    unitType: 'library',
    leaseStartDate: '2024-06-01',
    leaseEndDate: '2025-05-31',
    createdAt: admin.firestore.Timestamp.fromDate(new Date('2024-06-01')),
    updatedAt: admin.firestore.Timestamp.fromDate(new Date('2024-06-01')),
  },
];
const sampleBills = [
  // Bills for tenant1 (VR)
  {
    billId: 'BILL-001',
    billDate: admin.firestore.Timestamp.fromDate(new Date('2024-08-01')),
    dueDate: admin.firestore.Timestamp.fromDate(new Date('2024-08-31')),
    totalAmount: 20000,
    unitName: 'VR',
    status: 'overdue',
    unitId: 'unit8_id', // Will be set after creating units
    tenantUID: 'BFanJ73mtbMdfhOJ6Ka6s1SxDWi2',
    tenantId: 'BFanJ73mtbMdfhOJ6Ka6s1SxDWi2',
    tenantEmail: 'rajvicky97988@gmail.com',
    rentAmount: 20000,
    overdueCharges: 1000,
  },
  {
    billId: 'BILL-002',
    billDate: admin.firestore.Timestamp.fromDate(new Date('2024-09-01')),
    dueDate: admin.firestore.Timestamp.fromDate(new Date('2024-09-30')),
    totalAmount: 20000,
    unitName: 'VR',
    status: 'paid',
    unitId: 'unit8_id',
    tenantUID: 'BFanJ73mtbMdfhOJ6Ka6s1SxDWi2',
    tenantId: 'BFanJ73mtbMdfhOJ6Ka6s1SxDWi2',
    tenantEmail: 'rajvicky97988@gmail.com',
    rentAmount: 20000,
    overdueCharges: 0,
  },
  {
    billId: 'BILL-003',
    billDate: admin.firestore.Timestamp.fromDate(new Date('2024-10-01')),
    dueDate: admin.firestore.Timestamp.fromDate(new Date('2024-10-31')),
    totalAmount: 20000,
    unitName: 'VR',
    status: 'due',
    unitId: 'unit8_id',
    tenantUID: 'BFanJ73mtbMdfhOJ6Ka6s1SxDWi2',
    tenantId: 'BFanJ73mtbMdfhOJ6Ka6s1SxDWi2',
    tenantEmail: 'rajvicky97988@gmail.com',
    rentAmount: 20000,
    overdueCharges: 0,
  },
];

async function seedData() {
  try {
    console.log('Seeding units...');
    const unitRefs = [];
    for (const unit of sampleUnits) {
      const unitId = unit.unitName.toLowerCase().replace(/\s+/g, '-');
      await db.collection('units').doc(unitId).set(unit);
      unitRefs.push({ id: unitId, ...unit });
      console.log(`Added unit: ${unit.unitName} with ID: ${unitId}`);
    }

    console.log('Seeding profiles...');
    for (const profile of sampleProfiles) {
      await db.collection('profiles').doc(profile.uid).set(profile);
      console.log(`Added profile: ${profile.displayName}`);
    }

    console.log('Seeding bills...');
    for (let i = 0; i < sampleBills.length; i++) {
      const bill = sampleBills[i];
      // Find the unitId based on unitName
      const unit = unitRefs.find(u => u.unitName === bill.unitName);
      if (unit) {
        bill.unitId = unit.id;
      }
      const billDocId = `bill-${i + 1}`;
      await db.collection('bills').doc(billDocId).set(bill);
      console.log(`Added bill: ${bill.billId} with doc ID: ${billDocId}`);
    }

    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    admin.app().delete();
  }
}

seedData();