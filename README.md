# Honey Farm — Didactic Parakeet

Honey Farm is a mobile farming & earning game prototype where players manage bee farms, grow flowers, harvest honey, upgrade hives, and earn rewards.

This repository contains a multi-part scaffold to prototype the Honey Farm MVP: mobile app scaffold (Flutter), backend stubs (Express + Firebase functions examples), API spec, data model, and a task backlog to track work.

Tech stack (recommended MVP)
- Mobile: Flutter (Dart) — cross-platform mobile UI
- Backend: Node.js + Express for API + Firebase (Auth + Firestore) for fast prototyping
- Payments: PayPal Checkout for payouts; Google Pay for in-app purchases

What’s included in this branch
- README (this file)
- docs/plan.md — milestone plan and tasks
- docs/firestore-schema.md — Firestore document model
- api/openapi.yaml — basic REST endpoint spec (skeleton)
- mobile/flutter/ — minimal Flutter app scaffold (pubspec + main.dart)
- backend/ — minimal Express server stub (package.json + index.js)
- issues/MVP_backlog.md — suggested GitHub issues for the MVP

How to use
1. Clone the repo and switch to branch `scaffold/honey-farm-mvp`.
2. Explore the docs/ and api/ folders for design and API.
3. Open `mobile/flutter` in Android Studio / VS Code and run `flutter pub get`, then `flutter run`.
4. From `backend/` run `npm install` and `node index.js` to start the API stub.

Next steps
- Iterate on API implementations, wire mobile app to backend, add server-side validation for harvest/withdraw flows, and integrate payments.

