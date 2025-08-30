export interface Segment {
  label: string;
  weight: number;
  color: string;
}
export interface WheelConfig {
  segments: Segment[];
  cooldownSeconds: number;
}
export interface SpinRequestBody {
  clientRequestId: string;
}
export interface SpinResult {
  spinId: string;
  prizeLabel: string;
  prizeIndex: number; // 0..7
  nextAllowedAt: string; // ISO string
}
