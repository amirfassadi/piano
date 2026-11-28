export type LoopRange = { a: number; b: number } | null;
export type Transport = { position: number; bpm: number; playing: boolean; loop: LoopRange };
export const MIN_BPM = 40;
export const MAX_BPM = 180;
export function effectiveBpm(baseBpm: number, percent: number): number {
  if (!Number.isFinite(baseBpm) || baseBpm <= 0 || !Number.isFinite(percent) || percent <= 0) throw new RangeError("BPM and tempo percentage must be positive");
  return baseBpm * percent / 100;
}
export function beatAtAudioTime(anchorBeat: number, anchorTime: number, audioTime: number, bpm: number): number {
  if (bpm <= 0 || audioTime < anchorTime) return anchorBeat;
  return anchorBeat + (audioTime - anchorTime) * bpm / 60;
}
export function audioTimeAtBeat(anchorBeat: number, anchorTime: number, beat: number, bpm: number): number {
  if (bpm <= 0) throw new RangeError("BPM must be positive");
  return anchorTime + (beat - anchorBeat) * 60 / bpm;
}
export function clampBeat(beat: number, totalBeats: number): number {
  if (!Number.isFinite(beat) || totalBeats <= 0) throw new RangeError("Invalid seek range");
  return Math.min(totalBeats, Math.max(0, beat));
}
export function normalizeLoop(a: number, b: number, totalBeats: number): LoopRange {
  const start = clampBeat(Math.min(a, b), totalBeats);
  const end = clampBeat(Math.max(a, b), totalBeats);
  return end - start >= 0.25 ? { a: start, b: end } : null;
}
export function startPosition(requested: number, totalBeats: number, loop: LoopRange): number {
  const position = clampBeat(requested, totalBeats);
  return loop && (position < loop.a || position >= loop.b) ? loop.a : position;
}
export function nextPosition(current: number, totalBeats: number, loop: LoopRange): number {
  if (loop && current >= loop.b) return loop.a + (current - loop.b);
  return Math.min(current, totalBeats);
}
export function positionAfterTempoChange(currentBeat: number, currentAudioTime: number, nextBpm: number) {
  if (nextBpm <= 0) throw new RangeError("BPM must be positive");
  return { anchorBeat: currentBeat, anchorTime: currentAudioTime };
}
/** Return the remaining musical segment of an event after seek/loop entry. */
export function eventSliceAtBeat(event: { start: number; duration: number }, currentBeat: number, stopBeat: number) {
  const start = Math.max(event.start, currentBeat);
  const end = Math.min(event.start + event.duration, stopBeat);
  return end <= start ? null : { startBeat: start, endBeat: end, durationBeats: end - start, resumedMidEvent: start > event.start };
}
export function eventHandEnabled(event: { hand: "left" | "right" }, enabled: Record<"left" | "right", boolean>): boolean {
  return enabled[event.hand];
}
export function formatBeat(beat: number, beatsPerMeasure: number): { measure: number; beat: number } {
  const safe = Math.max(0, beat);
  return { measure: Math.floor(safe / beatsPerMeasure) + 1, beat: (safe % beatsPerMeasure) + 1 };
}
