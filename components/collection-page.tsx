"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, type FormEvent } from "react";
import { ArrowLeft, Music2, Search } from "lucide-react";
import { scores } from "@/lib/catalog";

const copy: Record<string, { title: string; description: string }> = {
  scores: { title: "کتابخانهٔ نت پیانو ایرانی و خارجی", description: "صفحهٔ اول را رایگان ببینید، اجرای نمونه را بشنوید و نسخهٔ مناسب خود را انتخاب کنید." },
  artists: { title: "نت پیانو هنرمندان", description: "نت پیانو را با نام هنرمند پیدا کنید؛ آثار منتشرشده، نقش آهنگساز و خواننده و سطح تنظیم‌ها را مقایسه کنید." },
  "song-requests": { title: "آهنگ درخواستیت چیه؟", description: "اسم آهنگ و خواننده یا آهنگسازش، یا یه تیکه از شعرش رو برام بنویس." },
  subscription: { title: "اشتراک‌های NUANCE", description: "اولین قدم در دنیای موسیقی؛ دسترسی به کتابخانه و ابزارهای تمرین پیانو." },
  support: { title: "چطور می‌تونیم کمک کنیم؟", description: "راهنمای خرید، پیگیری اشتراک یا گزارش اشکال؛ همه در یک گفتگو." },
  feedback: { title: "چطور می‌تونیم کمک کنیم؟", description: "راهنمای خرید، پیگیری اشتراک یا گزارش اشکال؛ همه در یک گفتگو." },
  "start-piano": { title: "شروع برای مبتدی‌ها", description: "از یک ملودی آشنا آغاز کن، هر دست را جدا بشنو و وقتی آماده شدی سراغ اولین قطعهٔ دودستی برو." },
  "iranian-piano-sheets": { title: "نت پیانو آهنگ‌های ایرانی و فارسی", description: "صفحهٔ اول را رایگان ببینید، اجرای نمونه را بشنوید و نسخهٔ مناسب خود را انتخاب کنید." },
  "classical-piano-sheets": { title: "نت پیانو کلاسیک", description: "از قطعه‌های کلاسیک شناخته‌شده تا آثار آهنگسازان بزرگ، نت‌ها و نسخه‌های مختلف را پیدا کنید." },
  "easy-piano-sheets": { title: "نت پیانو ساده و آسان برای شروع تمرین", description: "قطعه‌های آشنا را با تنظیم آسان پیدا کنید؛ سطح هر تنظیم، جداگانه مشخص شده است." },
  "free-piano-sheets": { title: "دانلود رایگان نت پیانو PDF و اجرا", description: "نت کامل این قطعات رایگان است؛ صفحهٔ اول را ببینید و اجرای کامل را بشنوید." },
  "film-piano-sheets": { title: "نت پیانو موسیقی فیلم", description: "ملودی‌های فراموش‌نشدنی موسیقی فیلم را برای پیانو پیدا کنید و بشنوید." },
  "instrumental-piano-sheets": { title: "نت پیانو بی‌کلام", description: "قطعه‌های پیانویی و موسیقی‌های بی‌کلام را بر اساس نام آهنگساز پیدا کنید." },
  account: { title: "حساب کاربری", description: "برای دسترسی به خریدها و تنظیمات حساب، وارد حساب NUANCE شوید." },
  settings: { title: "تنظیمات", description: "تنظیمات نمایش و دسترسی‌های شما." },
  payments: { title: "خریدهای تکی من", description: "فهرست خریدهای شما پس از ورود به حساب نمایش داده می‌شود." },
};

const artists = [
  ["ابی", "Ebi", "خواننده", "۲ قطعهٔ منتشرشده"], ["اریک ساتی", "Erik Satie", "آهنگساز", "۳ قطعهٔ منتشرشده"], ["اسکات جاپلین", "Scott Joplin", "آهنگساز", "۳ قطعهٔ منتشرشده"], ["عرفان نادریان", "Erfan Naderian", "آهنگساز، تنظیم پیانو", "۹۹ قطعهٔ منتشرشده"], ["فردریک شوپن", "Frédéric Chopin", "آهنگساز", "۱۳ قطعهٔ منتشرشده"], ["فلیکس مندلسون", "Felix Mendelssohn", "آهنگساز", "۴ قطعهٔ منتشرشده"], ["لودوویکو اینائودی", "Ludovico Einaudi", "آهنگساز", "۲ قطعهٔ منتشرشده"], ["لودویگ فان بتهوون", "Ludwig van Beethoven", "آهنگساز", "۵ قطعهٔ منتشرشده"], ["داریوش", "Dariush", "خواننده", "۳ قطعهٔ منتشرشده"], ["گوگوش", "Googoosh", "خواننده", "۵ قطعهٔ منتشرشده"], ["روح‌الله خالقی", "Ruhollah Khaleghi", "آهنگساز", "۲ قطعهٔ منتشرشده"], ["هایده", "Hayedeh", "خواننده", "۴ قطعهٔ منتشرشده"],
];

