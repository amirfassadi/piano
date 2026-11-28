import test from "node:test";
import assert from "node:assert/strict";
import { arrangementsForPiece, practiceArrangement, practicePiece, practiceStudy, totalBeats, validateEvents, type NoteEvent } from "../lib/practice-data.ts";
import { audioTimeAtBeat, beatAtAudioTime, clampBeat, effectiveBpm, eventHandEnabled, eventSliceAtBeat, formatBeat, nextPosition, normalizeLoop, positionAfterTempoChange, startPosition } from "../lib/practice-transport.ts";
import { keyboardNoteHands, pitchXPercent, scoreXAtBeat, waterfallNoteGeometry } from "../lib/practice-layout.ts";

test("authored exercise is valid and includes both hands, explicit rest, durations and authored fingerings", () => {
  assert.deepEqual(validateEvents(practiceStudy.events, totalBeats), []);
  assert.ok(practiceStudy.events.some((e) => e.hand === "left"));
  assert.ok(practiceStudy.events.some((e) => e.hand === "right"));
  assert.ok(practiceStudy.events.some((e) => e.pitch === null));
  assert.ok(practiceStudy.events.every((e) => e.pitch === null || (e.fingering! >= 1 && e.fingering! <= 5)));
  assert.ok(practiceStudy.events.every((e) => e.duration > 0));
});

test("piece identity and piano setting are separate; unsupported scores have no setting", () => {
  assert.equal(practiceArrangement.pieceSlug, practicePiece.slug);
  assert.equal(arrangementsForPiece(practicePiece.slug)[0].id, practiceArrangement.id);
  assert.deepEqual(arrangementsForPiece("havas"), []);
  assert.deepEqual(practiceArrangement.timeSignature, { numerator: 4, denominator: 4 });
  assert.equal(practiceArrangement.audio.source, "web-audio-synthesis");
});

test("validator accepts simultaneous chord tones in both hands and rejects incomplete/corrupt data", () => {
  const chord: NoteEvent[] = [
    { id: "c1", pitch: 60, start: 0, duration: 2, hand: "right", fingering: 1 },
    { id: "c2", pitch: 64, start: 0, duration: 2, hand: "right", fingering: 3 },
    { id: "c3", pitch: 48, start: 0, duration: 2, hand: "left", fingering: 5 },
    { id: "rest", pitch: null, start: 2, duration: 1, hand: "left" },
  ];
  assert.deepEqual(validateEvents(chord, 4), []);
  assert.deepEqual(validateEvents([{ id: "no-fingering", pitch: 60, start: 0, duration: 1, hand: "right" }], 4), []);
  const bad: NoteEvent[] = [
    { id: "x", pitch: 109, start: -1, duration: 0, hand: "right", fingering: 0 },
    { id: "x", pitch: 60, start: 0, duration: 8, hand: "right" },
  ];
  const errors = validateEvents(bad, 4).join("|");
  assert.match(errors, /duplicate-or-empty-id/);
  assert.match(errors, /invalid-pitch/);
  assert.match(errors, /invalid-time/);
  assert.match(errors, /invalid-fingering/);
});

test("tempo percentages preserve pitch-independent beat conversion and measured audio time", () => {
  assert.equal(effectiveBpm(84, 50), 42);
  assert.equal(effectiveBpm(84, 100), 84);
  assert.equal(effectiveBpm(84, 150), 126);
  for (const bpm of [42, 84, 126]) {
    const time = audioTimeAtBeat(2, 10, 10, bpm);
    assert.ok(Math.abs(beatAtAudioTime(2, 10, time, bpm) - 10) < 1e-9);
    assert.ok(Math.abs(beatAtAudioTime(2, 10, time + 1.25, bpm) - (10 + 1.25 * bpm / 60)) < 1e-9);
  }
  assert.deepEqual(positionAfterTempoChange(3.5, 22, 126), { anchorBeat: 3.5, anchorTime: 22 });
});

test("pause/resume and seek can be represented without accumulated wall-clock drift", () => {
  const atPause = beatAtAudioTime(0, 100, 103, 84);
  assert.equal(atPause, 4.2);
  const resumeAnchor = positionAfterTempoChange(atPause, 110, 84);
  assert.equal(beatAtAudioTime(resumeAnchor.anchorBeat, resumeAnchor.anchorTime, 111, 84), atPause + 1.4);
  assert.equal(clampBeat(-2, totalBeats), 0);
  assert.equal(clampBeat(50, totalBeats), totalBeats);
  assert.deepEqual(formatBeat(8, 4), { measure: 3, beat: 1 });
});

test("A–B loop is ordered, bounded and repeats at A when position reaches B", () => {
  assert.deepEqual(normalizeLoop(10, 4, 16), { a: 4, b: 10 });
  assert.equal(normalizeLoop(4, 4.1, 16), null);
  assert.deepEqual(normalizeLoop(-4, 20, 16), { a: 0, b: 16 });
  assert.equal(nextPosition(10, 16, { a: 4, b: 10 }), 4);
  assert.equal(nextPosition(16, 16, null), 16);
  assert.equal(startPosition(0, 16, { a: 4, b: 10 }), 4);
  assert.equal(startPosition(6, 16, { a: 4, b: 10 }), 6);
  assert.equal(startPosition(10, 16, { a: 4, b: 10 }), 4);
  assert.equal(startPosition(6, 16, null), 6);
});

