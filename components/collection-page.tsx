"use client";

import Link from "next/link";
import { useMemo, useState, type FormEvent } from "react";
import { ArrowUpRight, Search } from "lucide-react";
import { categories, levels, scores } from "@/lib/catalog";
import { categoryLabel, levelLabel, roleLabel, t } from "@/lib/i18n";
import { ScoreCard } from "@/components/score-card";
import { useLocale } from "@/components/site-shell";

const collectionCategories: Record<string, string> = {
  "iranian-piano-sheets": "ترانه‌های ایرانی",
  "classical-piano-sheets": "کلاسیک",
  "film-piano-sheets": "موسیقی فیلم",
  "instrumental-piano-sheets": "بی‌کلام",
};

const pageCopy: Record<string, { title: string; description: string }> = {
  scores: { title: "sectionScoresTitle", description: "sectionScoresLead" },
  artists: { title: "artistsTitle", description: "artistsLead" },
  "song-requests": { title: "requestPageTitle", description: "requestPageLead" },
  subscription: { title: "navMembership", description: "membershipNote" },
  support: { title: "supportTitle", description: "supportLead" },
  feedback: { title: "supportTitle", description: "supportLead" },
  "start-piano": { title: "guideTitle", description: "guideLead" },
  "iranian-piano-sheets": { title: "sectionScoresTitle", description: "sectionScoresLead" },
  "classical-piano-sheets": { title: "sectionScoresTitle", description: "sectionScoresLead" },
  "easy-piano-sheets": { title: "difficultyTitle", description: "difficultyLead" },
  "free-piano-sheets": { title: "freeScores", description: "sectionScoresLead" },
  "film-piano-sheets": { title: "sectionScoresTitle", description: "sectionScoresLead" },
  "instrumental-piano-sheets": { title: "sectionScoresTitle", description: "sectionScoresLead" },
  account: { title: "navAccount", description: "accountUnavailableCopy" },
  settings: { title: "settingsTitle", description: "settingsCopy" },
  payments: { title: "paymentsTitle", description: "paymentsCopy" },
};

const translatedPageCopy: Record<string, { title: string; description: string }> = {
  "iranian-piano-sheets": { title: "نت پیانو ترانه‌های ایرانی", description: "ترانه‌های ایرانی را از میان نت‌های موجود برای پیانو پیدا کنید." },
  "classical-piano-sheets": { title: "نت پیانو کلاسیک", description: "از ملودی‌های شناخته‌شده تا آثار آهنگسازان کلاسیک، نت‌های موجود را ببینید." },
  "easy-piano-sheets": { title: "نت پیانو آسان", description: "قطعه‌های موجود را بر اساس سطح دشواری بررسی کنید." },
  "free-piano-sheets": { title: "نت‌های رایگان", description: "نت‌هایی را ببینید که در داده‌های این کتابخانه به‌عنوان رایگان مشخص شده‌اند." },
  "film-piano-sheets": { title: "نت پیانو موسیقی فیلم", description: "ملودی‌های فیلم موجود در مجموعهٔ پیانو را پیدا کنید." },
  "instrumental-piano-sheets": { title: "نت‌های بی‌کلام پیانو", description: "آثار بی‌کلام موجود را بر اساس آهنگساز و نام قطعه ببینید." },
};

const artists = Array.from(new Set(scores.map((score) => score.artist).filter(Boolean))).map((name) => {
  const works = scores.filter((score) => score.artist === name);
  return { name, role: works[0]?.role ?? "", count: works.length, slugs: works.map((score) => score.slug) };
});

function RequestForm({ initialQuery }: { initialQuery: string }) {
  const { locale } = useLocale();
  const [term, setTerm] = useState(initialQuery);
  const [submitted, setSubmitted] = useState(false);
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (term.trim()) setSubmitted(true);
  }
  return <form className="request-page-form" onSubmit={handleSubmit}>
    <label htmlFor="request-song">{t(locale, "requestField")}</label>
    <input id="request-song" value={term} onChange={(event) => { setTerm(event.target.value); setSubmitted(false); }} placeholder={t(locale, "heroSearchPlaceholder")} required />
    <button className="primary-button" type="submit">{t(locale, "requestSubmit")} <ArrowUpRight size={15} /></button>
    {submitted && <p className="notice" role="status">{t(locale, "requestDemoNotice")}</p>}
  </form>;
}

