# Project Plan & Milestones

This document breaks the work into three focused sprints and lists initial tasks for each.

Sprint 0 — Setup (1-2 days)
- Create repository structure and basic README (done)
- Setup basic CI (linting) and branch protection (optional)
- Create initial Firebase project (dev)

Sprint 1 — Core MVP (2 weeks)
- Auth: email/password + Google sign-in
- Farm model: starter hive, bees, flowers
- Planting and 8-hour harvest mechanic (server-side enforcement)
- Local persistence + backend endpoints for farm state
- UI: Home, Hives, Flower Shop, Harvest button
- Unit tests for harvest calculation

Sprint 2 — Economy & Shop (2 weeks)
- Shop purchases (coins / gems)
- Worker boosts and temporary multipliers
- Daily tasks + simple achievements
- VIP tiers and perks
- Leaderboard (global)

Sprint 3 — Payments & Withdrawals (2 weeks)
- PayPal onboarding for payouts / Google Pay for purchases
- Withdrawal requests with admin review & KYC flow for higher amounts
- Anti-abuse: rate-limits, payout thresholds, server validation
- Polish UI, animations, and seasonal events

Ongoing
- Analytics, telemetry, and crash reporting
- Security audits (payments, webhooks)

Ownership & workflow
- Feature branches per major area: mobile/, backend/, firebase/
- Use issues to track tasks; open PRs into main after review.

