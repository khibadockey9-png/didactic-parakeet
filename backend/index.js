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
  if (userSnap.exists) return { created: false, farmId: userSnap.data().farmId };

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

// Utility: production rate per bee by hive level
function baseProductionPerBee(level) {
  // Example: level 1 -> 2 honey per bee, scales by 20% per level
  return 2 * Math.pow(1.2, Math.max(0, level - 1));
}

// Utility: VIP bonus mapping (decimal fraction)
function vipBonusFraction(vipLevel) {
  switch (vipLevel) {
    case 1:
      return 0.10;
    case 2:
      return 0.25;
    case 3:
      return 0.50;
    case 4:
      return 0.60; // includes auto-harvest but here we just give a bigger bonus
    case 5:
      return 1.00;
    default:
      return 0.0;
  }
}

// Calculate flower boost by summing flower docs referenced in plantedFlowers array
async function calculateFlowerBoost(plantedFlowers) {
  if (!plantedFlowers || plantedFlowers.length === 0) return 0.0;
  let totalBoost = 0.0; // decimal fraction
  for (const f of plantedFlowers) {
    if (!f || !f.flowerId) continue;
    try {
      const snap = await db.collection('flowers').doc(f.flowerId).get();
      if (!snap.exists) continue;
      const data = snap.data();
      let boost = Number(data.baseBoostPercent || 0);
      // If boost looks like a whole percent (e.g., 10), convert to decimal
      if (boost > 1) boost = boost / 100.0;
      totalBoost += boost;
    } catch (err) {
      console.warn('Error fetching flower', f.flowerId, err.message);
    }
  }
  return totalBoost;
}

// Calculate product of active boosts (1.0 = no boost)
async function calculateActiveBoostMultiplier(ownerId) {
  const now = admin.firestore.Timestamp.now();
  const boostsSnap = await db.collection('boosts')
    .where('ownerId', '==', ownerId)
    .where('active', '==', true)
    .where('expiresAt', '>', now)
    .get();
  if (boostsSnap.empty) return 1.0;
  let multiplier = 1.0;
  boostsSnap.forEach(doc => {
    const b = doc.data();
    multiplier *= Number(b.multiplier || 1.0);
  });
  return multiplier;
}

// Harvest endpoint implementation
// POST /v1/farm/:userId/harvest  body: { hiveId: string }
app.post('/v1/farm/:userId/harvest', authMiddleware, async (req, res) => {
  const uid = req.user.uid;
  const userIdParam = req.params.userId;
  if (uid !== userIdParam) return res.status(403).json({ error: 'Forbidden' });

  const { hiveId } = req.body || {};
  if (!hiveId) return res.status(400).json({ error: 'hiveId is required in body' });

  const hiveRef = db.collection('hives').doc(hiveId);
  try {
    const result = await db.runTransaction(async (tx) => {
      const hiveSnap = await tx.get(hiveRef);
      if (!hiveSnap.exists) throw new Error('Hive not found');
      const hive = hiveSnap.data();

      // Validate farm ownership
      const farmId = hive.farmId;
      const farmRef = db.collection('farms').doc(farmId);
      const farmSnap = await tx.get(farmRef);
      if (!farmSnap.exists) throw new Error('Farm not found');
      const farm = farmSnap.data();
      if (farm.ownerId !== uid) throw new Error('User does not own this farm/hive');

      // Cooldown check: 8 hours = 8 * 60 * 60 seconds
      const now = admin.firestore.Timestamp.now();
      const lastHarvest = hive.lastHarvestAt;
      if (lastHarvest) {
        const secsSince = now.seconds - lastHarvest.seconds;
        if (secsSince < 8 * 60 * 60) {
          const remaining = 8 * 60 * 60 - secsSince;
          throw new Error(`Cooldown active. Try again in ${Math.ceil(remaining / 60)} minutes`);
        }
      }

      // Base honey calculation
      const hiveLevel = hive.level || 1;
      const beesCount = hive.beesCount || 0;
      const basePerBee = baseProductionPerBee(hiveLevel);
      const baseHoney = Math.floor(basePerBee * beesCount);

      // Flower boosts
      const plantedFlowers = hive.plantedFlowers || [];
      const flowerBoost = await calculateFlowerBoost(plantedFlowers); // decimal fraction

      // VIP bonus
      const userRef = db.collection('users').doc(uid);
      const userSnap = await tx.get(userRef);
      if (!userSnap.exists) throw new Error('User not found');
      const user = userSnap.data();
      const vipLevel = user.vipLevel || 0;
      const vipBonus = vipBonusFraction(vipLevel);

      // Active boosts multiplier
      const activeMultiplier = await calculateActiveBoostMultiplier(uid);

      // Final honey
      const honeyFloat = baseHoney * (1 + flowerBoost) * (1 + vipBonus) * activeMultiplier;
      const finalHoney = Math.floor(honeyFloat);

      // Convert honey to coins (economy design choice) — 1 honey -> 1 coin
      const coinsToAdd = finalHoney; // or use conversion rate

      // Update hive.lastHarvestAt and storedHoney (set to 0) and update user coins
      tx.update(hiveRef, {
        lastHarvestAt: now,
        storedHoney: 0
      });

      tx.update(userRef, {
        coins: admin.firestore.FieldValue.increment(coinsToAdd)
      });

      // Create transaction record
      const txRef = db.collection('transactions').doc();
      tx.set(txRef, {
        ownerId: uid,
        type: 'harvest',
        hiveId: hiveId,
        honeyGained: finalHoney,
        coinsAdded: coinsToAdd,
        createdAt: now
      });

      return { finalHoney, coinsToAdd, nextHarvestInSec: 8 * 60 * 60 };
    });

    res.json({ ok: true, honeyGained: result.finalHoney, coinsAdded: result.coinsToAdd, nextHarvestInSec: result.nextHarvestInSec });
  } catch (err) {
    console.error('Harvest failed:', err.message);
    return res.status(400).json({ error: err.message });
  }
});

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

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`API listening on ${PORT}`));
