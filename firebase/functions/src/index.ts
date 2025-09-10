import * as admin from "firebase-admin";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { pickWeightedIndex } from "./utils";
import { SpinResult, WheelConfig } from "./types";
import { Timestamp } from "firebase-admin/firestore";

admin.initializeApp();
const db = admin.firestore();

async function getWheelConfig(): Promise<WheelConfig> {
  const snap = await db.collection("wheelConfig").doc("default").get();
  if (!snap.exists) {
    throw new HttpsError("failed-precondition", "wheelConfig/default missing");
  }
  const data = snap.data() as WheelConfig;
  if (!data.segments || data.segments.length !== 8) {
    throw new HttpsError(
      "failed-precondition",
      "wheelConfig must have exactly 8 segments"
    );
  }
  return data;
}

export const spinWheel = onCall<SpinResult>(
  async (request): Promise<SpinResult> => {
    const { data, auth } = request;

    if (!auth?.uid) {
      throw new HttpsError("unauthenticated", "Sign in required");
    }

    const clientRequestId = (data as any)?.clientRequestId;
    if (!clientRequestId) {
      throw new HttpsError("invalid-argument", "clientRequestId required");
    }

    const userRef = db.collection("users").doc(auth.uid);
    const requestsRef = userRef.collection("requests").doc(clientRequestId);

    // Idempotency check
    const existingReq = await requestsRef.get();
    if (existingReq.exists) {
      return existingReq.data()!.result as SpinResult;
    }

    const config = await getWheelConfig();

    const result = await db.runTransaction(async (tx) => {
      const userSnap = await tx.get(userRef);
      const now = Timestamp.now(); // ✅ safe

      const nextAllowedAtTS = userSnap.get("nextAllowedAt") as
        | Timestamp
        | undefined;
      if (nextAllowedAtTS && now.toMillis() < nextAllowedAtTS.toMillis()) {
        throw new HttpsError(
          "failed-precondition",
          `Cooldown active until ${nextAllowedAtTS.toDate().toISOString()}`
        );
      }

      const idx = pickWeightedIndex(config.segments);
      const prize = config.segments[idx];
      const spinId = db.collection("_").doc().id;

      const nextAllowedAt = Timestamp.fromMillis(
        now.toMillis() + config.cooldownSeconds * 1000
      );

      // Save spin + user state
      tx.set(userRef.collection("spins").doc(spinId), {
        prizeLabel: prize.label,
        prizeIndex: idx,
        createdAt: now,
      });
      tx.set(userRef, { lastSpinAt: now, nextAllowedAt }, { merge: true });

      const payload: SpinResult = {
        spinId,
        prizeLabel: prize.label,
        prizeIndex: idx,
        nextAllowedAt: nextAllowedAt.toDate().toISOString(),
      };

      tx.set(requestsRef, { createdAt: now, result: payload });
      return payload;
    });

    return result;
  }
);

export const getHistory = onCall(async (request) => {
  const { data, auth } = request;

  if (!auth?.uid) {
    throw new HttpsError("unauthenticated", "Sign in required");
  }

  const limit = Math.min(Number((data as any)?.limit ?? 25), 100);

  const qs = await db
    .collection("users")
    .doc(auth.uid)
    .collection("spins")
    .orderBy("createdAt", "desc")
    .limit(limit)
    .get();

  return qs.docs.map((d) => ({
    id: d.id,
    ...d.data(),
    createdAt: d.get("createdAt")?.toDate()?.toISOString(),
  }));
});
