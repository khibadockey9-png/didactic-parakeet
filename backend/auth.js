const admin = require('firebase-admin');

// Initialize Firebase Admin SDK. In production, set GOOGLE_APPLICATION_CREDENTIALS to the
// path of the service account JSON, or provide credentials via environment variables.
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.applicationDefault()
    });
  } catch (err) {
    console.warn('Firebase Admin initialization error (expected in dev without credentials):', err.message);
  }
}

async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || '';
  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({error: 'Missing or invalid Authorization header'});
  }
  const idToken = authHeader.split('Bearer ')[1];
  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    req.user = decoded;
    next();
  } catch (err) {
    console.error('Token verification failed:', err.message);
    return res.status(401).json({error: 'Invalid ID token'});
  }
}

module.exports = { authMiddleware, admin };
