"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState, type FormEvent } from "react";
import { ArrowLeft, ArrowUpDown, Heart, Music2 } from "lucide-react";
import { categories, levels, scores } from "@/lib/catalog";
import type { Score } from "@/lib/catalog";

const popularRequests = [
  { title: "بر فراز آسمان‌ها", count: "۶۷ درخواست" },
  { title: "رقص بهار — Dance of Spring", count: "۴۸ درخواست" },
  { title: "طلوع", count: "۴۶ درخواست" },
];

function RequestPanel() {
  const [song, setSong] = useState("");
  const [notice, setNotice] = useState("");
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(song.trim() ? `«${song.trim()}» را به فهرست درخواست‌ها اضافه کردیم.` : "لطفاً نام آهنگ یا هنرمند را بنویسید.");
  }
  return (
    <section className="request-panel" aria-labelledby="request-title">
      <div className="request-side">
        <h2>بیشترین درخواست‌های در انتظار</h2>
        <div className="request-list">
          {popularRequests.map((item, index) => <Link className="request-row" href={`/song-requests?q=${encodeURIComponent(item.title)}`} key={item.title}><span>{item.title}</span><span className="request-count">{(index + 1).toLocaleString("fa-IR")}　{item.count}</span></Link>)}
        </div>
        <Link className="mini-install" href="/song-requests">دیدن همهٔ درخواست‌ها ↗</Link>
      </div>
      <div className="request-copy">
        <span className="eyebrow">انتخاب آهنگ بعدی، با شما</span>
        <h2 id="request-title">آهنگ درخواستیت چیه؟</h2>
        <p>اسم آهنگ، هنرمند یا بخشی از شعرش رو بنویس.</p>
        <form className="request-form" onSubmit={submit}>
          <input aria-label="آهنگ درخواستی تو" value={song} onChange={(event) => setSong(event.target.value)} placeholder="اسم آهنگ یا هنرمند..." />
          <button className="primary-button" type="submit">بررسی کن <ArrowLeft size={17} /></button>
        </form>
        {notice && <div className="notice" role="status">{notice}</div>}
        <Link className="request-bottom-link" href="/song-requests">دیدن همهٔ درخواست‌ها　←</Link>
      </div>
      <Music2 className="request-icon" size={30} aria-hidden="true" />
    </section>
  );
}

function ScoreCard({ score, liked, onLike }: { score: Score; liked: boolean; onLike: () => void }) {
  return (
    <article className="score-card">
      <Link href={`/sheet/${score.slug}`} aria-label={`بازکردن نت ${score.title}`}>
        <div className="cover-wrap">
          {/* Generated editorial image; kept local to avoid third-party asset and privacy requests. */}
          <Image className="cover-image" src={score.cover} alt={`پیش‌نمایش نت پیانو ${score.title}`} fill sizes="(max-width: 760px) 50vw, (max-width: 1100px) 25vw, 16vw" />
          <span className="cover-overlay" aria-hidden="true" />
          <span className="sheet-lines" aria-hidden="true"><i /><i /><i /><i /><i /></span>
          {score.recent && <span className="cover-badge">جدید</span>}
        </div>
        <div className="card-body">
          <h3 className="score-title">{score.title}</h3>
          <span className="score-latin">{score.latin}</span>
          <span className="score-credit">{score.role} {score.artist}</span>
          <div className="card-meta"><span className="level-badge">{score.level}</span><span className="price-badge">{score.price}</span></div>
        </div>
      </Link>
      <button className={`like-button ${liked ? "liked" : ""}`} onClick={onLike} aria-label={liked ? `حذف ${score.title} از علاقه‌مندی‌ها` : `لایک کردن ${score.title}؛ ${score.likes} لایک`} aria-pressed={liked}>
        <span>{(score.likes + (liked ? 1 : 0)).toLocaleString("fa-IR")}</span><Heart size={15} fill={liked ? "currentColor" : "none"} />
      </button>
    </article>
  );
}

