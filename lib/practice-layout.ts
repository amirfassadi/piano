import type { NoteEvent } from "./practice-data";

export const SCORE_LEFT = 84;
export const SCORE_BEAT_WIDTH = 53.75;
export const SCORE_MEASURE_WIDTH = 215;
export const WATERFALL_MIN_MIDI = 45;
export const WATERFALL_MAX_MIDI = 84;
export const WATERFALL_PLAYHEAD_Y = 78;
export const WATERFALL_PIXELS_PER_BEAT = 58;

/** Horizontal coordinate of a beat in the four-measure grand staff. */
export function scoreXAtBeat(beat: number): number {
  const safe = Math.max(0, beat);
  const measure = Math.floor(safe / 4);
  return SCORE_LEFT + measure * SCORE_MEASURE_WIDTH + (safe - measure * 4) * SCORE_BEAT_WIDTH;
}

function whiteKeyIndex(midi: number): number {
  const whites = [0, 2, 4, 5, 7, 9, 11];
  const octave = Math.floor(midi / 12);
  const semitone = ((midi % 12) + 12) % 12;
  const within = whites.filter((n) => n < semitone).length;
  return (octave * 7 + within);
}

/** Percent across the keyboard's white-key bed; accidentals sit between white keys. */
export function pitchXPercent(midi: number, minMidi = WATERFALL_MIN_MIDI, maxMidi = WATERFALL_MAX_MIDI): number {
  const min = whiteKeyIndex(minMidi);
  const whiteKeyCount = whiteKeyIndex(maxMidi) - min + 1;
  const semitone = ((midi % 12) + 12) % 12;
  const whiteSlot = whiteKeyIndex(midi) - min;
  const slot = [1, 3, 6, 8, 10].includes(semitone) ? whiteSlot : whiteSlot + 0.5;
  return Math.min(100, Math.max(0, (slot / Math.max(1, whiteKeyCount)) * 100));
}

/** A time-vertical waterfall coordinate: active notes cross one shared playhead. */
export function waterfallNoteGeometry(event: Pick<NoteEvent, "pitch" | "start" | "duration">, position: number) {
  if (event.pitch === null) return null;
  const left = pitchXPercent(event.pitch);
  const center = left;
  const isBlack = [1, 3, 6, 8, 10].includes(event.pitch % 12);
  return {
    left: `${center}%`,
    width: `${isBlack ? 2.2 : 3.7}%`,
    top: `calc(${WATERFALL_PLAYHEAD_Y}% - ${(event.start - position) * WATERFALL_PIXELS_PER_BEAT}px)`,
    height: `${event.duration * WATERFALL_PIXELS_PER_BEAT}px`,
  };
}

export function keyboardNoteHands(events: readonly NoteEvent[], position: number): Map<number, Set<NoteEvent["hand"]>> {
  const active = new Map<number, Set<NoteEvent["hand"]>>();
  for (const event of events) {
    if (event.pitch === null || position < event.start || position >= event.start + event.duration) continue;
    const hands = active.get(event.pitch) ?? new Set<NoteEvent["hand"]>();
    hands.add(event.hand);
    active.set(event.pitch, hands);
  }
  return active;
}