function SupportForm() {
  const { locale } = useLocale();
  const [submitted, setSubmitted] = useState(false);
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }
  return <form className="request-page-form" onSubmit={handleSubmit}>
    <label htmlFor="support-topic">{t(locale, "supportTopic")}</label>
    <select id="support-topic" defaultValue="purchase">
      <option value="purchase">{t(locale, "topicPurchase")}</option>
      <option value="subscription">{t(locale, "topicSubscription")}</option>
      <option value="issue">{t(locale, "topicIssue")}</option>
      <option value="other">{t(locale, "topicOther")}</option>
    </select>
    <label htmlFor="support-message">{t(locale, "supportMessage")}</label>
    <textarea id="support-message" placeholder={t(locale, "supportMessage")} required onChange={() => setSubmitted(false)} />
    <button className="primary-button" type="submit">{t(locale, "supportSubmit")} <ArrowUpRight size={15} /></button>
    {submitted && <p className="notice" role="status">{t(locale, "supportDemoNotice")}</p>}
  </form>;
}

function MembershipPage() {
  const { locale } = useLocale();
  const rows = [
    ["featureFreeScores", "✓", "✓", "✓"],
    ["featurePreview", locale === "en" ? "First page" : "صفحهٔ نخست", "Full", "Full"],
    ["featurePlayback", locale === "en" ? "Limited" : "محدود", "✓", "✓"],
    ["featureArrangements", locale === "en" ? "Preview" : "پیش‌نمایش", "✓", "✓"],
    ["featureSave", "×", "✓", "✓"],
    ["featureNew", "×", "✓", "✓"],
    ["featurePractice", "×", "×", "✓"],
    ["featurePdf", "×", "×", locale === "en" ? "Daily limit" : "محدودیت روزانه"],
  ];
  return <>
    <div className="membership-note notice" role="note">{t(locale, "membershipNote")}</div>
    <div className="membership-grid">
      <article className="membership-card"><span className="eyebrow">01 / {t(locale, "planBasic")}</span><h2>{t(locale, "planBasic")}</h2><p>{t(locale, "planBasicLead")}</p><strong className="membership-price">887,753 <small>toman</small></strong><span className="membership-period">{t(locale, "sixMonthTotal")} · 147,959 {locale === "en" ? "toman/month" : "تومان در ماه"}</span><Link className="text-link" href="/account">{t(locale, "accountInformation")} <ArrowUpRight size={15} /></Link></article>
      <article className="membership-card featured-membership"><span className="eyebrow">02 / {t(locale, "planPro")}</span><h2>{t(locale, "planPro")}</h2><p>{t(locale, "planProLead")}</p><strong className="membership-price">999,000 <small>toman</small></strong><span className="membership-period">{t(locale, "sixMonthTotal")} · 166,500 {locale === "en" ? "toman/month" : "تومان در ماه"}</span><Link className="text-link" href="/account">{t(locale, "accountInformation")} <ArrowUpRight size={15} /></Link></article>
    </div>
    <section className="feature-table-wrap" aria-labelledby="feature-table-title">
      <div className="section-heading"><div><span className="eyebrow">NUANCE / ACCESS</span><h2 id="feature-table-title">{t(locale, "featuresTitle")}</h2></div></div>
      <div className="table-scroll"><table className="feature-table"><thead><tr><th scope="col">{t(locale, "featureName")}</th><th scope="col">{t(locale, "free")}</th><th scope="col">{t(locale, "basic")}</th><th scope="col">{t(locale, "pro")}</th></tr></thead><tbody>{rows.map(([key, free, basic, pro]) => <tr key={key}><th scope="row">{t(locale, key as Parameters<typeof t>[1])}</th><td>{free}</td><td>{basic}</td><td>{pro}</td></tr>)}</tbody></table></div>
      <p className="notice">{t(locale, "membershipNote")}</p>
    </section>
  </>;
}

