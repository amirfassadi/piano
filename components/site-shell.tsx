"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type FormEvent, type ReactNode } from "react";
import { AlignJustify, BookOpen, CheckSquare, Gamepad2, Headphones, Home, Moon, Music2, Search, Settings2, Sun, UserRound } from "lucide-react";

const navItems = [
  { href: "/scores", label: "کتابخانه", icon: BookOpen },
  { href: "/start-piano", label: "بازی نتها", icon: Gamepad2 },
  { href: "/song-requests", label: "آهنگ درخواستی" },
  { href: "/subscription", label: "خرید اشتراک" },
  { href: "/support", label: "پشتیبانی" },
  { href: "/feedback", label: "گزارش اشکال" },
];

export function SiteShell({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const [query, setQuery] = useState("");
  const pathname = usePathname();
  const router = useRouter();

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    router.push(query.trim() ? `/?q=${encodeURIComponent(query.trim())}` : "/");
    setMenuOpen(false);
  }

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark-mode", next);
  }

  return (
    <>
      <header className="site-header">
        <div className="topbar">
          <button className="round-tool mobile-menu-trigger" onClick={() => setMenuOpen((value) => !value)} aria-label={menuOpen ? "بستن منو" : "باز کردن منو"} aria-expanded={menuOpen}>
            <AlignJustify size={19} />
          </button>
          <div className="header-tools">
            <button className="round-tool" onClick={toggleTheme} aria-label="تغییر حالت تاریک و روشن">{dark ? <Sun size={18} /> : <Moon size={18} />}</button>
            <Link className="round-tool" href="/account" aria-label="حساب من"><UserRound size={19} /></Link>
            <Link className="round-tool" href="/payments/my-scores" aria-label="خریدهای تکی من"><CheckSquare size={19} /></Link>
          </div>
          <nav className={`main-nav ${menuOpen ? "open" : ""}`} aria-label="ناوبری اصلی">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} className={`nav-link ${pathname === href ? "active" : ""}`} onClick={() => setMenuOpen(false)}>
                {Icon && <Icon size={15} aria-hidden="true" />}{label}
              </Link>
            ))}
            <Link className="nav-link" href="https://notiran.app/" target="_blank" rel="noreferrer">نصب اپلیکیشن</Link>
            <Link className="nav-link" href="/settings"><Settings2 size={15} /> تنظیمات</Link>
          </nav>
          <Link className="brand" href="/" aria-label="نت‌ایران، صفحهٔ اصلی"><span>نت‌ایران</span><span className="brand-mark"><Music2 size={25} strokeWidth={2.7} /></span></Link>
        </div>
        <div className="search-row">
          <form className="global-search" onSubmit={submitSearch} role="search">
            <Search size={19} aria-hidden="true" />
            <input aria-label="جستجوی قطعه یا هنرمند" placeholder="نام قطعه یا هنرمند..." value={query} onChange={(event) => setQuery(event.target.value)} />
          </form>
        </div>
      </header>
      {children}
      <footer className="site-footer page-wrap">
        <div><div className="footer-brand">دربارهٔ نت‌ایران</div><p>پدیدآورنده: عرفان نادریان · آموزش و تمرین موسیقی، همراه شما</p></div>
        <nav className="footer-links" aria-label="پیوندهای پایین صفحه">
          <Link href="/scores">فهرست قطعات</Link><Link href="/artists">هنرمندان</Link><Link href="/subscription">اشتراک‌ها</Link><Link href="/support">پشتیبانی</Link><Link href="/feedback">گزارش اشکال</Link>
        </nav>
      </footer>
      <nav className="bottom-nav" aria-label="ناوبری موبایل">
        <Link className={pathname === "/" ? "active" : ""} href="/"><Home size={18} /><span>خانه</span></Link>
        <Link className={pathname.startsWith("/scores") ? "active" : ""} href="/scores"><BookOpen size={18} /><span>کتابخانه</span></Link>
        <Link className={pathname.startsWith("/start-piano") ? "active" : ""} href="/start-piano"><Gamepad2 size={18} /><span>نوازندگی</span></Link>
        <Link className={pathname.startsWith("/support") ? "active" : ""} href="/support"><Headphones size={18} /><span>تنظیمات</span></Link>
      </nav>
    </>
  );
}
