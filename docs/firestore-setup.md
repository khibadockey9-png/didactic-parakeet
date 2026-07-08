Firestore setup & security rules

This document describes how the server will create a default user, farm, and starter hive on first sign-in and how to deploy Firestore security rules.

Auto-create on sign-in
- The backend endpoint POST /v1/auth/verify verifies a Firebase ID token and, if the users/{uid} document does not exist, creates:
  - users/{uid} with starting coins, gems, xp, vipLevel and a reference to the farmId
  - farms/{farmId} with ownerId = uid and initial farm properties
  - hives/{hiveId} with starter hive under that farm

Firestore security rules (backend/firestore.rules)
- Rules restrict client writes to sensitive documents.
- Users can read their own users/{uid} and corresponding farm/hive documents, but cannot create/update/delete them from the client. All modifications should be made by server-side endpoints or Cloud Functions.

How to deploy rules
1. Install Firebase CLI: npm install -g firebase-tools
2. Login: firebase login
3. Init (if needed): firebase init firestore
4. Copy backend/firestore.rules into your firebase project rules file or specify it during init.
5. Deploy: firebase deploy --only firestore:rules

Notes
- Test rules in the Firebase console emulator before deploying to production.
- You can adjust rules later to allow limited client updates (e.g., profile displayName) but keep currency and production fields server-controlled.
