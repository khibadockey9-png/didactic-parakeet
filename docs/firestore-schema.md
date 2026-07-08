# Firestore Document Model (suggested)

This document outlines a Firestore-based schema for prototyping the Honey Farm backend.

Collections

users (docId = userId)
- email: string
- displayName: string
- vipLevel: number
- coins: number
- gems: number
- xp: number
- createdAt: timestamp
- lastSignInAt: timestamp
- withdrawalMethods: array

farms (docId = farmId)
- ownerId: ref -> users/{userId}
- level: number
- storageCapacity: number
- hiveSlots: number
- createdAt: timestamp

hives (docId = hiveId)
- farmId: ref -> farms/{farmId}
- type: string (Starter/Wooden/Silver/...)
- level: number
- beesCount: number
- plantedFlowers: array of objects {flowerId, plantedAt, quality}
- lastHarvestAt: timestamp
- storedHoney: number

flowers (docId = flowerId)
- name: string
- quality: string
- baseBoostPercent: number
- growthTimeSec: number
- priceCoins: number

inventory (docId = ownerId_itemId)
- ownerId: ref
- itemType: string
- qty: number
- metadata: map

boosts (docId = boostId)
- ownerId: ref
- type: string
- multiplier: number
- expiresAt: timestamp
- active: boolean

transactions (docId = txId)
- ownerId: ref
- type: string (buy/sell/withdraw)
- amountCoins: number
- amountGems: number
- status: string
- createdAt: timestamp

withdrawalRequests (docId = reqId)
- userId: ref
- amountUSD: number
- method: string (PayPal/Bank)
- payPalEmail: string
- status: string (pending/approved/rejected/paid)
- createdAt: timestamp

dailyTasks/{userId}_tasks
- list of tasks with progress and completedAt

Notes
- All monetary and production calculations must be validated server-side to prevent client manipulation.
- Use batched writes / transactions when updating hive harvest + user balances to avoid race conditions.

