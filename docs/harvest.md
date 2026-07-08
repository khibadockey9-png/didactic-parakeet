# Harvest calculation and server-side logic

This document explains the server-side harvest implementation added to backend/index.js and how to test it.

Endpoint
- POST /v1/farm/:userId/harvest
  - Protected: requires Authorization: Bearer <ID_TOKEN>
  - Body: { "hiveId": "<hiveDocId>" }
  - Response (200): { ok: true, honeyGained: <int>, coinsAdded: <int>, nextHarvestInSec: 28800 }
  - Errors: 400 with message on cooldown, invalid hive, or ownership mismatch.

Rules enforced server-side
- Ownership: user must own the farm that contains the hive
- Cooldown: a hive can only be harvested every 8 hours (28800 seconds). The server checks hive.lastHarvestAt.
- Calculation is performed server-side (not trusting client):
  - basePerBee = 2 * (1.2)^(level-1)
  - baseHoney = floor(basePerBee * beesCount)
  - flowerBoost = sum of flower.baseBoostPercent (flowers collection must contain baseBoostPercent as decimal, e.g., 0.10 for 10%)
  - vipBonus = mapping by vipLevel (see code)
  - active boosts multiplier = product of active boosts.multiplier docs for owner (active==true and expiresAt > now)
  - finalHoney = floor(baseHoney * (1 + flowerBoost) * (1 + vipBonus) * activeMultiplier)

Atomic update
- The server uses a Firestore transaction to:
  - Verify hive/farm ownership and cooldown
  - Compute finalHoney
  - Update hive.lastHarvestAt and storedHoney
  - Increment user.coins by coinsToAdd (coinsToAdd == finalHoney currently)
  - Create a transactions/{txId} record with harvest details

Testing locally
1. Start backend with service account credentials:
   export GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
   cd backend
   npm install
   node index.js

2. Obtain a Firebase ID token (from mobile or firebase admin SDK in shell) and call:
   curl -X POST http://localhost:8080/v1/farm/<UID>/harvest -H "Authorization: Bearer <ID_TOKEN>" -H "Content-Type: application/json" -d '{"hiveId":"<HIVE_DOC_ID>"}'

3. Successful response includes honeyGained and coinsAdded.

Notes & future improvements
- Conversion rate: currently 1 honey -> 1 coin. You may want a separate economy conversion.
- Flower documents must exist with baseBoostPercent defined. If baseBoostPercent is given as a whole number (e.g., 10), code will convert it to decimal 0.10.
- Further validation: ensure plantedFlowers entries include plantedAt and are within growthTime before contributing to production.
- Add unit/integration tests (jest/mocha) and CI to validate harvest calculation and race-condition safety.
