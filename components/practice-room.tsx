"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Pause, Play, RotateCcw, SkipBack, SkipForward, Volume2, VolumeX } from "lucide-react";
import { practiceStudy, totalBeats } from "@/lib/practice-data";
import { audioTimeAtBeat, beatAtAudioTime, clampBeat, effectiveBpm, eventHandEnabled, eventSliceAtBeat, formatBeat, normalizeLoop, startPosition, type LoopRange } from "@/lib/practice-transport";
import { keyboardNoteHands, pitchXPercent, scoreXAtBeat, waterfallNoteGeometry } from "@/lib/practice-layout";
import { useLocale } from "@/components/site-shell";

const LEFT = "#527b87";
const RIGHT = "#9a4055";
const pitchName = (midi: number) => ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"][midi % 12] + (Math.floor(midi / 12) - 1);
const pc = (midi: number) => midi % 12;
const black = (midi: number) => [1, 3, 6, 8, 10].includes(pc(midi));

function Staff({ position, locale }: { position: number; locale: "en" | "fa" }) {
  const notes = practiceStudy.events.filter((event) => event.pitch !== null);
  const systems = ["right", "left"] as const;
  const diatonic = (pitch: number) => {
    const letters = ["C", "D", "E", "F", "G", "A", "B"];
    const name = pitchName(pitch);
    const letter = letters.indexOf(name[0]);
    return (Math.floor(pitch / 12) - 1) * 7 + letter;
  };
  const positionY = (pitch: number, clef: "treble" | "bass") => {
    const base = clef === "treble" ? diatonic(64) : diatonic(43); // E4 / G2 are bottom staff lines.
    return (clef === "treble" ? 123 : 268) - (diatonic(pitch) - base) * 5;
  };
  const displayBeat = clampBeat(position, totalBeats);
  return <div className="practice-score-scroll"><svg className="practice-staff" viewBox="0 0 960 320" role="img" aria-label={locale === "en" ? "Four-measure grand staff; red notes are right hand and blue notes left hand" : "پنج‌خط حامل چهار میزان؛ نت‌های زرشکی دست راست و آبی دست چپ"}>
    <rect x="0" y="0" width="960" height="320" fill="#fffefa" />
    <text x="22" y="26" className="staff-heading">NUANCE · ORIGINAL STUDY IN C MAJOR</text>
    <text x="67" y="75" className="time-signature">4/4</text>
    {systems.map((hand, row) => {
      const top = row === 0 ? 83 : 228;
      const clef = row === 0 ? "treble" : "bass";
      return <g key={hand}>
        {Array.from({ length: 5 }, (_, i) => <line key={i} x1="65" x2="925" y1={top + i * 10} y2={top + i * 10} className="staff-line" />)}
        <text x="23" y={top + 38} className="staff-clef">{row === 0 ? "𝄞" : "𝄢"}</text>
        {[0, 1, 2, 3, 4].map((m) => <g key={m}><line x1={65 + m * 215} x2={65 + m * 215} y1={top} y2={top + 40} className="bar-line" />{m < 4 && <text x={172 + m * 215} y={top - 8} className="measure-number">{m + 1}</text>}</g>)}
        {notes.filter((e) => e.hand === hand).map((event) => {
          const pitch = event.pitch!;
          const x = scoreXAtBeat(event.start);
          const y = positionY(pitch, clef);
          const active = position >= event.start && position < event.start + event.duration;
          const color = hand === "right" ? RIGHT : LEFT;
          const letter = pitchName(pitch)[0];
          const accidental = pitchName(pitch).includes("♯");
          const stemDown = row === 0 && y < top + 20;
          return <g key={event.id} className={active ? "score-note active" : "score-note"}>
            {accidental && <text x={x - 14} y={y + 4} fill={color} className="accidental">♯</text>}
            <ellipse cx={x} cy={y} rx="6.4" ry="4.4" transform={`rotate(-18 ${x} ${y})`} fill={event.duration >= 2 ? "#fffefa" : color} stroke={color} strokeWidth="1.5" />
            {event.duration < 4 && <line x1={stemDown ? x - 5 : x + 5} y1={y} x2={stemDown ? x - 5 : x + 5} y2={stemDown ? y + 30 : y - 30} stroke={color} strokeWidth="1.5" />}
            {event.fingering !== undefined && <text x={x} y={y - 14} textAnchor="middle" fill={color} className="fingering-label">{event.fingering}</text>}
            {diatonic(pitch) < diatonic(clef === "treble" ? 64 : 43) && <line x1={x - 9} x2={x + 9} y1={y} y2={y} className="ledger-line" />}
            <title>{`${letter} ${pitchName(pitch)}${event.fingering === undefined ? "" : ` · ${locale === "en" ? "finger" : "انگشت"} ${event.fingering}`}`}</title>
          </g>;
        })}
        {practiceStudy.events.filter((event) => event.hand === hand && event.pitch === null).map((event) => { const x = scoreXAtBeat(event.start); return <text key={event.id} x={x} y={top + 25} textAnchor="middle" className="rest-symbol">𝄽<title>{locale === "en" ? "Quarter rest" : "سکوت سیاه"}</title></text>; })}
      </g>;
    })}
    <line x1={scoreXAtBeat(displayBeat)} x2={scoreXAtBeat(displayBeat)} y1="75" y2="274" className="score-cursor" />
  </svg></div>;
}

