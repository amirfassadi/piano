export type Hand = "right" | "left";
export type NoteEvent = { id: string; pitch: number | null; start: number; duration: number; hand: Hand; fingering?: number };
export type PracticePiece = {
  slug: string;
  title: { en: string; fa: string };
  composer: { en: string; fa: string };
};
export type PracticeArrangement = {
  id: string;
  pieceSlug: string;
  bpm: number;
  timeSignature: { numerator: number; denominator: number };
  measures: number;
  audio: { source: "web-audio-synthesis"; waveform: OscillatorType; referenceMidi: number; referenceHz: number };
  events: readonly NoteEvent[];
};

/** Authored identity for the original exercise; it is not tied to a published composition. */
export const practicePiece: PracticePiece = {
  slug: "nuance-sample",
  title: { en: "NUANCE Sample Study No. 1", fa: "تمرین نمونهٔ NUANCE شمارهٔ ۱" },
  composer: { en: "Original NUANCE exercise", fa: "تمرین تألیفی NUANCE" },
};

/** One authored two-hand piano setting. Musical/audio resources are setting-specific. */
export const practiceArrangement: PracticeArrangement = {
  id: "piano-two-hands-c-major-v1",
  pieceSlug: practicePiece.slug,
  bpm: 84,
  timeSignature: { numerator: 4, denominator: 4 },
  measures: 4,
  audio: { source: "web-audio-synthesis", waveform: "triangle", referenceMidi: 69, referenceHz: 440 },
  events: [
    { id: "r1", pitch: 60, start: 0, duration: 1, hand: "right", fingering: 1 },
    { id: "r1b", pitch: 67, start: 0, duration: 1, hand: "right", fingering: 5 },
    { id: "r2", pitch: 64, start: 1, duration: 1, hand: "right", fingering: 2 },
    { id: "r3", pitch: 67, start: 2, duration: 1, hand: "right", fingering: 3 },
    { id: "r4", pitch: null, start: 3, duration: 1, hand: "right" },
    { id: "r5", pitch: 71, start: 4, duration: 1, hand: "right", fingering: 4 },
    { id: "r6", pitch: 67, start: 5, duration: 1, hand: "right", fingering: 3 },
    { id: "r7", pitch: 69, start: 6, duration: 1, hand: "right", fingering: 2 },
    { id: "r8", pitch: 67, start: 7, duration: 1, hand: "right", fingering: 3 },
    { id: "r9", pitch: 65, start: 8, duration: 1, hand: "right", fingering: 3 },
    { id: "r10", pitch: 69, start: 9, duration: 1, hand: "right", fingering: 4 },
    { id: "r11", pitch: 72, start: 10, duration: 1, hand: "right", fingering: 5 },
    { id: "r12", pitch: 74, start: 11, duration: 1, hand: "right", fingering: 4 },
    { id: "r13", pitch: 72, start: 12, duration: 1, hand: "right", fingering: 5 },
    { id: "r14", pitch: 67, start: 13, duration: 1, hand: "right", fingering: 3 },
    { id: "r15", pitch: 64, start: 14, duration: 1, hand: "right", fingering: 2 },
    { id: "r16", pitch: 60, start: 15, duration: 1, hand: "right", fingering: 1 },
    { id: "l1", pitch: 48, start: 0, duration: 2, hand: "left", fingering: 5 },
    { id: "l2", pitch: 55, start: 2, duration: 2, hand: "left", fingering: 1 },
    { id: "l3", pitch: 50, start: 4, duration: 2, hand: "left", fingering: 5 },
    { id: "l4", pitch: 57, start: 6, duration: 2, hand: "left", fingering: 1 },
    { id: "l5", pitch: 45, start: 8, duration: 2, hand: "left", fingering: 5 },
    { id: "l6", pitch: 52, start: 10, duration: 2, hand: "left", fingering: 1 },
    { id: "l7", pitch: 48, start: 12, duration: 2, hand: "left", fingering: 5 },
    { id: "l8", pitch: 55, start: 14, duration: 2, hand: "left", fingering: 1 },
  ],
};

export const practiceArrangementsByPiece: Readonly<Record<string, readonly PracticeArrangement[]>> = {
  [practicePiece.slug]: [practiceArrangement],
};
export function arrangementsForPiece(pieceSlug: string): readonly PracticeArrangement[] {
  return practiceArrangementsByPiece[pieceSlug] ?? [];
}

/** Joined view used by the single-setting practice page. */
export const practiceStudy = {
  ...practicePiece,
  ...practiceArrangement,
  beatsPerMeasure: practiceArrangement.timeSignature.numerator,
};
export const totalBeats = practiceArrangement.timeSignature.numerator * practiceArrangement.measures;

export function validateEvents(events: readonly NoteEvent[], endBeat: number): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  if (!Number.isFinite(endBeat) || endBeat <= 0) errors.push("invalid-end-beat");
  for (const e of events) {
    if (!e.id || ids.has(e.id)) errors.push(`duplicate-or-empty-id:${e.id}`);
    ids.add(e.id);
    if (e.pitch !== null && (!Number.isInteger(e.pitch) || e.pitch < 21 || e.pitch > 108)) errors.push(`invalid-pitch:${e.id}`);
    if (!Number.isFinite(e.start) || e.start < 0 || !Number.isFinite(e.duration) || e.duration <= 0 || !Number.isFinite(endBeat) || e.start + e.duration > endBeat) errors.push(`invalid-time:${e.id}`);
    if (e.hand !== "left" && e.hand !== "right") errors.push(`invalid-hand:${e.id}`);
    if (e.fingering !== undefined && (!Number.isInteger(e.fingering) || e.fingering < 1 || e.fingering > 5)) errors.push(`invalid-fingering:${e.id}`);
  }
  return errors;
}

export const validationErrors = validateEvents(practiceArrangement.events, totalBeats);
if (validationErrors.length) throw new Error(`Invalid practice arrangement: ${validationErrors.join(", ")}`);
