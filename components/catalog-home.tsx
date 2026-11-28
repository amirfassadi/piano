"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState, type FormEvent } from "react";
import { ArrowDownRight, ArrowUpRight, Search, SlidersHorizontal } from "lucide-react";
import { categories, levels, scores } from "@/lib/catalog";
import { categoryLabel, levelLabel, t } from "@/lib/i18n";
import { ScoreCard } from "@/components/score-card";
import { useFavorites, useLocale } from "@/components/site-shell";
import { matchesDifficulty } from "@/lib/catalog-filters";
import { useCatalogNavigation } from "@/components/use-catalog-navigation";

const collectionRoutes: Record<string, string> = {
  "ترانه‌های ایرانی": "iranian-piano-sheets",
  "کلاسیک": "classical-piano-sheets",
  "موسیقی فیلم": "film-piano-sheets",
  "بی‌کلام": "instrumental-piano-sheets",
};

function DifficultyRank(level: string): number {
  if (level.includes("آسان")) return 1;
  if (level.includes("متوسط")) return 2;
  if (level.includes("سخت")) return 3;
  return 4;
}

export function CatalogHome({ initialQuery = "", initialCategory = "", initialDifficulty = "" }: { initialQuery?: string; initialCategory?: string; initialDifficulty?: string }) {
  const { locale } = useLocale();
  const { liked, toggleLike } = useFavorites();
  const navigate = useCatalogNavigation();
  const [category, setCategory] = useState(initialCategory || "همه");
  const [level, setLevel] = useState(initialDifficulty || "همهٔ سطح‌ها");
  const [access, setAccess] = useState("all");
  const [sort, setSort] = useState("popular");
  const [visible, setVisible] = useState(12);
  const [query, setQuery] = useState(initialQuery);

  const filteredScores = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase(locale === "fa" ? "fa-IR" : "en-US");
    const filtered = scores.filter((score) => {
      const searchable = `${score.title} ${score.latin} ${score.artist}`.toLocaleLowerCase(locale === "fa" ? "fa-IR" : "en-US");
      const matchesQuery = !normalized || searchable.includes(normalized);
      const matchesCategory = category === "همه" || score.category === category;
      const matchesLevel = matchesDifficulty(score.level, level);
      const matchesAccess = access === "all" || (access === "free" ? Boolean(score.free) : liked.includes(score.slug));
      return matchesQuery && matchesCategory && matchesLevel && matchesAccess;
    });
    if (sort === "popular") return filtered.sort((a, b) => b.likes - a.likes);
    if (sort === "easy") return filtered.sort((a, b) => DifficultyRank(a.level) - DifficultyRank(b.level) || b.likes - a.likes);
    return filtered.sort((a, b) => Number(Boolean(b.recent)) - Number(Boolean(a.recent)) || b.likes - a.likes);
  }, [access, category, level, liked, locale, query, sort]);

  const featured = useMemo(() => [...scores].sort((a, b) => b.likes - a.likes).slice(0, 4), []);
  const recent = scores.filter((score) => score.recent).slice(0, 3);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    navigate({ q: query, category, difficulty: level });
    document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function selectDifficulty(nextLevel: string) {
    setLevel(nextLevel);
    setAccess("all");
    navigate({ q: query, category, difficulty: nextLevel });
    document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function collectionHref(item: string) {
    const route = collectionRoutes[item];
    return route ? `/${route}` : `/scores?category=${encodeURIComponent(item)}`;
  }

  return (
    <main className="page-wrap" id="main-content">
      <section className="home-hero" aria-labelledby="home-title">
        <div className="hero-copy">
          <span className="eyebrow"><i aria-hidden="true" />{t(locale, "homeEyebrow")}</span>
          <h1 id="home-title" className="display-title">{t(locale, "homeTitle")}</h1>
          <p className="hero-lead">{t(locale, "homeLead")}</p>
          <form className="hero-search" role="search" onSubmit={submitSearch}>
            <label className="visually-hidden" htmlFor="hero-search">{t(locale, "heroSearchLabel")}</label>
            <Search size={18} aria-hidden="true" />
            <input id="hero-search" type="search" dir="auto" placeholder={t(locale, "heroSearchPlaceholder")} value={query} onChange={(event) => { setQuery(event.target.value); setVisible(12); }} />
            <button type="submit" aria-label={t(locale, "searchButton")}><ArrowUpRight size={18} /></button>
          </form>
          <div className="hero-actions">
            <a className="text-link" href="#catalog">{t(locale, "heroBrowse")} <ArrowDownRight size={15} aria-hidden="true" /></a>
            <Link className="text-link muted-link" href="/song-requests">{t(locale, "heroRequest")} <ArrowUpRight size={15} aria-hidden="true" /></Link>
          </div>
          <div className="hero-footnote"><span>01 / {locale === "en" ? "A living archive" : "آرشیوی زنده"}</span><span className="staff-rule" aria-hidden="true"><i /><i /><i /><i /><i /></span></div>
        </div>
        <figure className="hero-art">
          <Image src="/images/score-cover-2.png" alt={locale === "en" ? "Warmly lit piano keys in a room of music and memory" : "کلیدهای پیانو در فضایی گرم، میان موسیقی و خاطره"} fill priority sizes="(max-width: 760px) 100vw, 52vw" />
          <figcaption><span>NUANCE / ARCHIVE</span><span>PIANO · VOL. I</span></figcaption>
          <span className="hero-issue" aria-hidden="true">N° 01</span>
        </figure>
      </section>

      <section className="recent-strip" aria-labelledby="recent-title">
        <div className="strip-label"><span className="eyebrow">{t(locale, "recentKicker")}</span><h2 id="recent-title">{t(locale, "recentTitle")}</h2></div>
        <div className="recent-items">
          {recent.map((score) => <Link href={`/sheet/${score.slug}`} className="recent-item" key={score.slug}><span dir="auto">{score.title}</span><small dir="auto">{score.artist}</small><ArrowUpRight size={14} aria-hidden="true" /></Link>)}
        </div>
        <Link className="strip-more" href="/song-requests">{t(locale, "recentLink")} <ArrowUpRight size={14} /></Link>
      </section>

      <section className="section-block featured-section" aria-labelledby="featured-title">
        <div className="section-heading editorial-heading">
          <div><span className="eyebrow">{t(locale, "featuredKicker")}</span><h2 id="featured-title">{t(locale, "featuredTitle")}</h2><p>{t(locale, "featuredLead")}</p></div>
          <Link className="underlined-link" href="/scores">{t(locale, "allScores")} <ArrowUpRight size={15} /></Link>
        </div>
        <div className="score-grid featured-grid">
          {featured.map((score, index) => <ScoreCard key={score.slug} score={score} index={index} />)}
        </div>
      </section>

      <section className="collections-section section-block" aria-labelledby="collections-title">
        <div className="section-heading editorial-heading">
          <div><span className="eyebrow">{t(locale, "collectionsKicker")}</span><h2 id="collections-title">{t(locale, "collectionsTitle")}</h2><p>{t(locale, "collectionsLead")}</p></div>
          <span className="section-count">0{categories.length - 1} / {locale === "en" ? "collections" : "مجموعه"}</span>
        </div>
        <div className="collection-grid">
          {categories.slice(1).map((item, index) => {
            const count = scores.filter((score) => score.category === item).length;
            const href = collectionHref(item);
            return <Link href={href} className={`collection-tile tile-${index + 1}`} key={item}>
              <span className="tile-index">0{index + 1}</span>
              <span className="tile-title">{categoryLabel(item, locale)}</span>
              <span className="tile-meta">{count.toLocaleString(locale === "fa" ? "fa-IR" : "en-US")} {t(locale, "countScores")}</span>
              <ArrowUpRight className="tile-arrow" size={19} aria-hidden="true" />
            </Link>;
          })}
        </div>
      </section>

      <section className="instrument-band section-block" aria-label={t(locale, "instrumentTitle")}>
        <div className="instrument-mark" aria-hidden="true"><span>♩</span><i /><i /><i /></div>
        <div className="instrument-copy"><span className="eyebrow">{t(locale, "instrumentKicker")}</span><h2>{t(locale, "instrumentTitle")}</h2><p>{t(locale, "instrumentLead")}</p></div>
        <Link className="round-arrow-link" href="/scores" aria-label={t(locale, "instrumentLink")}><ArrowUpRight size={19} /></Link>
      </section>

      <section className="difficulty-section section-block" aria-labelledby="difficulty-title">
        <div><span className="eyebrow">{t(locale, "difficultyKicker")}</span><h2 id="difficulty-title">{t(locale, "difficultyTitle")}</h2><p>{t(locale, "difficultyLead")}</p></div>
        <div className="difficulty-options">
          {levels.slice(1).map((item, index) => <button type="button" key={item} className="difficulty-option" onClick={() => selectDifficulty(item)}>
            <span className="difficulty-number">0{index + 1}</span><span>{levelLabel(item, locale)}</span><ArrowUpRight size={15} aria-hidden="true" />
          </button>)}
        </div>
      </section>

      <section className="editorial-note section-block">
        <div className="note-image"><Image src="/images/score-cover.png" alt={locale === "en" ? "Open sheet music beside a grand piano" : "نت موسیقی گشوده در کنار پیانوی بزرگ"} fill sizes="(max-width: 760px) 100vw, 42vw" /></div>
        <div className="note-copy"><span className="eyebrow">{t(locale, "editorialKicker")}</span><h2>{t(locale, "editorialTitle")}</h2><p>{t(locale, "editorialLead")}</p><Link className="underlined-link" href="/classical-piano-sheets">{categoryLabel("کلاسیک", locale)} <ArrowUpRight size={15} /></Link></div>
      </section>

      <section className="catalog-section section-block" id="catalog" aria-labelledby="catalog-title">
        <div className="section-heading editorial-heading catalog-heading">
          <div><span className="eyebrow">{t(locale, "sectionLabel")}</span><h2 id="catalog-title">{t(locale, "catalogTitle")}</h2><p>{t(locale, "catalogLead")}</p></div>
          <form className="catalog-search" role="search" onSubmit={submitSearch}>
            <label className="visually-hidden" htmlFor="catalog-search">{t(locale, "searchLabel")}</label><Search size={16} aria-hidden="true" />
            <input id="catalog-search" type="search" dir="auto" value={query} onChange={(event) => { setQuery(event.target.value); setVisible(12); }} placeholder={t(locale, "searchPlaceholder")} />
          </form>
        </div>
        <div className="catalog-controls">
          <div className="access-tabs" role="group" aria-label={t(locale, "access")}>
            <button type="button" className={`tab-button ${access === "all" ? "active" : ""}`} aria-pressed={access === "all"} onClick={() => setAccess("all")}>{t(locale, "allScores")}</button>
            <button type="button" className={`tab-button ${access === "free" ? "active" : ""}`} aria-pressed={access === "free"} onClick={() => setAccess("free")}>{t(locale, "freeScores")} <span>{scores.filter((score) => score.free).length}</span></button>
            <button type="button" className={`tab-button ${access === "liked" ? "active" : ""}`} aria-pressed={access === "liked"} onClick={() => setAccess("liked")} disabled={!liked.length} title={!liked.length ? t(locale, "favoritesUnavailable") : undefined}>{t(locale, "favorites")} <span>{liked.length}</span></button>
          </div>
          <label className="sort-control"><SlidersHorizontal size={15} aria-hidden="true" /><span>{t(locale, "sort")}</span><select value={sort} onChange={(event) => setSort(event.target.value)}><option value="popular">{t(locale, "popular")}</option><option value="easy">{t(locale, "easiest")}</option><option value="recent">{t(locale, "recentSort")}</option></select></label>
        </div>
        <div className="filter-set" aria-label={t(locale, "filterCategory")}>
          <span className="filter-caption">{t(locale, "filterCategory")}</span>
          {categories.map((item) => <button type="button" key={item} className={`filter-chip ${category === item ? "selected" : ""}`} aria-pressed={category === item} onClick={() => { setCategory(item); setVisible(12); navigate({ q: query, category: item, difficulty: level }); }}>{categoryLabel(item, locale)}</button>)}
        </div>
        <div className="filter-set level-set" aria-label={t(locale, "filterLevel")}>
          <span className="filter-caption">{t(locale, "filterLevel")}</span>
          {levels.map((item) => <button type="button" key={item} className={`filter-chip ${level === item ? "selected" : ""}`} aria-pressed={level === item} onClick={() => { setLevel(item); setVisible(12); navigate({ q: query, category, difficulty: item }); }}>{item === levels[0] ? t(locale, "allLevels") : levelLabel(item, locale)}</button>)}
        </div>
        <div className="results-line"><span>{filteredScores.length.toLocaleString(locale === "fa" ? "fa-IR" : "en-US")} {t(locale, "countScores")}</span><span className="results-rule" /></div>
        <div className="score-grid catalog-grid">
          {filteredScores.slice(0, visible).map((score, index) => <ScoreCard key={score.slug} score={score} index={index} showLikes liked={liked.includes(score.slug)} onLike={() => toggleLike(score.slug)} />)}
          {!filteredScores.length && <div className="empty-state">{t(locale, "noResults")}</div>}
        </div>
        {visible < filteredScores.length && <div className="load-more-wrap"><button type="button" className="secondary-button" onClick={() => setVisible((count) => count + 12)}>{t(locale, "loadMore")}</button></div>}
      </section>
    </main>
  );
}