function Waterfall({ position, loop, locale }: { position: number; loop: LoopRange; locale: "en" | "fa" }) {
  const notes = practiceStudy.events.filter((event) => event.pitch !== null);
  return <div className="waterfall" role="img" aria-label={locale === "en" ? "Time-vertical pitch-horizontal note waterfall synchronized to the keyboard" : "آبشار نت با محور زمان عمودی و زیر و بمی افقی، هماهنگ با کلاویه"}>
    {Array.from({ length: 5 }, (_, i) => <div key={i} className="waterfall-measure-line" style={{ top: `calc(78% - ${(i * 4 - position) * 58}px)` }}><span>{i < 4 ? i + 1 : ""}</span></div>)}
    {notes.map((event) => { const geometry = waterfallNoteGeometry(event, position)!; return <span key={event.id} className={`waterfall-note ${event.hand} ${position >= event.start && position < event.start + event.duration ? "current" : ""}`} style={{ left: geometry.left, width: geometry.width, top: geometry.top, height: geometry.height }} title={`${pitchName(event.pitch!)} · ${event.hand} · finger ${event.fingering}`} />; })}
    {loop && <div className="loop-shade" aria-label={`A ${loop.a} – B ${loop.b}`} />}
    <div className="waterfall-cursor" />
  </div>;
}

