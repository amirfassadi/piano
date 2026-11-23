"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Download, Headphones, Heart, Pause, Play, Repeat2, Waves } from "lucide-react";
import { scores, type Score } from "@/lib/catalog";
import { useFavorites } from "@/components/site-shell";

const arrangements = ["آسان", "نسخهٔ اصلی · متوسط", "سخت"];
const notes = [523.25, 587.33, 659.25, 698.46, 783.99, 698.46, 659.25, 587.33, 523.25];

export function ScoreDetail({ score }: { score: Score }) {
  const { liked, toggleLike } = useFavorites();
  const isLiked = liked.includes(score.slug);
  const [arrangement, setArrangement] = useState("نسخهٔ اصلی · متوسط");
  const [mode, setMode] = useState("حالت برگه‌ای");
  const [tempo, setTempo] = useState(92);
  const [playing, setPlaying] = useState(false);
  const [notice, setNotice] = useState("");
  const audioRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const noteIndexRef = useRef(0);

  function stopPreview() {
    if (timerRef.current) clearTimeout(timerRef.current);
    setPlaying(false);
  }

  function playPreview() {
    if (playing) { stopPreview(); return; }
    const AudioContextClass = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) { setNotice("پخش نمونه در این مرورگر پشتیبانی نمی‌شود."); return; }
    const context = audioRef.current ?? new AudioContextClass();
    audioRef.current = context;
    void context.resume();
    setPlaying(true);
    setNotice("اجرای نمونهٔ کوتاه برای پیش‌نمایش فعال است.");
    const playNext = () => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = notes[noteIndexRef.current % notes.length];
      gain.gain.setValueAtTime(0.0001, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.055, context.currentTime + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.38);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + 0.4);
      noteIndexRef.current += 1;
      timerRef.current = setTimeout(playNext, 60000 / tempo);
    };
    playNext();
  }

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (audioRef.current) void audioRef.current.close();
  }, []);

  return <main className="page-wrap content-page">
    <div className="breadcrumbs"><Link href="/">خانه</Link>　/　<Link href="/scores">کتابخانه</Link>　/　{score.title}</div>
    <div className="content-hero detail-hero"><span className="eyebrow">NUANCE · SHEET MUSIC EDITION</span><h1>نت پیانو {score.title} <small dir="auto">({score.latin})</small></h1><p>{score.role} {score.artist} · صفحهٔ اول را رایگان ببینید و تنظیم مناسب خود را انتخاب کنید.</p><div className="detail-hero-meta"><span>PIANO</span><span>{score.category}</span><span>{score.level}</span></div></div>
    <div className="detail-layout">
      <section className="sheet-preview" aria-label={`پیش‌نمایش نت ${score.title}`}>
        {mode === "حالت برگه‌ای" ? <div className="fake-sheet"><div className="staff-label"><span>𝄞</span><strong>{score.title}</strong><span>4/4</span></div><div className="staff-label"><span>♪</span><span>♩　♫　♬　♩　♪</span><span>𝄢</span></div><div className="staff-label"><span>𝄞</span><span>♪　♬　♩　♫　♩</span><span>𝄢</span></div><div className="staff-label"><span>♩</span><span>♫　♪　♬　♪</span><span>♩</span></div></div> : <div className="fake-sheet waterfall"><div className="staff-label"><span>𝄞</span><span>♪　♬　♩　♫</span></div><div className="staff-label"><span>♬　♩　♫　♪</span></div><div className="staff-label"><span>♪　♫　♩　♬</span></div></div>}
      </section>
      <aside className="detail-side">
        <span className="eyebrow">پیش‌نمایش نت و اجرای نمونه</span><h1>{score.title}</h1><p>{score.role} {score.artist}</p>
        <button className={`detail-favorite ${isLiked ? "liked" : ""}`} onClick={() => toggleLike(score.slug)} aria-pressed={isLiked}>
          <Heart size={16} fill={isLiked ? "currentColor" : "none"} />{isLiked ? "ذخیره‌شده در علاقه‌مندی‌ها" : "افزودن به علاقه‌مندی‌ها"}
        </button>
        <div className="detail-controls">
          <button onClick={playPreview}>{playing ? <Pause size={15} /> : <Play size={15} />}{playing ? "توقف" : "پخش نمونه"}</button>
          <button onClick={() => { noteIndexRef.current = 0; if (playing) stopPreview(); }}><Repeat2 size={15} />از ابتدا</button>
          <button onClick={() => setNotice("دریافت PDF به حساب و دسترسی خرید نیاز دارد.")}><Download size={15} />دانلود PDF</button>
        </div>
        <div className="tempo-control"><Headphones size={16} /><label htmlFor="tempo">سرعت: {tempo} BPM</label></div>
        <input id="tempo" type="range" min="40" max="180" value={tempo} onChange={(event) => setTempo(Number(event.target.value))} />
        <div className="detail-controls" aria-label="حالت نمایش نت">{["حالت برگه‌ای", "حالت رولی", "آبشار نت"].map((item) => <button key={item} className={mode === item ? "selected" : ""} aria-pressed={mode === item} onClick={() => setMode(item)}>{item === "آبشار نت" ? <Waves size={14} /> : null}{item}</button>)}</div>
        {notice && <p className="notice" role="status">{notice}</p>}
        <h2>تنظیم‌های منتشرشده</h2><div className="arrangement-list">{arrangements.map((item, index) => <button key={item} className={arrangement === item ? "selected" : ""} onClick={() => setArrangement(item)} aria-pressed={arrangement === item}><span>{item}</span><span>{index === 1 ? "نسخهٔ انتخاب‌شده" : `${index + 2} صفحه`}</span></button>)}</div>
        <p className="notice">صفحهٔ اول نت رایگان و واضح است. دریافت کامل PDF در این بازسازی به سرویس اصلی متصل نیست.</p>
      </aside>
    </div>
    <section className="intro-panel"><h2>دربارهٔ نت {score.title}</h2><p>برای مقایسهٔ تنظیم‌ها، یک بخش یکسان از ملودی را در هر نسخه ببینید و بشنوید. ابتدا سرعت را کم کنید، سپس همراهی دست چپ را با ملودی تمرین کنید.</p><Link href="/scores" className="collection-link"><ArrowRight size={15} /> بازگشت به فهرست قطعات</Link></section>
    <section className="related-works" aria-labelledby="related-title">
      <div className="editorial-heading"><div><span className="eyebrow">CONTINUE EXPLORING</span><h2 id="related-title">قطعه‌های هم‌خانواده</h2></div><Link href="/scores">بازگشت به کتابخانه <ArrowRight size={14} /></Link></div>
      <div className="related-list">{scores.filter((item) => item.slug !== score.slug && item.category === score.category).slice(0, 3).map((item) => <Link className="related-item" href={`/sheet/${item.slug}`} key={item.slug}><span className="related-index">{String(scores.indexOf(item) + 1).padStart(2, "0")}</span><span className="related-name">{item.title}<small>{item.latin}</small></span><span className="related-artist">{item.artist}</span><ArrowRight size={15} /></Link>)}</div>
    </section>
  </main>;
}
