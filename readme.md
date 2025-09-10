# Spin the Wheel — React Native + Firebase

## Overview

This project is a cross-platform mobile app built with **React Native (Expo, TypeScript)** and a **Firebase backend**.

Users can spin an 8-segment wheel where the outcome is determined by a **server-authoritative Cloud Function**. Each spin is persisted in Firestore, subject to a cooldown period, and past spins are displayed in a history screen.

This was built as a take-home assignment for the **Sobeys Senior React Native Developer** role.

---

## Features

- **Dynamic 8-Segment Wheel** — configuration (label, color, weight) loaded from Firestore.
- **Server-Authoritative Spins** — Cloud Function (`spinWheel`) determines outcome (not client).
- **Cooldown Enforcement** — server blocks spins until `nextAllowedAt`.
- **Spin History** — Cloud Function (`getHistory`) returns past spins for the user.
- **Reward Modal** — celebratory popup with prize details.
- **Smooth Animation** — always clockwise with easing for UX polish.
- **Cross-Platform** — works on iOS, Android, and emulator.
- **Emulator Suite** — runs fully local with Auth, Firestore, and Functions.

---

## Architecture

```
repo/
├── frontend/          # Expo React Native app
│   ├── src/
│   │   ├── screens/      # Wheel, History, Settings
│   │   ├── components/   # Wheel, RewardModal
│   │   ├── firebase.ts   # Firebase client + emulator setup
│   └── App.tsx
│
└── firebase/
    ├── functions/        # Cloud Functions (TypeScript)
    │   ├── src/index.ts       # spinWheel + getHistory
    │   ├── src/utils.ts       # weighted random helper
    │   ├── src/types.ts       # shared types
    │   └── src/utils.test.ts  # ✅ Jest unit tests
    ├── scripts/seed.ts        # seeds Firestore wheelConfig
    ├── firestore.rules        # security rules
    └── firebase.json          # emulator config
```

- **State & Networking**: handled with [`@tanstack/react-query`](https://tanstack.com/query).
- **Animation**: React Native `Animated` + `Easing`.
- **Persistence**: spins stored in `/users/{uid}/spins/{spinId}`.

---

## Setup Instructions

### 1. Clone Repo

```sh
git clone <your-repo-url>
cd spin-the-wheel
```

### 2. Install Frontend

```sh
cd frontend
npm install
```

### 3. Install Firebase Functions

```sh
cd ../firebase/functions
npm install
```

### 4. Start Firebase Emulators

```sh
cd ..
firebase emulators:start
```

Runs on:

- Auth → `localhost:9099`
- Firestore → `localhost:8080`
- Functions → `localhost:5001`
- Emulator UI → `localhost:4000`

### 5. Seed Firestore

```sh
cd firebase
npx ts-node scripts/src/seed.ts
```

This creates `wheelConfig/default` with 8 segments.

### 6. Run App

```sh
cd frontend
npm start
```

- iOS Simulator → works with `localhost`
- Android Emulator → use `10.0.2.2`
- Physical Device → replace with LAN IP in `firebase.ts`

---

## Firestore Security Rules

```groovy
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Each user can read/write only their own spins
    match /users/{uid}/{collection}/{docId} {
      allow read, write: if request.auth.uid == uid;
    }

    // Wheel config: public read, no write
    match /wheelConfig/{docId} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

---

## Tests

### Functions

Located in `/firebase/functions/src/utils.test.ts`.

Run:

```sh
cd firebase/functions
npm test
```

Example:

```ts
import { pickWeightedIndex } from "./utils";

test("higher weight is picked more often", () => {
  const segments = [
    { label: "A", weight: 1, color: "#000" },
    { label: "B", weight: 9, color: "#111" },
  ];
  let a = 0,
    b = 0;
  for (let i = 0; i < 500; i++) {
    const idx = pickWeightedIndex(segments);
    if (segments[idx].label === "A") a++;
    else b++;
  }
  expect(b).toBeGreaterThan(a);
});
```

### Frontend

Located in `/frontend/src/components/RewardModal.test.tsx` (using `@testing-library/react-native`).

Run:

```sh
cd frontend
npm test
```

---

## Assumptions

- Anonymous authentication only.
- Wheel always has exactly 8 segments.
- Cooldown defaults to **10 seconds** (can be adjusted).

---

## Trade-offs

- Simplicity over extensibility: fixed 8 segments.
- Cooldown enforced server-side only; client just shows error.
- Expo chosen for speed, not bare React Native.

---

## Fairness & Idempotency

- **Fairness**: outcomes chosen server-side using weighted randomness.
- **Idempotency**: `clientRequestId` ensures duplicate requests (e.g., retries) always return the same result.

---

## Demo Walkthrough

1. Start emulators (`firebase emulators:start`).
2. Run app (`npm start` in frontend).
3. Wheel screen → spin once.
4. Reward modal shows prize.
5. History tab → spin logged.
6. Try spinning again before cooldown → error.
7. Show Firestore entries in Emulator UI (`localhost:4000`).

---