export function PracticeRoom() {
  const { locale } = useLocale();
  const en = locale === "en";
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [tempoPercent, setTempoPercent] = useState(100);
  const [view, setView] = useState<"score" | "waterfall">("score");
  const [loop, setLoop] = useState<LoopRange>(null);
  const [leftOn, setLeftOn] = useState(true);
  const [rightOn, setRightOn] = useState(true);
  const [notice, setNotice] = useState("");
  const ctxRef = useRef<AudioContext | null>(null);
  const runningRef = useRef(false);
  const startupRef = useRef(false);
  const generationRef = useRef(0);
  const anchorRef = useRef({ beat: 0, time: 0 });
  const bpmRef = useRef<number>(practiceStudy.bpm);
  const loopRef = useRef<LoopRange>(null);
  const positionRef = useRef(0);
  const mutedRef = useRef({ left: true, right: true });
  const timerRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const voicesRef = useRef(new Map<string, { source: OscillatorNode; gain: GainNode; start: number; end: number; hand: "left" | "right" }>());
  const scheduledRef = useRef(new Set<string>());
  const startBeatRef = useRef(0);
  const label = useMemo(() => formatBeat(position, practiceStudy.beatsPerMeasure), [position]);

  const killVoices = useCallback((futureOnly = false) => {
    const ctx = ctxRef.current;
    const now = ctx?.currentTime ?? 0;
    for (const [key, voice] of voicesRef.current) {
      if (!futureOnly || voice.start > now + 0.005) {
        try { voice.gain.gain.cancelScheduledValues(now); voice.gain.gain.setTargetAtTime(0.0001, now, 0.015); voice.source.stop(now + 0.055); } catch { /* already ended */ }
        voicesRef.current.delete(key);
        scheduledRef.current.delete(key);
      }
    }
  }, []);

  const clearClock = useCallback(() => {
    if (timerRef.current !== null) window.clearInterval(timerRef.current);
    if (rafRef.current !== null) window.cancelAnimationFrame(rafRef.current);
    timerRef.current = null; rafRef.current = null;
  }, []);

  const halt = useCallback((reset = false) => {
    generationRef.current += 1;
    startupRef.current = false;
    runningRef.current = false;
    clearClock();
    killVoices(false);
    if (reset) { positionRef.current = 0; anchorRef.current = { beat: 0, time: ctxRef.current?.currentTime ?? 0 }; setPosition(0); }
    setPlaying(false);
  }, [clearClock, killVoices]);

  const begin = useCallback(async (from = positionRef.current) => {
    if (startupRef.current || runningRef.current) return;
    const AC = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) { setNotice(en ? "Web Audio is unavailable in this browser." : "پخش صدا در این مرورگر پشتیبانی نمی‌شود."); return; }
    startupRef.current = true;
    const generation = ++generationRef.current;
    try {
    const ctx = ctxRef.current ?? new AC(); ctxRef.current = ctx;
    await ctx.resume();
    if (generation !== generationRef.current) return;
    killVoices(false);
    const requested = from >= totalBeats && !loopRef.current ? 0 : from;
    const start = startPosition(requested, totalBeats, loopRef.current);
    positionRef.current = start;
    anchorRef.current = { beat: start, time: ctx.currentTime + 0.045 };
    startBeatRef.current = start;
    scheduledRef.current.clear();
    runningRef.current = true;
    clearClock();
    setPosition(start); setPlaying(true); setNotice("");
    const schedule = () => {
      if (!runningRef.current || !ctxRef.current) return;
      const audio = ctxRef.current;
      const now = audio.currentTime;
      let beat = beatAtAudioTime(anchorRef.current.beat, anchorRef.current.time, now, bpmRef.current);
      const activeLoop = loopRef.current;
      if (activeLoop && beat >= activeLoop.b) {
        anchorRef.current = { beat: activeLoop.a, time: audioTimeAtBeat(anchorRef.current.beat, anchorRef.current.time, activeLoop.b, bpmRef.current) };
        beat = activeLoop.a + (beat - activeLoop.b);
        startBeatRef.current = activeLoop.a;
        scheduledRef.current.clear();
      } else if (!activeLoop && beat >= totalBeats) {
        positionRef.current = totalBeats; setPosition(totalBeats); halt(false); return;
      }
      positionRef.current = beat;
      const horizonBeat = beatAtAudioTime(anchorRef.current.beat, anchorRef.current.time, now + 0.16, bpmRef.current);
      const stopAt = activeLoop?.b ?? totalBeats;
      for (const event of practiceStudy.events) {
        if (event.pitch === null || !eventHandEnabled(event, mutedRef.current)) continue;
        const eventStart = event.start;
        const eventEnd = event.start + event.duration;
        if (eventEnd <= startBeatRef.current + 0.0001 || eventStart >= stopAt || eventEnd <= beat + 0.0001 || eventStart > horizonBeat) continue;
        const slice = eventSliceAtBeat(event, beat, stopAt);
        if (!slice) continue;
        const when = slice.resumedMidEvent ? now + 0.015 : audioTimeAtBeat(anchorRef.current.beat, anchorRef.current.time, slice.startBeat, bpmRef.current);
        const key = `${event.id}:${when.toFixed(4)}`;
        if (scheduledRef.current.has(key)) continue;
        const voice = audio.createOscillator(); const gain = audio.createGain();
        const duration = slice.durationBeats * 60 / bpmRef.current;
        const end = when + Math.max(0.04, duration);
        voice.type = practiceStudy.audio.waveform; voice.frequency.value = practiceStudy.audio.referenceHz * Math.pow(2, (event.pitch! - practiceStudy.audio.referenceMidi) / 12);
        gain.gain.setValueAtTime(0.0001, when);
        gain.gain.linearRampToValueAtTime(event.hand === "left" ? 0.038 : 0.048, when + 0.012);
        gain.gain.setValueAtTime(event.hand === "left" ? 0.038 : 0.048, Math.max(when + 0.013, end - 0.035));
        gain.gain.exponentialRampToValueAtTime(0.0001, end);
        voice.connect(gain).connect(audio.destination); voice.start(when); voice.stop(end + 0.01);
        voicesRef.current.set(key, { source: voice, gain, start: when, end, hand: event.hand }); scheduledRef.current.add(key);
      }
      for (const [key, voice] of voicesRef.current) if (voice.end < now - 0.1) { voicesRef.current.delete(key); scheduledRef.current.delete(key); }
    };
    schedule(); timerRef.current = window.setInterval(schedule, 20);
    const update = () => {
      if (!runningRef.current || !ctxRef.current) return;
      const b = beatAtAudioTime(anchorRef.current.beat, anchorRef.current.time, ctxRef.current.currentTime, bpmRef.current);
      const loopNow = loopRef.current;
      const shown = loopNow && b >= loopNow.b ? loopNow.a + ((b - loopNow.b) % (loopNow.b - loopNow.a)) : Math.min(b, totalBeats);
      positionRef.current = shown; setPosition(shown); rafRef.current = window.requestAnimationFrame(update);
    };
    rafRef.current = window.requestAnimationFrame(update);
    } catch {
      if (generation === generationRef.current) {
        runningRef.current = false;
        clearClock();
        setPlaying(false);
        setNotice(en ? "Audio could not start. Check browser audio permissions, then try again." : "صدا شروع نشد. اجازهٔ پخش مرورگر را بررسی کنید و دوباره بزنید.");
      }
    } finally {
      if (generation === generationRef.current) startupRef.current = false;
    }
  }, [clearClock, en, halt, killVoices]);

  const pause = useCallback(() => {
    if (startupRef.current) {
      halt(false);
      const paused = clampBeat(positionRef.current, totalBeats);
      positionRef.current = paused; setPosition(paused);
      return;
    }
    const ctx = ctxRef.current;
    if (runningRef.current && ctx) positionRef.current = beatAtAudioTime(anchorRef.current.beat, anchorRef.current.time, ctx.currentTime, bpmRef.current);
    const paused = clampBeat(positionRef.current, totalBeats);
    halt(false); positionRef.current = paused; setPosition(paused);
  }, [halt]);

  const seek = (beat: number) => {
    const next = clampBeat(beat, totalBeats); const resume = runningRef.current;
    if (resume) pause(); else { if (startupRef.current) halt(false); killVoices(false); }
    positionRef.current = next; setPosition(next);
    if (resume) void begin(next);
  };

  const changeTempo = (percent: number) => {
    const ctx = ctxRef.current;
    const wasRunning = runningRef.current;
    if (wasRunning && ctx) {
      positionRef.current = beatAtAudioTime(anchorRef.current.beat, anchorRef.current.time, ctx.currentTime, bpmRef.current);
      runningRef.current = false; clearClock();
      killVoices(false);
    }
    const beat = positionRef.current;
    setTempoPercent(percent); bpmRef.current = effectiveBpm(practiceStudy.bpm, percent);
    if (wasRunning) void begin(beat);
  };

  const setMark = (mark: "a" | "b") => {
    const ctx = ctxRef.current;
    const beat = runningRef.current && ctx ? beatAtAudioTime(anchorRef.current.beat, anchorRef.current.time, ctx.currentTime, bpmRef.current) : positionRef.current;
    const existing = loopRef.current ?? { a: 0, b: totalBeats };
    const next = mark === "a" ? normalizeLoop(beat, existing.b, totalBeats) : normalizeLoop(existing.a, beat, totalBeats);
    loopRef.current = next; setLoop(next);
    if (!next) setNotice(en ? "Choose A and B at least one quarter-beat apart." : "نقطه‌های A و B باید دست‌کم یک‌چهارم ضرب فاصله داشته باشند.");
    else setNotice("");
    if (runningRef.current) seek(beat);
  };

  const toggleHand = (hand: "left" | "right") => {
    const next = { ...mutedRef.current, [hand]: !mutedRef.current[hand] };
    mutedRef.current = next;
    if (hand === "left") setLeftOn(next.left); else setRightOn(next.right);
    if (!next[hand]) for (const [key, voice] of voicesRef.current) {
      if (voice.hand === hand) {
        const now = ctxRef.current?.currentTime ?? 0;
        try { voice.gain.gain.cancelScheduledValues(now); voice.gain.gain.setTargetAtTime(0.0001, now, 0.012); voice.source.stop(now + 0.05); } catch { /* already ended */ }
        voicesRef.current.delete(key); scheduledRef.current.delete(key);
      }
    }
  };

  useEffect(() => {
    const pauseWhenHidden = () => {
      if (!document.hidden || !runningRef.current || !ctxRef.current) return;
      const paused = clampBeat(beatAtAudioTime(anchorRef.current.beat, anchorRef.current.time, ctxRef.current.currentTime, bpmRef.current), totalBeats);
      halt(false); positionRef.current = paused; setPosition(paused);
    };
    document.addEventListener("visibilitychange", pauseWhenHidden);
    return () => document.removeEventListener("visibilitychange", pauseWhenHidden);
  }, [halt]);
  useEffect(() => () => { generationRef.current += 1; startupRef.current = false; runningRef.current = false; if (timerRef.current !== null) window.clearInterval(timerRef.current); if (rafRef.current !== null) window.cancelAnimationFrame(rafRef.current); for (const v of voicesRef.current.values()) { try { v.source.stop(); } catch { /* already ended */ } } voicesRef.current.clear(); if (ctxRef.current) void ctxRef.current.close(); }, []);

  const currentBpm = effectiveBpm(practiceStudy.bpm, tempoPercent);
  const seconds = position * 60 / currentBpm;
  const blackKeys = Array.from({ length: 40 }, (_, i) => 45 + i);
  const activePitches = keyboardNoteHands(practiceStudy.events, position);
  const enButtons = (fa: string, english: string) => en ? english : fa;

  return <main className="page-wrap content-page practice-page" id="main-content" dir={en ? "ltr" : "rtl"}>
    <nav className="breadcrumbs" aria-label={en ? "Breadcrumb" : "مسیر صفحه"}><Link href="/">{en ? "Home" : "خانه"}</Link><span>/</span><Link href="/scores">{en ? "Library" : "کتابخانه"}</Link><span>/</span><span>{en ? "Practice" : "تمرین"}</span></nav>
    <header className="practice-heading"><div><span className="eyebrow">NUANCE / ORIGINAL EXERCISE</span><h1 className="display-title">{practiceStudy.title[locale]}</h1><p>{practiceStudy.composer[locale]} · {practiceStudy.measures} {en ? "measures · 4/4" : "میزان · ۴/۴"}</p></div><Link href="/sheet/nuance-sample" className="underlined-link"><ArrowLeft size={15} />{en ? "Score details" : "جزئیات قطعه"}</Link></header>
    <p className="practice-disclosure">{en ? "An original NUANCE exercise, not a transcription of a published work. Suggested fingerings are part of this authored exercise. No microphone or MIDI performance detection is used." : "تمرینی تألیفی از NUANCE است، نه رونویسی از اثری منتشرشده. انگشت‌گذاری‌ها بخشی از همین تمرین تألیفی هستند. از میکروفن یا MIDI برای تشخیص اجرای نوازنده استفاده نمی‌شود."}</p>
    <section className="practice-player" aria-label={en ? "Interactive piano practice" : "تمرین تعاملی پیانو"}>
      <div className="practice-view-toggle" role="group" aria-label={en ? "Notation view" : "نمای نت"}><button aria-pressed={view === "score"} className={view === "score" ? "selected" : ""} onClick={() => setView("score")}>{en ? "Standard score" : "نت استاندارد"}</button><button aria-pressed={view === "waterfall"} className={view === "waterfall" ? "selected" : ""} onClick={() => setView("waterfall")}>{en ? "Waterfall" : "آبشار نت"}</button></div>
      {view === "score" ? <Staff position={position} locale={locale} /> : <Waterfall position={position} loop={loop} locale={locale} />}
      <div className="hand-legend"><span className="right-legend"><i />{en ? "Right hand" : "دست راست"} · 1–5</span><span className="left-legend"><i />{en ? "Left hand" : "دست چپ"} · 1–5</span></div>
      <div className="piano-keyboard" role="img" aria-label={en ? "Virtual piano keyboard showing active notes" : "کلاویهٔ مجازی با نمایش نت فعال"}>{blackKeys.filter((m) => !black(m)).map((midi) => { const hands = activePitches.get(midi); return <span key={midi} className={`white-key ${hands?.has("right") && rightOn ? "right" : ""} ${hands?.has("left") && leftOn ? "left" : ""}`} title={pitchName(midi)}><small>{pitchName(midi)}</small></span>; })}{blackKeys.filter(black).map((midi) => { const hands = activePitches.get(midi); const rightActive = hands?.has("right") && rightOn; const leftActive = hands?.has("left") && leftOn; return <span key={midi} className={`black-key ${rightActive ? "right" : ""} ${leftActive ? "left" : ""} ${rightActive || leftActive ? "active" : ""}`} style={{ left: `${pitchXPercent(midi)}%` }} title={pitchName(midi)} />; })}</div>
      <div className="transport-position"><label htmlFor="position-slider">{en ? "Position" : "موقعیت"}</label><input id="position-slider" type="range" min="0" max={totalBeats} step="0.05" value={position} onChange={(e) => seek(Number(e.target.value))} aria-valuetext={`${en ? "Measure" : "میزان"} ${label.measure}, ${en ? "beat" : "ضرب"} ${Math.floor(label.beat)}`} /><output>{en ? `M${label.measure} · ${Math.floor(label.beat)}` : `م${label.measure} · ض${Math.floor(label.beat)}`} · {Math.floor(seconds / 60)}:{String(Math.floor(seconds % 60)).padStart(2, "0")}</output></div>
      <div className="practice-controls"><button type="button" className="primary-button" onClick={() => playing ? pause() : void begin()} aria-label={playing ? enButtons("مکث", "Pause") : enButtons("شروع یا ادامه", "Start or resume")}>{playing ? <Pause size={16} /> : <Play size={16} />}{playing ? enButtons("مکث", "Pause") : position > 0 ? enButtons("ادامه", "Resume") : enButtons("شروع", "Start")}</button><button type="button" className="outline-button" onClick={() => seek(0)}><RotateCcw size={15} />{enButtons("از ابتدا", "Beginning")}</button><button type="button" className="outline-button" onClick={() => seek(Math.max(0, Math.floor(position / 4) * 4))}><SkipBack size={15} />{enButtons("ابتدای میزان", "Measure start")}</button><button type="button" className="outline-button" onClick={() => seek(Math.min(totalBeats, (Math.floor(position / 4) + 1) * 4))}><SkipForward size={15} />{enButtons("میزان بعد", "Next measure")}</button></div>
      <div className="practice-options"><label className="tempo-label" htmlFor="tempo-percent"><span>{en ? "Tempo" : "سرعت"}</span><strong>{tempoPercent}% · {Math.round(currentBpm)} BPM</strong></label><input id="tempo-percent" type="range" min="50" max="150" step="1" value={tempoPercent} onChange={(e) => changeTempo(Number(e.target.value))} /><small>{en ? `Base ${practiceStudy.bpm} BPM; pitch remains unchanged.` : `سرعت پایه ${practiceStudy.bpm} ضرب در دقیقه است؛ زیر و بمی تغییر نمی‌کند.`}</small>
        <div className="hand-switches"><button type="button" className={rightOn ? "hand-on right-hand" : "hand-off"} aria-pressed={rightOn} onClick={() => toggleHand("right")}>{rightOn ? <Volume2 size={15} /> : <VolumeX size={15} />}{en ? "Right hand" : "دست راست"}</button><button type="button" className={leftOn ? "hand-on left-hand" : "hand-off"} aria-pressed={leftOn} onClick={() => toggleHand("left")}>{leftOn ? <Volume2 size={15} /> : <VolumeX size={15} />}{en ? "Left hand" : "دست چپ"}</button></div>
        <div className="ab-loop"><strong>{en ? "Repeat section" : "تکرار بازه"}</strong><button type="button" aria-pressed={!!loop} onClick={() => setMark("a")}>A {loop ? `${loop.a.toFixed(1)}` : "·"}</button><button type="button" aria-pressed={!!loop} onClick={() => setMark("b")}>B {loop ? `${loop.b.toFixed(1)}` : "·"}</button><button type="button" disabled={!loop} onClick={() => { loopRef.current = null; setLoop(null); setNotice(""); }}>{en ? "Clear" : "پاک‌کردن"}</button></div>
      </div>
      {notice && <p className="notice" role="status">{notice}</p>}
    </section>
  </main>;
}
