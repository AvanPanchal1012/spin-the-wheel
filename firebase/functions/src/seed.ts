// seed.ts
import * as admin from "firebase-admin";

process.env.FIRESTORE_EMULATOR_HOST =
  process.env.FIRESTORE_EMULATOR_HOST || "127.0.0.1:8080";

admin.initializeApp({ projectId: "spin-the-wheel-635e3" });
const db = admin.firestore();

async function seed() {
  const segments = [
    { label: "🍎 Apples", weight: 1, color: "#FF5A5F" },
    { label: "🥐 Croissant", weight: 1, color: "#F7B500" },
    { label: "🧀 Cheese", weight: 1, color: "#FFD166" },
    { label: "🍫 Chocolate", weight: 1, color: "#8D6E63" },
    { label: "🥦 Broccoli", weight: 1, color: "#06D6A0" },
    { label: "🍣 Sushi", weight: 1, color: "#118AB2" },
    { label: "🍇 Grapes", weight: 1, color: "#9B59B6" },
    { label: "🎁 Mystery", weight: 1, color: "#2ECC71" },
  ];

  await db.collection("wheelConfig").doc("default").set({
    segments,
    cooldownSeconds: 10,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  process.exit(0);
}

seed();
