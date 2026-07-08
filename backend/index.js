const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { authMiddleware, admin } = require('./auth');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Health
app.get('/v1/health', (req, res) => res.json({ok: true}));

// Verify ID token endpoint (debug / useful for mobile to validate server connectivity)
app.post('/v1/auth/verify', async (req, res) => {
  const { idToken } = req.body;
  if (!idToken) return res.status(400).json({ error: 'idToken required in body' });
  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    // Optionally, create or update user record in Firestore here.
    res.json({ ok: true, uid: decoded.uid, claims: decoded });
  } catch (err) {
    res.status(401).json({ error: 'Invalid ID token', details: err.message });
  }
});

// Protected farm endpoints (require Authorization: Bearer <idToken>)
app.get('/v1/farm/:userId', authMiddleware, (req, res) => {
  // Only allow users to fetch their own farm (or admins)
  if (req.user.uid !== req.params.userId) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  // TODO: Fetch farm state from Firestore
  res.json({ message: 'farm state stub', user: req.user });
});

app.post('/v1/farm/:userId/harvest', authMiddleware, (req, res) => {
  if (req.user.uid !== req.params.userId) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  // TODO: validate 8-hour rule, calculate honey, perform transaction atomically
  res.json({ message: 'harvest stub', honeyGained: 0 });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`API listening on ${PORT}`));
