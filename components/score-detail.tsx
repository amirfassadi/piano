"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowUpRight, Download, Heart, Pause, Play, Repeat2 } from "lucide-react";
import { scores, type Score } from "@/lib/catalog";
import { accessLabel, categoryLabel, levelLabel, roleLabel, t } from "@/lib/i18n";
import { ScoreCard } from "@/components/score-card";
import { useFavorites, useLocale } from "@/components/site-shell";
import { difficultyLevels } from "@/lib/catalog-filters";

const notes = [523.25, 587.33, 659.25, 698.46, 783.99, 698.46, 659.25, 587.33, 523.25];

export function ScoreDetail({ score }: { score: Score }) {
  const { locale } = useLocale();
  const { liked, toggleLike } = useFavorites();
  const isLiked = liked.includes(score.slug);
  const isOriginalStudy = score.slug === "nuance-sample";
  const displayTitle = isOriginalStudy && locale === "en" ? "NUANCE Sample Study No. 1" : score.title;
  const choices = useMemo(() => difficultyLevels(score.level).map((level) => levelLabel(level, locale)), [locale, score.level]);
  const [tempo, setTempo] = useState(92);
  const [playing, setPlaying] = useState(false);
  const [notice, setNotice] = useState("");
  const audioRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const noteIndexRef = useRef(0);
  const tempoRef = useRef(tempo);

  useEffect(() => { tempoRef.current = tempo; }, [tempo]);

  function stopPreview() {
    if (timerRef.current) clearTimeout(timerRef.current);
    setPlaying(false);
  }

  function startPreview() {
    const AudioContextClass = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) { setNotice(t(locale, "unsupportedAudio")); return; }
    const context = audioRef.current ?? new AudioContextClass();
    audioRef.current = context;
    void context.resume();
    noteIndexRef.current = 0;
    setPlaying(true);
    setNotice(t(locale, "previewNotice"));
    const playNext = () => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = notes[noteIndexRef.current % notes.length];
      gain.gain.setValueAtTime(0.0001, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.045, context.currentTime + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.36);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + 0.38);
      noteIndexRef.current += 1;
      timerRef.current = setTimeout(playNext, 60000 / tempoRef.current);
    };
    playNext();
  }

  function togglePreview() {
    if (playing) stopPreview();
    else startPreview();
  }

  function restartPreview() {
    const shouldResume = playing;
    if (timerRef.current) clearTimeout(timerRef.current);
    noteIndexRef.current = 0;
    setPlaying(false);
    if (shouldResume) window.setTimeout(startPreview, 0);
    else setNotice(locale === "en" ? "Preview position reset." : "پیش‌نمایش به ابتدا بازگشت.");
  }

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (audioRef.current) void audioRef.current.close();
  }, []);

  const related = scores.filter((item) => item.slug !== score.slug && item.category === score.category).slice(0, 3);
  const relatedScores = related.length >= 3 ? related : [...related, ...scores.filter((item) => item.slug !== score.slug && item.category !== score.category)].slice(0, 3);
  const credit = [roleLabel(score.role, locale), score.artist].filter(Boolean).join(" · ");

  return <main className="page-wrap content-page score-detail-page" id="main-content">
    <nav className="breadcrumbs" aria-label={locale === "en" ? "Breadcrumb" : "مسیر صفحه"}><Link href="/">{t(locale, "breadcrumbsHome")}</Link><span aria-hidden="true">/</span><Link href="/scores">{t(locale, "breadcrumbsLibrary")}</Link><span aria-hidden="true">/</span><span dir="auto">{displayTitle}</span></nav>
    <header className="score-detail-hero">
      <div className="detail-title-block"><span className="eyebrow">NUANCE / SCORE {score.slug.toUpperCase()}</span><h1 className="display-title" dir="auto">{displayTitle}</h1><p dir="auto">{score.latin} {credit && <span>· {credit}</span>}</p></div>
      <div className="detail-art"><Image src={score.cover} alt={`${locale === "en" ? "Artwork for" : "تصویر هنری برای"} ${score.title}`} fill sizes="(max-width: 700px) 100vw, 42vw" /></div>
    </header>
    <div className="detail-meta-row" aria-label={locale === "en" ? "Score details" : "جزئیات نت"}>
      <span><small>{t(locale, "instrument")}</small><strong>{t(locale, "instrument")}</strong></span>
      <span><small>{t(locale, "category")}</small><strong>{categoryLabel(score.category, locale)}</strong></span>
      <span><small>{t(locale, "difficulty")}</small><strong>{levelLabel(score.level, locale)}</strong></span>
      <span><small>{t(locale, "access")}</small><strong>{accessLabel(score.price, score.free, locale)}</strong></span>
    </div>

    <div className="detail-layout">
      <section className="sheet-preview" aria-labelledby="preview-title">
        <div className="preview-label"><span className="eyebrow">NUANCE / PREVIEW</span><h2 id="preview-title">{t(locale, "previewKicker")}</h2></div>
        <div className="fake-sheet" aria-hidden="true">
          <div className="paper-heading"><span>NUANCE · {score.slug.toUpperCase()}</span><strong dir="auto">{score.title}</strong><small dir="auto">{score.artist}</small></div>
          <div className="music-staff"><span className="clef">𝄞</span><div className="staff-lines"><span>♪　♩　♫　♬　♪　♩</span></div></div>
          <div className="music-staff"><span className="clef">𝄢</span><div className="staff-lines"><span>♩　♬　♪　♩　♫　♪</span></div></div>
          <div className="music-staff"><span className="clef">𝄞</span><div className="staff-lines"><span>♬　♪　♩　♫　♩　♬</span></div></div>
          <span className="paper-folio">01</span>
        </div>
        <p className="disclosure-note">{t(locale, "previewDisclosure")}</p>
      </section>
      <aside className="detail-side">
        <span className="eyebrow">NUANCE / PRACTICE</span>
        <h2 dir="auto">{displayTitle}</h2>
        <p className="detail-credit" dir="auto">{credit || score.artist}</p>
        <button type="button" className={`detail-favorite ${isLiked ? "liked" : ""}`} onClick={() => toggleLike(score.slug)} aria-pressed={isLiked}>
          <Heart size={15} fill={isLiked ? "currentColor" : "none"} aria-hidden="true" />
          {t(locale, isLiked ? "removeSavedScore" : "saveScore")}
        </button>
        {isOriginalStudy ? <Link href="/practice/nuance-sample" className="primary-button original-practice-link">{locale === "en" ? "Open interactive practice" : "ورود به تمرین تعاملی"}<ArrowUpRight size={15} /></Link> : <div className="detail-controls">
          <button type="button" className="primary-button" onClick={togglePreview}>{playing ? <Pause size={15} /> : <Play size={15} />}{playing ? t(locale, "stopPreview") : t(locale, "playPreview")}</button>
          <button type="button" className="outline-button" onClick={restartPreview}><Repeat2 size={15} />{t(locale, "restartPreview")}</button>
        </div>}
        {!isOriginalStudy && <><label className="tempo-control" htmlFor="tempo"><span>{t(locale, "tempo")}</span><output>{tempo} BPM</output></label>
        <input className="tempo-slider" id="tempo" type="range" min="40" max="180" value={tempo} onChange={(event) => setTempo(Number(event.target.value))} />
        <p className="disclosure-note">{t(locale, "previewModesUnavailable")}</p></>}
        {notice && <p className="notice" role="status">{notice}</p>}
        <div className="difficulty-picker"><h3>{t(locale, "difficulty")}</h3>{choices.length ? <div className="difficulty-chips">{choices.map((item) => <span className="selected" key={item}>{item}</span>)}</div> : <p>{levelLabel(score.level, locale)}</p>}<small>{isOriginalStudy ? (locale === "en" ? "One original four-measure practice setting." : "یک تنظیم تمرینی تألیفی چهارمیزانی.") : t(locale, "arrangementUnavailable")}</small></div>
        <p className="pdf-access" role="note"><Download size={15} />{t(locale, "pdfUnavailable")}<ArrowLeft size={14} /></p>
        <p className="disclosure-note full-score-note">{t(locale, "fullScoreDisclosure")}</p>
      </aside>
    </div>

    <section className="about-score section-block"><div><span className="eyebrow">NUANCE / NOTE</span><h2>{t(locale, "aboutScore")} <span dir="auto">{score.title}</span></h2></div><p>{t(locale, "previewDisclosure")}</p><Link className="underlined-link" href="/scores">{t(locale, "backToScores")} <ArrowUpRight size={15} /></Link></section>

    <section className="related-section section-block" aria-labelledby="related-title"><div className="section-heading editorial-heading"><div><span className="eyebrow">NUANCE / NEXT</span><h2 id="related-title">{t(locale, "relatedScores")}</h2></div><Link className="underlined-link" href="/scores">{t(locale, "allScores")} <ArrowUpRight size={15} /></Link></div><div className="score-grid related-grid">{relatedScores.map((item, index) => <ScoreCard key={item.slug} score={item} index={index} />)}</div></section>
  </main>;
}
