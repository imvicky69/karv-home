// This script uses the Firebase Admin SDK to set a custom user claim.

// 1. Import the SDK and locate your service account key
const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

// Allow the path to the service account to be provided via an env var.
// Fallback to the default filename in the project root.
const serviceAccountPath = process.env.SERVICE_ACCOUNT_KEY_PATH || process.env.GOOGLE_APPLICATION_CREDENTIALS || path.join(__dirname, 'serviceAccountKey.json');

if (!fs.existsSync(serviceAccountPath)) {
  console.error(`Service account file not found at: ${serviceAccountPath}`);
  console.error('Download a service account JSON from the Firebase console (Project Settings → Service accounts) and either:');
  console.error("  • place it at './service-account-key.json' in the project root, or");
  console.error('  • set the environment variable SERVICE_ACCOUNT_KEY_PATH or GOOGLE_APPLICATION_CREDENTIALS to its full path.');
  console.error('Do NOT commit service account JSON to source control.');
  process.exit(1);
}

const serviceAccount = require(serviceAccountPath);

// 2. PASTE YOUR ADMIN UID HERE
const ADMIN_UID = 'XnujkfQnWrWCDjhTnd4gKTpjFJO2';

// 3. Initialize the app with admin credentials
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// 4. Set the custom claim
admin.auth().setCustomUserClaims(ADMIN_UID, { role: 'admin' })
  .then(() => {
    console.log(`Successfully set 'admin' role for user: ${ADMIN_UID}`);
    // Important: Exit the script once done
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error setting custom claim:', error);
    process.exit(1);
  });