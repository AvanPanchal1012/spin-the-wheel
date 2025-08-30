import crypto from "node:crypto";
import { Segment } from "./types";

export function pickWeightedIndex(segments: Segment[]): number {
  const total = segments.reduce((s, seg) => s + Math.max(seg.weight, 0), 0);
  if (total <= 0) return 0;
  const r = crypto.randomInt(total); // 0..total-1
  let acc = 0;
  for (let i = 0; i < segments.length; i++) {
    acc += Math.max(segments[i].weight, 0);
    if (r < acc) return i;
  }
  return segments.length - 1;
}
