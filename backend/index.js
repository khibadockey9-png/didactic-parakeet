const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { authMiddleware, admin } = require('./auth');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const db = admin.firestore();

// Helper: create user + starter farm/hive if missing
async function ensureUserAndFarm(uid, decodedClaims) {
  const userRef = db.collection('users').doc(uid);
  const userSnap = await userRef.get();
  if (userSnap.exists) return { created: false };

  // Create default user doc
  const userData = {
    email: decodedClaims.email || null,
    displayName: decodedClaims.name || null,
    vipLevel: 0,
    coins: 1000,
    gems: 10,
    xp: 0,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    lastSignInAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  // Create farm doc
  const farmRef = db.collection('farms').doc();
  const farmData = {
    ownerId: uid,
    level: 1,
    storageCapacity: 100,
    hiveSlots: 1,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  };

  // Create starter hive
  const hiveRef = db.collection('hives').doc();
  const hiveData = {
    farmId: farmRef.id,
    type: 'Starter Hive',
    level: 1,
    beesCount: 5,
    plantedFlowers: [],
    lastHarvestAt: null,
    storedHoney: 0
  };

  // Use a batch to atomically create user, farm, hive
  const batch = db.batch();
  batch.set(userRef, Object.assign({}, userData, { farmId: farmRef.id }));
  batch.set(farmRef, farmData);
  batch.set(hiveRef, hiveData);
  await batch.commit();
  return { created: true, userId: uid, farmId: farmRef.id, hiveId: hiveRef.id };
}

// Health
app.get('/v1/health', (req, res) => res.json({ok: true}));

// Verify ID token endpoint (debug / useful for mobile to validate server connectivity)
app.post('/v1/auth/verify', async (req, res) => {
  const { idToken } = req.body;
  if (!idToken) return res.status(400).json({ error: 'idToken required in body' });
  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    // Create or update user record in Firestore on first sign-in
    const result = await ensureUserAndFarm(decoded.uid, decoded);
    res.json({ ok: true, uid: decoded.uid, claims: decoded, created: result.created, farmId: result.farmId || null });
  } catch (err) {
    res.status(401).json({ error: 'Invalid ID token', details: err.message });
  }
});

// Protected farm endpoints (require Authorization: Bearer <idToken>)
app.get('/v1/farm/:userId', authMiddleware, async (req, res) => {
  // Only allow users to fetch their own farm (or admins)
  if (req.user.uid !== req.params.userId) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  try {
    const userRef = db.collection('users').doc(req.user.uid);
    const userSnap = await userRef.get();
    const farmRef = db.collection('farms').doc(userSnap.data().farmId);
    const farmSnap = await farmRef.get();
    const hivesSnap = await db.collection('hives').where('farmId', '==', farmRef.id).get();
    const hives = [];
    hivesSnap.forEach(doc => hives.push({ id: doc.id, ...doc.data() }));
    res.json({ user: { id: userSnap.id, ...userSnap.data() }, farm: { id: farmRef.id, ...farmSnap.data() }, hives });
  } catch (err) {
    console.error('Error fetching farm:', err.message);
    res.status(500).json({ error: 'Failed to fetch farm' });
  }
});

app.post('/v1/farm/:userId/harvest', authMiddleware, async (req, res) => {
  if (req.user.uid !== req.params.userId) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  // TODO: validate 8-hour rule, calculate honey, perform transaction atomically
  res.json({ message: 'harvest stub', honeyGained: 0 });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`API listening on ${PORT}`));