function RequestForm() {
  const [term, setTerm] = useState("");
  const [submitted, setSubmitted] = useState(false);
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (term.trim()) setSubmitted(true);
  }
  return <form className="request-page-form" onSubmit={handleSubmit}>
    <label htmlFor="request-song">آهنگ درخواستی تو</label>
    <input id="request-song" value={term} onChange={(event) => { setTerm(event.target.value); setSubmitted(false); }} placeholder="اسم آهنگ، خواننده یا بخشی از شعر..." required />
    <button className="primary-button" type="submit">بررسی کن <ArrowLeft size={16} /></button>
    {submitted && <p className="notice" role="status">درخواست «{term}» در این نسخهٔ نمایشی ثبت شد.</p>}
    <p>این نسخهٔ بازسازی‌شده، درخواست را فقط در همین صفحه نمایش می‌دهد و اطلاعاتی به سرویس اصلی ارسال نمی‌کند.</p>
  </form>;
}

function SupportForm() {
  const [submitted, setSubmitted] = useState(false);
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }
  return <form className="request-page-form" onSubmit={handleSubmit}>
    <label htmlFor="support-topic">موضوع پیام</label>
    <select id="support-topic" defaultValue="راهنمای خرید"><option>راهنمای خرید</option><option>پیگیری اشتراک</option><option>گزارش اشکال</option><option>سایر موارد</option></select>
    <label htmlFor="support-message">پیام شما</label>
    <textarea id="support-message" placeholder="جزئیات بیشتری بنویسید..." required />
    <button className="primary-button" type="submit">ارسال پیام</button>
    {submitted && <p className="notice" role="status">پیام شما در این نسخهٔ نمایشی ثبت شد؛ به سرویس پشتیبانی اصلی ارسال نشده است.</p>}
  </form>;
}

