"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState, type FormEvent } from "react";
import { ArrowLeft, ArrowUpDown, Heart, Music2, Search } from "lucide-react";
import { categories, levels, scores } from "@/lib/catalog";
import type { Score } from "@/lib/catalog";
import { useFavorites } from "@/components/site-shell";

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
  const { liked, toggleLike } = useFavorites();
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
      <section className="hero-editorial" aria-labelledby="hero-title">
        <div className="hero-copy">
          <span className="eyebrow">A CURATED PIANO ARCHIVE <i /></span>
          <h1 id="hero-title"><span>هر نت،</span><em>یک ظرافت.</em></h1>
          <p className="hero-tagline">Every Note Has a Nuance.</p>
          <p className="hero-description">آثاری برای شنیدن، کشف‌کردن و دوباره نواختن؛ از موسیقی کلاسیک تا ملودی‌های آشنا.</p>
          <form className="hero-search" role="search" onSubmit={(event) => { event.preventDefault(); document.getElementById("popular-title")?.scrollIntoView({ behavior: "smooth" }); }}>
            <Search size={19} aria-hidden="true" />
            <input id="catalog-search" aria-label="جست‌وجوی نت‌ها" placeholder="نام قطعه، آهنگساز یا هنرمند..." value={query} onChange={(event) => { setQuery(event.target.value); setVisible(16); }} />
            <button type="submit" aria-label="جست‌وجو"><ArrowLeft size={18} /></button>
          </form>
          <div className="hero-actions">
            <a className="hero-primary" href="#catalog-search">جست‌وجوی نت‌ها <ArrowLeft size={15} /></a>
              <a className="hero-secondary" href="#featured-collections">کشف مجموعه‌ها</a>
          </div>
        </div>
        <div className="hero-artwork" aria-label="طرحی از دست‌نوشتهٔ موسیقی">
          <Image className="hero-art-image" src="/images/score-cover-3.png" alt="" fill priority sizes="(max-width: 760px) 100vw, 48vw" />
          <div className="hero-art-wash" />
          <div className="hero-sheet">
            <span className="hero-sheet-kicker">NUANCE · NO. 01</span>
            <span className="hero-clef" aria-hidden="true">𝄞</span>
            <span className="hero-staff" aria-hidden="true"><i /><i /><i /><i /><i /><b>♪</b><b>♩</b><b>♫</b></span>
            <span className="hero-sheet-caption">A study in quiet expression</span>
          </div>
          <span className="artwork-index">EST. MMXXIV <i /> PIANO EDITIONS</span>
        </div>
      </section>

      <section className="featured-collections" id="featured-collections" aria-labelledby="collections-title">
        <div className="editorial-heading">
          <div><span className="eyebrow">CURATED FOR YOU</span><h2 id="collections-title">مجموعه‌هایی برای کشف</h2></div>
          <Link href="/scores">دیدن همهٔ مجموعه‌ها <ArrowLeft size={14} /></Link>
        </div>
        <div className="collection-grid">
          <Link className="collection-card collection-classical" href="/classical-piano-sheets">
            <Image src="/images/score-cover-3.png" alt="" fill sizes="(max-width: 760px) 86vw, 34vw" />
            <span className="collection-number">01 / COLLECTION</span><span className="collection-title">Classical<br />Piano</span><span className="collection-caption">آثار کلاسیک برای پیانو</span><ArrowLeft className="collection-arrow" size={18} />
          </Link>
          <Link className="collection-card collection-iranian" href="/iranian-piano-sheets">
            <Image src="/images/score-cover-2.png" alt="" fill sizes="(max-width: 760px) 86vw, 34vw" />
            <span className="collection-number">02 / COLLECTION</span><span className="collection-title">Iranian<br />Melodies</span><span className="collection-caption">ملودی‌های ماندگار ایرانی</span><ArrowLeft className="collection-arrow" size={18} />
          </Link>
          <Link className="collection-card collection-film" href="/film-piano-sheets">
            <Image src="/images/score-cover-6.png" alt="" fill sizes="(max-width: 760px) 86vw, 34vw" />
            <span className="collection-number">03 / COLLECTION</span><span className="collection-title">Film &<br />Soundtracks</span><span className="collection-caption">روایت‌هایی از موسیقی فیلم</span><ArrowLeft className="collection-arrow" size={18} />
          </Link>
        </div>
      </section>

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
      <div className="filter-row level-filter" id="level-filter" aria-label="سطح نوازندگی">
        <span className="filter-label">سطح نوازندگی</span>{levels.map((item) => <button key={item} className={`pill filter-pill ${level === item ? "active" : ""}`} onClick={() => setLevel(item)}>{level === item ? "✓　" : ""}{item}</button>)}
      </div>
      <select className="mobile-level-select" aria-label="سبک و سطح نوازندگی" value={level} onChange={(event) => setLevel(event.target.value)}>
        <option value="همهٔ سطح‌ها">سبک و سطح</option>{levels.slice(1).map((item) => <option value={item} key={item}>{item}</option>)}
      </select>

      <section aria-labelledby="popular-title">
        <div className="section-heading"><div><span className="eyebrow">THE LIBRARY</span><h2 id="popular-title">نت‌هایی برای نواختن</h2><p>قطعه‌ای را انتخاب کنید و دنیای آن را کشف کنید.</p></div><span className="result-count">{filteredScores.length.toLocaleString("fa-IR")} اثر</span></div>
        <div className="score-grid">
          {filteredScores.slice(0, visible).map((score) => <ScoreCard key={score.slug} score={score} liked={liked.includes(score.slug)} onLike={() => toggleLike(score.slug)} />)}
          {!filteredScores.length && <div className="empty-state">قطعه‌ای پیدا نشد. نام یا فیلتر دیگری را امتحان کنید.</div>}
        </div>
        {visible < filteredScores.length && <div className="load-more-wrap"><button className="secondary-button" onClick={() => setVisible((count) => count + 12)}>نمایش نت‌های بیشتر</button></div>}
      </section>

      <section className="intro-panel" aria-label="انتخاب و دانلود نت پیانو">
        <div className="discovery-intro"><span className="eyebrow">DISCOVER YOUR NEXT PIECE</span><h2>از کجا شروع کنیم؟</h2><p>از آهنگسازان و اجراهای محبوب تا قطعه‌های آسان؛ آرشیو را با حال‌وهوای خودتان جست‌وجو کنید.</p></div>
        <div className="collection-links">
          <Link className="collection-link" href="/artists"><span>01</span> آهنگسازان و هنرمندان</Link><Link className="collection-link" href="/scores"><span>02</span> ساز پیانو</Link><Link className="collection-link" href="/instrumental-piano-sheets"><span>03</span> موسیقی بی‌کلام</Link><Link className="collection-link" href="/easy-piano-sheets"><span>04</span> سطح‌های نوازندگی</Link><Link className="collection-link" href="/free-piano-sheets"><span>05</span> نت‌های رایگان</Link>
        </div>
      </section>
    </main>
  );
}
