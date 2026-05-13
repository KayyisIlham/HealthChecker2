import admin from 'firebase-admin';

function getAdminApp() {
  if (admin.apps.length) return admin.apps[0];

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    return null;
  }

  return admin.initializeApp({
    credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
  });
}

export function getAdminDb() {
  const app = getAdminApp();
  if (!app) throw new Error('Firebase Admin not configured. Set environment variables.');
  return admin.firestore();
}

export function getAdminAuth() {
  const app = getAdminApp();
  if (!app) throw new Error('Firebase Admin not configured. Set environment variables.');
  return admin.auth();
}