test("audio and notation beat mapping stay aligned at 50%, 100% and 150%, including after tempo changes", () => {
  const event = practiceStudy.events.find((e) => e.pitch === 72)!;
  const baseTime = 50;
  for (const percent of [50, 100, 150]) {
    const bpm = effectiveBpm(practiceStudy.bpm, percent);
    const audioOnset = audioTimeAtBeat(0, baseTime, event.start, bpm);
    const visualBeatAtAudioOnset = beatAtAudioTime(0, baseTime, audioOnset, bpm);
    assert.ok(Math.abs(visualBeatAtAudioOnset - event.start) < 1e-9);
    const audioDuration = event.duration * 60 / bpm;
    assert.ok(Math.abs(audioDuration * bpm / 60 - event.duration) < 1e-9);
  }
  const beforeChangeBeat = 6.375;
  const changedAt = 987.25;
  const anchor = positionAfterTempoChange(beforeChangeBeat, changedAt, effectiveBpm(practiceStudy.bpm, 150));
  assert.equal(anchor.anchorBeat, beforeChangeBeat);
  assert.ok(Math.abs(beatAtAudioTime(anchor.anchorBeat, anchor.anchorTime, changedAt, 126) - beforeChangeBeat) < 1e-9);
});

test("single audio-clock anchor remains stable over a five-minute passage", () => {
  const bpm = 84;
  const elapsed = 5 * 60;
  const beat = beatAtAudioTime(0, 0, elapsed, bpm);
  assert.ok(Math.abs(beat - elapsed * bpm / 60) < 1e-9);
  const reanchored = positionAfterTempoChange(beat, elapsed, 126);
  assert.equal(beatAtAudioTime(reanchored.anchorBeat, reanchored.anchorTime, elapsed, 126), beat);
});

test("seeking, resuming, looping and retiming preserve only the remaining active-note segment", () => {
  const note = { start: 2, duration: 2 };
  assert.deepEqual(eventSliceAtBeat(note, 0, 16), { startBeat: 2, endBeat: 4, durationBeats: 2, resumedMidEvent: false });
  assert.deepEqual(eventSliceAtBeat(note, 3, 16), { startBeat: 3, endBeat: 4, durationBeats: 1, resumedMidEvent: true });
  assert.deepEqual(eventSliceAtBeat(note, 2.5, 3), { startBeat: 2.5, endBeat: 3, durationBeats: 0.5, resumedMidEvent: true });
  assert.equal(eventSliceAtBeat(note, 4, 16), null);
  assert.equal(eventSliceAtBeat(note, 2, 2), null);
});

test("notation cursor shares onset coordinates with notes, with exactly four measures", () => {
  const beatStarts = [0, 1, 2, 3, 4, 8, 12, 16];
  assert.deepEqual(beatStarts.map(scoreXAtBeat), [84, 137.75, 191.5, 245.25, 299, 514, 729, 944]);
  assert.equal(practiceStudy.measures, 4);
  assert.equal(scoreXAtBeat(totalBeats), 944);
});

test("waterfall pitch columns and keyboard use the same note centers; vertical distance and length follow beats", () => {
  const event = practiceStudy.events.find((item) => item.pitch === 60)!;
  const geometry = waterfallNoteGeometry(event, 0)!;
  assert.equal(geometry.left, `${pitchXPercent(60)}%`);
  assert.equal(geometry.top, `calc(78% - ${event.duration * 58}px)`);
  assert.equal(waterfallNoteGeometry(event, event.start + event.duration / 2)!.top, `calc(78% - ${event.duration * 29}px)`);
  assert.equal(waterfallNoteGeometry(event, event.start + event.duration)!.top, "calc(78% - 0px)");
  assert.equal(geometry.height, `${event.duration * 58}px`);
  assert.notEqual(waterfallNoteGeometry({ ...event, start: 2 }, 0)!.top, geometry.top);
  const chord: NoteEvent[] = [
    { id: "same-r", pitch: 60, start: 0, duration: 2, hand: "right" },
    { id: "same-l", pitch: 60, start: 0, duration: 1, hand: "left" },
  ];
  const hands = keyboardNoteHands(chord, 0.5).get(60);
  assert.deepEqual([...hands!].sort(), ["left", "right"]);
  assert.equal(keyboardNoteHands(chord, 1.5).get(60)?.has("left"), false);
});

test("hand gating follows the explicit hand field and ignores arbitrary event id prefixes", () => {
  const event = { id: "r-but-declared-left", hand: "left" as const };
  assert.equal(eventHandEnabled(event, { left: false, right: true }), false);
  assert.equal(eventHandEnabled(event, { left: true, right: false }), true);
});
