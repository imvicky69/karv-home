import { onCall, onRequest } from "firebase-functions/v2/https";
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { v4 as uuidv4 } from "uuid";

// At the top of your file, use the correct import from the SDK you just installed
// We'll use direct HTTP calls to PhonePe's v2 APIs (token + checkout/v2/pay)
// to avoid SDK type mismatches in this project setup.
// import * as functions from "firebase-functions";
// import { v4 as uuidv4 } from 'uuid'; // A reliable way to create unique IDs
admin.initializeApp();

export const createTenant = onCall(
  { region: "asia-south1" },
  async (request) => {
    const { data, auth } = request;

    if (!auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "You must be logged in to create a tenant."
      );
    }

    const { name, email, phoneNumber, selectedUnitId, rentAmount } = data;

    if (!name || !email || !phoneNumber || !selectedUnitId || !rentAmount) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Missing required tenant information."
      );
    }

    try {
      const randomPassword = uuidv4().substring(0, 8);

      const newUserRecord = await admin.auth().createUser({
        email: email,
        emailVerified: false,
        phoneNumber: `+91${phoneNumber}`,
        password: randomPassword,
        displayName: name,
        disabled: false,
      });

      await admin.auth().setCustomUserClaims(newUserRecord.uid, { role: 'tenant' });

      const tenantUID = newUserRecord.uid;
      const db = admin.firestore();

      await db.runTransaction(async (transaction) => {
        const unitRef = db.collection("units").doc(selectedUnitId);
        const unitDoc = await transaction.get(unitRef);

        if (!unitDoc.exists || !unitDoc.data()?.isVacant) {
          throw new functions.https.HttpsError(
            "failed-precondition",
            "This unit is no longer available."
          );
        }

        const userRef = db.collection("users").doc(tenantUID);
        transaction.set(userRef, {
          name: name,
          email: email,
          phoneNumber: phoneNumber,
          role: "tenant",
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          isArchived: false,
        });

        transaction.update(unitRef, {
          isVacant: false,
          tenantUID: tenantUID,
          rentAmount: Number(rentAmount),
        });
      });

      return { success: true, tenantUID };
    } catch (error: unknown) {
      let errorMessage = "Failed to create tenant.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      throw new functions.https.HttpsError(
        "internal",
        errorMessage
      );
    }
  }
);