export function CatalogHome({ initialQuery = "" }: { initialQuery?: string }) {
  const [category, setCategory] = useState("همه");
  const [level, setLevel] = useState("همهٔ سطح‌ها");
  const [access, setAccess] = useState("all");
  const [sort, setSort] = useState("popular");
  const [liked, setLiked] = useState<string[]>([]);
  const [visible, setVisible] = useState(16);
  const [query, setQuery] = useState(initialQuery);

  const filteredScores = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase();
    const filtered = scores.filter((score) => {
      const matchesQuery = !normalized || `${score.title} ${score.latin} ${score.artist}`.toLocaleLowerCase().includes(normalized);
      const matchesCategory = category === "همه" || score.category === category;
      const matchesLevel = level === "همهٔ سطح‌ها" || score.level.includes(level);
      const matchesAccess = access === "all" || (access === "free" ? score.free : liked.includes(score.slug));
      return matchesQuery && matchesCategory && matchesLevel && matchesAccess;
    });
    if (sort === "liked") return [...filtered].sort((a, b) => b.likes - a.likes);
    if (sort === "easy") return [...filtered].sort((a, b) => a.level.localeCompare(b.level, "fa"));
    return filtered;
  }, [access, category, level, liked, query, sort]);

  return (
    <main className="page-wrap">
      <RequestPanel />
      <p className="request-note">نت دلخواهت را پیدا کن؛ صفحهٔ اول را رایگان ببین و اجرا را بشنو.</p>
      <section className="published" aria-label="قطعات منتشرشده به درخواست شما">
        <strong className="published-title">به درخواست شما</strong>
        <Link className="published-all" href="/song-requests">همهٔ نت‌های درخواستی ←</Link>
        <div className="published-items">
          {scores.filter((score) => score.recent).slice(0, 3).map((score, index) => <Link className="published-card" href={`/sheet/${score.slug}`} key={score.slug}><span>{score.title}<small>　{score.artist}</small></span>{index === 0 && <span className="tag-new">جدید</span>}</Link>)}
        </div>
      </section>

      <div className="catalog-tools" aria-label="دسترسی و ترتیب نت‌ها">
        <div className="segmented">
          <button className={`pill ${access === "all" ? "active" : ""}`} onClick={() => setAccess("all")}>همهٔ نت‌ها</button>
          <button className={`pill ${access === "free" ? "active" : ""}`} onClick={() => setAccess("free")}>نت‌های رایگان ({scores.filter((score) => score.free).length})</button>
          <button className={`pill ${access === "liked" ? "active" : ""}`} onClick={() => setAccess("liked")} disabled={!liked.length}><Heart size={13} /> علاقه‌مندی‌ها ({liked.length})</button>
        </div>
        <div className="sort-wrap"><label htmlFor="sort">ترتیب</label><select className="sort-select" id="sort" value={sort} onChange={(event) => setSort(event.target.value)}><option value="popular">محبوب‌ترین</option><option value="easy">آسان به سخت</option><option value="liked">بیشترین لایک</option></select><ArrowUpDown size={17} /></div>
      </div>
      <div className="filter-row" aria-label="دسته‌بندی قطعات">
        <span className="filter-label">دسته‌بندی</span>{categories.map((item) => <button key={item} className={`pill filter-pill ${category === item ? "active" : ""}`} onClick={() => setCategory(item)}>{category === item ? "✓　" : ""}{item}{item === "همه" ? "" : ` (${item === "کلاسیک" ? "۱۴۲" : item === "ترانه‌های ایرانی" ? "۹۵" : item === "موسیقی فیلم" ? "۱۲" : item === "بی‌کلام" ? "۴۶" : item === "محلی" ? "۱۰" : "۳"})`}</button>)}
      </div>
      <div className="filter-row level-filter" aria-label="سطح نوازندگی">
        <span className="filter-label">سطح نوازندگی</span>{levels.map((item) => <button key={item} className={`pill filter-pill ${level === item ? "active" : ""}`} onClick={() => setLevel(item)}>{level === item ? "✓　" : ""}{item}</button>)}
      </div>
      <select className="mobile-level-select" aria-label="سبک و سطح نوازندگی" value={level} onChange={(event) => setLevel(event.target.value)}>
        <option value="همهٔ سطح‌ها">سبک و سطح</option>{levels.slice(1).map((item) => <option value={item} key={item}>{item}</option>)}
      </select>

      <section aria-labelledby="popular-title">
        <div className="section-heading"><div><h1 id="popular-title">دانلود نت پیانو</h1><p>محبوب‌ترین قطعه‌ها</p></div><div className="sort-wrap"><label htmlFor="catalog-search">جست‌وجو</label><input className="sort-select" id="catalog-search" value={query} onChange={(event) => { setQuery(event.target.value); setVisible(16); }} placeholder="نام قطعه یا هنرمند" /></div></div>
        <div className="score-grid">
          {filteredScores.slice(0, visible).map((score) => <ScoreCard key={score.slug} score={score} liked={liked.includes(score.slug)} onLike={() => setLiked((current) => current.includes(score.slug) ? current.filter((slug) => slug !== score.slug) : [...current, score.slug])} />)}
          {!filteredScores.length && <div className="empty-state">قطعه‌ای پیدا نشد. نام یا فیلتر دیگری را امتحان کنید.</div>}
        </div>
        {visible < filteredScores.length && <div className="load-more-wrap"><button className="secondary-button" onClick={() => setVisible((count) => count + 12)}>نمایش نت‌های بیشتر</button></div>}
      </section>

      <section className="intro-panel" aria-label="انتخاب و دانلود نت پیانو">
        <p>نت پیانو آهنگ‌های ایرانی، کلاسیک و موسیقی فیلم را با نام قطعه یا هنرمند پیدا کنید. صفحهٔ اول همهٔ نت‌ها را ببینید، اجرای نمونه را بشنوید و تنظیم مناسب سطح خود را انتخاب کنید.</p>
        <div className="collection-links">
          <Link className="collection-link" href="/iranian-piano-sheets">نت پیانو ایرانی و فارسی</Link><Link className="collection-link" href="/classical-piano-sheets">نت پیانو کلاسیک</Link><Link className="collection-link" href="/easy-piano-sheets">نت پیانو ساده و آسان</Link><Link className="collection-link" href="/free-piano-sheets">دانلود نت‌های کامل رایگان</Link><Link className="collection-link" href="/film-piano-sheets">نت موسیقی فیلم</Link><Link className="collection-link" href="/instrumental-piano-sheets">نت پیانو بی‌کلام</Link><Link className="collection-link" href="/artists">نت پیانو هنرمندان</Link><Link className="collection-link" href="/scores">فهرست همهٔ قطعات</Link>
        </div>
      </section>
    </main>
  );
}