export function CollectionPage({ section, initialQuery = "", initialCategory = "" }: { section: string; initialQuery?: string; initialCategory?: string }) {
  const { locale } = useLocale();
  const initialCategoryForPage = collectionCategories[section] ?? (categories.includes(initialCategory) && section === "scores" ? initialCategory : "همه");
  const [filter, setFilter] = useState(initialQuery);
  const [categoryFilter, setCategoryFilter] = useState(initialCategoryForPage);
  const [levelFilter, setLevelFilter] = useState("همهٔ سطح‌ها");
  const isArtist = section === "artists";
  const isRequest = section === "song-requests";
  const isSubscription = section === "subscription";
  const isSupport = section === "support" || section === "feedback";
  const isAccount = ["account", "settings", "payments"].includes(section);
  const isGuide = section === "start-piano";
  const page = pageCopy[section] ?? pageCopy.scores;
  const persianSpecialCopy = translatedPageCopy[section];
  const pageTitle = locale === "fa" && persianSpecialCopy ? persianSpecialCopy.title : t(locale, page.title as Parameters<typeof t>[1]);
  const pageDescription = locale === "fa" && persianSpecialCopy ? persianSpecialCopy.description : t(locale, page.description as Parameters<typeof t>[1]);

  const filteredArtists = useMemo(() => artists.filter((artist) => !filter.trim() || `${artist.name} ${artist.role}`.toLocaleLowerCase(locale === "fa" ? "fa-IR" : "en-US").includes(filter.trim().toLocaleLowerCase(locale === "fa" ? "fa-IR" : "en-US"))), [filter, locale]);
  const visibleScores = useMemo(() => scores.filter((score) => {
    let category = categoryFilter;
    if (section === "easy-piano-sheets") return score.level.includes("آسان") && (!filter.trim() || `${score.title} ${score.latin} ${score.artist}`.toLocaleLowerCase().includes(filter.trim().toLocaleLowerCase())) && (levelFilter === "همهٔ سطح‌ها" || score.level.includes(levelFilter));
    if (section === "free-piano-sheets" && !score.free) return false;
    if (category === "همه") category = "";
    const searchable = `${score.title} ${score.latin} ${score.artist}`.toLocaleLowerCase(locale === "fa" ? "fa-IR" : "en-US");
    return (!category || score.category === category) && (levelFilter === "همهٔ سطح‌ها" || score.level.includes(levelFilter)) && (!filter.trim() || searchable.includes(filter.trim().toLocaleLowerCase(locale === "fa" ? "fa-IR" : "en-US")));
  }), [categoryFilter, filter, levelFilter, locale, section]);

  return <main className="page-wrap content-page" id="main-content">
    <nav className="breadcrumbs" aria-label={locale === "en" ? "Breadcrumb" : "مسیر صفحه"}><Link href="/">{t(locale, "breadcrumbsHome")}</Link><span aria-hidden="true">/</span><Link href="/scores">{t(locale, "breadcrumbsLibrary")}</Link><span aria-hidden="true">/</span><span>{pageTitle}</span></nav>
    <header className="content-hero">
      <span className="eyebrow">{t(locale, "sectionLabel")}</span>
      <h1 className="display-title">{pageTitle}</h1>
      <p>{pageDescription}</p>
    </header>

    {isArtist && <section className="section-block" aria-labelledby="artist-list-title">
      <div className="section-heading editorial-heading">
        <div><span className="eyebrow">NUANCE / INDEX</span><h2 id="artist-list-title">{t(locale, "artistsTitle")}</h2><p>{t(locale, "artistsLead")}</p></div>
        <label className="catalog-search"><Search size={16} aria-hidden="true" /><span className="visually-hidden">{t(locale, "searchLabel")}</span><input aria-label={t(locale, "searchLabel")} value={filter} onChange={(event) => setFilter(event.target.value)} placeholder={t(locale, "searchPlaceholder")} /></label>
      </div>
      <div className="artist-grid">{filteredArtists.map((artist, index) => <article className="artist-card" key={artist.name}>
        <span className="artist-index">{String(index + 1).padStart(2, "0")}</span>
        <span className="artist-role">{roleLabel(artist.role, locale)}</span>
        <h3 dir="auto">{artist.name}</h3>
        <p>{artist.count.toLocaleString(locale === "fa" ? "fa-IR" : "en-US")} {t(locale, "works")}</p>
        <Link href={`/scores?q=${encodeURIComponent(artist.name)}`}>{t(locale, "chooseScores")} <ArrowUpRight size={14} /></Link>
      </article>)}{filteredArtists.length === 0 && <p className="empty-state">{t(locale, "emptyArtists")}</p>}</div>
    </section>}

    {isRequest && <section className="request-content section-block"><RequestForm initialQuery={initialQuery} /><div className="request-archive"><span className="eyebrow">NUANCE / REQUESTS</span><h2>{locale === "en" ? "Recently added from requests" : "نت‌های تازه بر اساس درخواست"}</h2><div className="request-score-links">{scores.filter((score) => score.recent).slice(0, 3).map((score) => <Link key={score.slug} href={`/sheet/${score.slug}`}><span dir="auto">{score.title}</span><small dir="auto">{score.artist}</small><ArrowUpRight size={14} /></Link>)}</div></div></section>}

    {isSubscription && <section className="section-block"><MembershipPage /></section>}

    {isSupport && <section className="support-layout section-block"><div className="support-aside"><span className="eyebrow">NUANCE / CARE</span><h2>{t(locale, "supportTitle")}</h2><p>{t(locale, "supportLead")}</p><div className="support-note"><span>NOTE</span><p>{t(locale, "supportDemoNotice")}</p></div></div><SupportForm /></section>}

    {isAccount && <section className="account-panel section-block">
      <span className="eyebrow">NUANCE / {section === "payments" ? "PURCHASES" : "ACCOUNT"}</span>
      <h2>{section === "settings" ? t(locale, "settingsTitle") : section === "payments" ? t(locale, "paymentsTitle") : t(locale, "accountUnavailableTitle")}</h2>
      <p>{section === "settings" ? t(locale, "settingsCopy") : section === "payments" ? t(locale, "paymentsCopy") : t(locale, "accountUnavailableCopy")}</p>
      {section !== "settings" && <Link href="/scores" className="text-link">{t(locale, "backLibrary")} <ArrowUpRight size={15} /></Link>}
    </section>}

    {isGuide && <section className="guide-picks section-block" aria-label={t(locale, "guideTitle")}>
      {scores.filter((score) => ["happy-birthday", "nefeli"].includes(score.slug)).map((score, index) => <ScoreCard key={score.slug} score={score} index={index} />)}
    </section>}

    {!isArtist && !isRequest && !isSubscription && !isSupport && !isAccount && !isGuide && <section className="section-block collection-results" aria-labelledby="collection-results-title">
      <div className="section-heading editorial-heading">
        <div><span className="eyebrow">NUANCE / COLLECTION</span><h2 id="collection-results-title">{t(locale, "catalogTitle")}</h2><p>{t(locale, "catalogLead")}</p></div>
        <label className="catalog-search"><Search size={16} aria-hidden="true" /><span className="visually-hidden">{t(locale, "searchLabel")}</span><input type="search" dir="auto" aria-label={t(locale, "searchLabel")} value={filter} onChange={(event) => setFilter(event.target.value)} placeholder={t(locale, "searchPlaceholder")} /></label>
      </div>
      {section === "scores" && <div className="filter-set collection-filter-set" aria-label={t(locale, "filterCategory")}>
        {categories.map((item) => <button type="button" key={item} className={`filter-chip ${categoryFilter === item ? "selected" : ""}`} aria-pressed={categoryFilter === item} onClick={() => setCategoryFilter(item)}>{categoryLabel(item, locale)}</button>)}
      </div>}
      <div className="filter-set level-set">
        <span className="filter-caption">{t(locale, "filterLevel")}</span>
        {levels.map((item) => <button type="button" key={item} className={`filter-chip ${levelFilter === item ? "selected" : ""}`} aria-pressed={levelFilter === item} onClick={() => setLevelFilter(item)}>{item === levels[0] ? t(locale, "allLevels") : levelLabel(item, locale)}</button>)}
      </div>
      <div className="results-line"><span>{visibleScores.length.toLocaleString(locale === "fa" ? "fa-IR" : "en-US")} {t(locale, "countScores")}</span><span className="results-rule" /></div>
      <div className="score-grid collection-score-grid">{visibleScores.map((score, index) => <ScoreCard key={score.slug} score={score} index={index} />)}{visibleScores.length === 0 && <p className="empty-state">{t(locale, "noResults")}</p>}</div>
    </section>}

    {!isRequest && !isSupport && <section className="archive-note section-block"><div><span className="eyebrow">NUANCE / ARCHIVE</span><h2>{t(locale, "archiveNoteTitle")}</h2><p>{t(locale, "archiveNoteCopy")}</p></div><div className="archive-note-links"><Link href="/scores">{t(locale, "allScores")} <ArrowUpRight size={14} /></Link><Link href="/artists">{t(locale, "navArtists")} <ArrowUpRight size={14} /></Link><Link href="/subscription">{t(locale, "navMembership")} <ArrowUpRight size={14} /></Link></div></section>}
  </main>;
}
