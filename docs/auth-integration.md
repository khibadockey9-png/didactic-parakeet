# Firebase Auth integration (server + mobile)

This guide explains how to add Firebase Authentication (email/password + Google Sign-In) to the Honey Farm prototype.

Server (Express) setup

1. Create a Firebase project at https://console.firebase.google.com/ and enable Authentication (Email/Password and Google provider).
2. Create a service account (Project Settings -> Service accounts -> Generate new private key) and store the JSON on your server or CI runner.
3. Set the environment variable on the backend host/CI: GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
4. The backend uses the `firebase-admin` SDK to verify ID tokens sent by clients. Protected endpoints require an Authorization header:

   Authorization: Bearer <ID_TOKEN>

5. Example endpoints added in `backend/index.js`:
   - POST /v1/auth/verify — verify an ID token and return decoded claims
   - GET /v1/farm/:userId — protected, only the authenticated user can fetch their farm

Notes:
- You can also initialize firebase-admin with an explicit serviceAccount object if you prefer not to use ADC (Application Default Credentials).
- Create or update a `users` document in Firestore when a user first signs in (server can do that on /auth/verify or via Cloud Function onAuth)

Mobile (Flutter) setup

1. Add Firebase to your Flutter app following the official guide: https://firebase.google.com/docs/flutter/setup
2. Add the following dependencies in `pubspec.yaml`:
   - firebase_core
   - firebase_auth
   - google_sign_in
   - flutter_secure_storage (optional, for storing tokens securely)
   - http (for calling backend endpoints)

3. Initialize Firebase in `main()` with `WidgetsFlutterBinding.ensureInitialized(); await Firebase.initializeApp();`
4. Use FirebaseAuth for email/password registration and GoogleSignIn for Google auth. After sign-in, fetch the ID token:

   final idToken = await FirebaseAuth.instance.currentUser?.getIdToken();

5. Send the ID token to the backend in the Authorization header for protected calls.

Security

- Never trust client-side calculations for currency or production. Perform all authoritative calculations server-side.
- Protect private keys (service account JSON) and never commit them to the repository.
- Enforce rules in Firestore to prevent direct client writes to sensitive fields (e.g., balances, hive lastHarvestAt). Prefer server updates or Cloud Functions.

