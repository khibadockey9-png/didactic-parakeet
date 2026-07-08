# MVP Backlog (suggested GitHub issues)

1. Auth: Email/Password + Google Sign-in
- Description: Implement authentication using Firebase Auth and server session handling.
- Labels: auth, backend

2. Farm model: Firestore schema
- Description: Create Firestore collections for users, farms, hives, flowers, and transactions.
- Labels: backend, database

3. Planting & Harvest mechanic
- Description: Implement plant endpoint and harvest endpoint on server; ensure 8-hour cooldown per hive
- Labels: gameplay, backend

4. Mobile: Home & Harvest UI
- Description: Build Flutter home screen with harvest button and active hives list.
- Labels: mobile, frontend

5. Shop: Flower & Items
- Description: Implement shop UI and purchase flow; update inventory on purchase.
- Labels: mobile, backend

6. Boosts & VIP Tiers
- Description: Implement worker boosts and VIP benefits with server-side enforcement.
- Labels: gameplay, backend

7. Payments: PayPal integration (payouts)
- Description: Integrate PayPal for withdrawals; add admin review flow for payouts above threshold.
- Labels: payments, backend

8. Withdrawals: Request flow
- Description: Add withdrawal requests collection and API endpoints to create and review requests.
- Labels: backend, payments

9. Leaderboard & Achievements
- Description: Implement global leaderboard and achievement system.
- Labels: feature

10. Security: Rate-limits & anti-abuse
- Description: Add rate-limits, validate server-side calculations, and add monitoring.
- Labels: security

