// This script uses the Firebase Admin SDK to add sample bills to Firestore.
const admin = require('firebase-admin');

// --- CONFIGURATION ---
// The service account key you downloaded
const serviceAccount = require('./serviceAccountKey.json');

// Your specific tenant and unit details
const TENANT_UID = 'mGg3nr4krbUSLG4Wagb8JcAJbI02';
const UNIT_ID = 'unit_01';
const RENT_AMOUNT = 3500;

// --- INITIALIZE FIREBASE ADMIN ---
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const billsCollection = db.collection('bills');

// --- MAIN SEEDING FUNCTION ---
async function seedBills() {
  console.log('Starting to seed bills...');

  // --- HELPER FUNCTIONS to create dates ---
  const getLastDayOfMonth = (monthsAgo) => {
    const date = new Date();
    date.setMonth(date.getMonth() - monthsAgo, 1);
    date.setDate(0);
    date.setHours(23, 59, 59, 999);
    return date;
  };

  const getDueDate = (billDate) => {
    const dueDate = new Date(billDate);
    dueDate.setMonth(dueDate.getMonth() + 1);
    dueDate.setDate(5);
    return dueDate;
  };

  // --- DATA DEFINITIONS ---
  // Bill 1: Paid bill from 2 months ago
  const billDate1 = getLastDayOfMonth(2);
  const dueDate1 = getDueDate(billDate1);
  const paymentDate1 = new Date(dueDate1);
  paymentDate1.setDate(2);

  // Bill 2: Paid bill from last month (paid late)
  const billDate2 = getLastDayOfMonth(1);
  const dueDate2 = getDueDate(billDate2);
  const paymentDate2 = new Date(dueDate2);
  paymentDate2.setDate(7);
  
  // Bill 3: Current bill that is "due"
  const billDate3 = getLastDayOfMonth(0);
  const dueDate3 = getDueDate(billDate3);

  // --- ARRAY OF BILLS TO ADD ---
  const billsToAdd = [
    {
      tenantUID: TENANT_UID,
      unitId: UNIT_ID,
      billDate: admin.firestore.Timestamp.fromDate(billDate1),
      dueDate: admin.firestore.Timestamp.fromDate(dueDate1),
      rentAmount: RENT_AMOUNT,
      overdueCharges: 0,
      totalAmount: RENT_AMOUNT,
      status: 'paid',
      paymentDate: admin.firestore.Timestamp.fromDate(paymentDate1),
      paymentMethod: 'phonepe',
      transactionId: `TXN_SEED_${Math.random().toString(36).substr(2, 9)}`,
    },
    {
      tenantUID: TENANT_UID,
      unitId: UNIT_ID,
      billDate: admin.firestore.Timestamp.fromDate(billDate2),
      dueDate: admin.firestore.Timestamp.fromDate(dueDate2),
      rentAmount: RENT_AMOUNT,
      overdueCharges: 60,
      totalAmount: RENT_AMOUNT + 60,
      status: 'paid',
      paymentDate: admin.firestore.Timestamp.fromDate(paymentDate2),
      paymentMethod: 'cash',
      transactionId: null,
    },
    {
      tenantUID: TENANT_UID,
      unitId: UNIT_ID,
      billDate: admin.firestore.Timestamp.fromDate(billDate3),
      dueDate: admin.firestore.Timestamp.fromDate(dueDate3),
      rentAmount: RENT_AMOUNT,
      overdueCharges: 0,
      totalAmount: RENT_AMOUNT,
      status: 'due',
      paymentDate: null,
      paymentMethod: null,
      transactionId: null,
    }
  ];

  // --- WRITE TO FIRESTORE ---
  try {
    const batch = db.batch();
    billsToAdd.forEach((bill) => {
      const docRef = billsCollection.doc(); // Auto-generate document ID
      batch.set(docRef, bill);
    });
    await batch.commit();
    console.log(`✅ Successfully seeded ${billsToAdd.length} bills for tenant ${TENANT_UID}.`);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
}

// --- RUN THE SCRIPT ---
seedBills();