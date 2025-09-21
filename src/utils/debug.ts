import { auth, db } from '../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

/**
 * Debug utility to check Firebase authentication status and data
 */
export const checkAuthAndData = async () => {
  const currentUser = auth.currentUser;
  console.log('--- DEBUG: CURRENT AUTH STATE ---');
  console.log('Logged in:', currentUser ? 'Yes' : 'No');
  
  if (currentUser) {
    console.log('User ID:', currentUser.uid);
    console.log('Email:', currentUser.email);
    console.log('Display Name:', currentUser.displayName);
    console.log('Profile Image:', currentUser.photoURL ? 'Yes' : 'No');
    
    // Try to find user in Firestore
    console.log('\n--- DEBUG: FIRESTORE USER DATA ---');
    try {
      const userQuery = query(
        collection(db, 'users'),
        where('email', '==', currentUser.email)
      );
      const userSnapshot = await getDocs(userQuery);
      
      if (!userSnapshot.empty) {
        console.log('Firestore user found:', userSnapshot.docs[0].data());
      } else {
        console.log('No Firestore user document found with this email');
      }
    } catch (err) {
      console.error('Error checking user data:', err);
    }
    
    // Try to find unit
    console.log('\n--- DEBUG: UNIT ASSIGNMENTS ---');
    try {
      // Check by UID
      const unitByUidQuery = query(
        collection(db, 'units'),
        where('tenantUID', '==', currentUser.uid)
      );
      const unitByUidSnapshot = await getDocs(unitByUidQuery);
      
      if (!unitByUidSnapshot.empty) {
        console.log('Unit found by UID:', unitByUidSnapshot.docs[0].data());
      } else {
        console.log('No unit found with tenantUID =', currentUser.uid);
        
        // Try by email if available
        if (currentUser.email) {
          const unitByEmailQuery = query(
            collection(db, 'units'),
            where('tenantEmail', '==', currentUser.email)
          );
          const unitByEmailSnapshot = await getDocs(unitByEmailQuery);
          
          if (!unitByEmailSnapshot.empty) {
            console.log('Unit found by email:', unitByEmailSnapshot.docs[0].data());
          } else {
            console.log('No unit found with tenantEmail =', currentUser.email);
          }
        }
      }
    } catch (err) {
      console.error('Error checking unit assignments:', err);
    }
    
    // Try to find bills
    console.log('\n--- DEBUG: BILLS DATA ---');
    try {
      const billsQuery = query(
        collection(db, 'bills'),
        where('tenantUID', '==', currentUser.uid)
      );
      const billsSnapshot = await getDocs(billsQuery);
      
      if (!billsSnapshot.empty) {
        console.log(`Found ${billsSnapshot.size} bills for this user`);
        console.log('First bill:', billsSnapshot.docs[0].data());
      } else {
        console.log('No bills found with tenantUID =', currentUser.uid);
      }
    } catch (err) {
      console.error('Error checking bills data:', err);
    }
  }
};