export function CollectionPage({ section }: { section: string }) {
  const [filter, setFilter] = useState("");
  const page = copy[section];
  const isArtist = section === "artists";
  const isRequest = section === "song-requests";
  const isSubscription = section === "subscription";
  const isSupport = section === "support" || section === "feedback";
  const isAccount = ["account", "settings", "payments"].includes(section);
  const category = section === "iranian-piano-sheets" ? "ترانه‌های ایرانی" : section === "classical-piano-sheets" ? "کلاسیک" : section === "film-piano-sheets" ? "موسیقی فیلم" : section === "instrumental-piano-sheets" ? "بی‌کلام" : "";
  const matchingScores = scores.filter((score) => (category ? score.category === category : section === "free-piano-sheets" ? score.free : section === "easy-piano-sheets" ? score.level.includes("آسان") : true));

  return <main className="page-wrap content-page">
    <div className="breadcrumbs"><Link href="/">خانه</Link>　/　{page.title}</div>
    <header className="content-hero"><span className="eyebrow">NUANCE · کتابخانهٔ پیانو</span><h1>{page.title}</h1><p>{page.description}</p></header>

    {isArtist && <><h2>همهٔ هنرمندان</h2><div className="listing-grid">{artists.map(([name, latin, role, count]) => <article className="artist-card" key={name}><small>{role}</small><strong>{name}</strong><span>{latin}</span><p>{count}</p><Link href={`/artists?q=${encodeURIComponent(name)}`}>انتخاب از نت‌های {name} ←</Link></article>)}</div><section className="intro-panel"><h2>قطعه را چگونه انتخاب کنم؟</h2><p>در فهرست هنرمند، نام قطعه و تنظیم‌های موجود را مقایسه کنید. صفحهٔ اول هر نت واضح و رایگان است؛ اجرای نمونه و سطح هر تنظیم به بررسی ریتم و همراهی کمک می‌کنند.</p></section></>}

    {isRequest && <><RequestForm /><section className="intro-panel"><h2>بیشترین درخواست‌های در انتظار</h2><div className="collection-links">{["بر فراز آسمان‌ها", "رقص بهار — Dance of Spring", "طلوع"].map((name) => <span className="collection-link" key={name}>{name}</span>)}</div></section></>}

    {isSubscription && <><div className="listing-grid"><article className="price-card"><h2>پایه</h2><p>دسترسی به کل کتابخانه؛ ۳۰۸ نت با امکان شنیدن</p><div className="amount">۸۸۷٬۷۵۳ تومان</div><small>مبلغ کل ۶ ماه · ماهانه ۱۴۷٬۹۵۹ تومان</small><Link href="/account" className="secondary-button">انتخاب اشتراک پایه</Link></article><article className="price-card featured"><h2>حرفه‌ای</h2><p>کتابخانه، دانلود PDF، تمرین نت‌خوانی و تمرین نوازندگی تعاملی</p><div className="amount">۹۹۹٬۰۰۰ تومان</div><small>مبلغ کل ۶ ماه · ماهانه ۱۶۶٬۵۰۰ تومان</small><Link href="/account" className="primary-button">انتخاب اشتراک حرفه‌ای</Link></article></div><table className="feature-table"><thead><tr><th>امکانات</th><th>رایگان</th><th>پایه</th><th>حرفه‌ای</th></tr></thead><tbody>{[["قطعات رایگان و بازی شناخت نت‌ها", "✓", "✓", "✓"], ["نمایش و اجرای نت‌های اشتراکی", "فقط صفحهٔ اول", "کامل", "کامل"], ["سرعت، مترونوم و تفکیک دست‌ها", "محدود", "کامل", "کامل"], ["تمرین نوازندگی تعاملی", "×", "×", "✓"], ["دانلود PDF", "×", "×", "روزانه ۳ نت"]].map((row) => <tr key={row[0]}>{row.map((cell) => <td key={cell}>{cell}</td>)}</tr>)}</tbody></table><p className="notice">این بازسازی پرداخت واقعی یا خرید اشتراک را انجام نمی‌دهد.</p></>}

    {isSupport && <div className="info-card"><h2>پشتیبانی NUANCE</h2><p>برای راهنمای خرید، پیگیری اشتراک یا گزارش اشکال، موضوع پیام خود را انتخاب کنید.</p><SupportForm /></div>}
    {isAccount && <div className="info-card"><h2>این بخش به حساب کاربری نیاز دارد</h2><p>ورود، پیگیری خرید و ذخیرهٔ حساب به سرویس اصلی متصل نشده‌اند و در این بازسازی شبیه‌سازی نمی‌شوند.</p><Link className="secondary-button" href="/">بازگشت به کتابخانه</Link></div>}

    {section === "start-piano" && <><div className="listing-grid"><Link className="info-card" href="/sheet/happy-birthday"><Music2 /><h2>آهنگ تولد را یاد بگیر و اجرایت را هدیه بده</h2><p>نت را قدم‌به‌قدم تمرین کن و هر دست را جدا بشنو.</p></Link><Link className="info-card" href="/sheet/nefeli"><Music2 /><h2>گل ارکیده؛ اولین آهنگ دودستی</h2><p>یک قطعهٔ شنیدنی برای شروع هماهنگی دو دست.</p></Link></div><h2>آهنگ‌های سادهٔ بیشتر</h2></>}

    {!isArtist && !isRequest && !isSubscription && !isSupport && !isAccount && <section><div className="section-heading"><div><h2>نت‌ها را ببینید و انتخاب کنید</h2><p>پیش‌نمایش نت و اجرای نمونه</p></div><label className="global-search"><Search size={16} /><input aria-label="جستجو در فهرست" value={filter} onChange={(event) => setFilter(event.target.value)} placeholder="جستجو در فهرست" /></label></div><div className="score-grid">{matchingScores.filter((score) => `${score.title} ${score.latin} ${score.artist}`.toLowerCase().includes(filter.toLowerCase())).map((score, index) => <Link className="score-card" href={`/sheet/${score.slug}`} key={score.slug}><div className="cover-wrap"><Image className="cover-image" src={score.cover} alt={`پیش‌نمایش نت ${score.title}`} fill priority={index === 0} sizes="(max-width: 760px) 50vw, 25vw" /><span className="cover-overlay" /><span className="sheet-lines" aria-hidden="true"><i /><i /><i /><i /><i /></span></div><div className="card-body"><h3 className="score-title">{score.title}</h3><span className="score-latin">{score.latin}</span><span className="score-credit">{score.artist}</span><div className="card-meta"><span className="level-badge">{score.level}</span><span className="price-badge">{score.price}</span></div></div></Link>)}</div></section>}

    <section className="intro-panel"><h2>انتخاب نت پیانو</h2><p>نام فارسی یا لاتین قطعه را پیدا کنید، سپس تنظیم‌های منتشرشده را در صفحهٔ همان اثر مقایسه کنید. تعداد صفحات و سطح هر نسخه مشخص است.</p><div className="collection-links"><Link className="collection-link" href="/scores">کتابخانهٔ کامل</Link><Link className="collection-link" href="/artists">همهٔ هنرمندان</Link><Link className="collection-link" href="/subscription">خرید اشتراک</Link></div></section>
  </main>;
}
