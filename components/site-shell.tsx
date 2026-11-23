"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useState, type FormEvent, type ReactNode } from "react";
import { AlignJustify, BookOpen, CheckSquare, Gamepad2, Headphones, Heart, Home, Moon, Search, Settings2, Sun, UserRound } from "lucide-react";

type FavoritesContextValue = {
  liked: string[];
  toggleLike: (slug: string) => void;
};

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) throw new Error("useFavorites must be used within SiteShell");
  return context;
}

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
  const [liked, setLiked] = useState<string[]>([]);
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
          <Link className="brand" href="/" aria-label="NUANCE، صفحهٔ اصلی">
            <span className="brand-wordmark">NUANCE</span>
            <span className="brand-note" lang="fa">هر نت، یک ظرافت.</span>
          </Link>
          <nav className={`main-nav ${menuOpen ? "open" : ""}`} aria-label="ناوبری اصلی">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} className={`nav-link ${pathname === href ? "active" : ""}`} onClick={() => setMenuOpen(false)}>
                {Icon && <Icon size={15} aria-hidden="true" />}{label}
              </Link>
            ))}
            <Link className="nav-link" href="https://notiran.app/" target="_blank" rel="noreferrer">نصب اپلیکیشن</Link>
            <Link className="nav-link" href="/settings"><Settings2 size={15} /> تنظیمات</Link>
          </nav>
          <div className="header-tools">
            <button className="round-tool" onClick={toggleTheme} aria-label="تغییر حالت تاریک و روشن">{dark ? <Sun size={18} /> : <Moon size={18} />}</button>
            <Link className="round-tool" href="/account" aria-label="حساب من"><UserRound size={18} /></Link>
            <Link className="round-tool favorite-tool" href="/#popular-title" aria-label={`علاقه‌مندی‌ها، ${liked.length}`}>
              <Heart size={18} /><span>{liked.length}</span>
            </Link>
            <Link className="round-tool" href="/payments/my-scores" aria-label="خریدهای تکی من"><CheckSquare size={18} /></Link>
          </div>
        </div>
        <div className="search-row">
          <form className="global-search" onSubmit={submitSearch} role="search">
            <Search size={19} aria-hidden="true" />
            <input aria-label="جستجوی قطعه یا هنرمند" placeholder="نام قطعه یا هنرمند..." value={query} onChange={(event) => setQuery(event.target.value)} />
            <kbd>↵</kbd>
          </form>
        </div>
      </header>
      <FavoritesContext.Provider value={{
        liked,
        toggleLike: (slug) => setLiked((current) => current.includes(slug) ? current.filter((item) => item !== slug) : [...current, slug]),
      }}>
        {children}
      </FavoritesContext.Provider>
      <footer className="site-footer page-wrap">
        <div className="footer-brand-block"><Link className="footer-brand" href="/">NUANCE</Link><p className="footer-tagline">Every Note Has a Nuance.<br /><span lang="fa">هر نت، یک ظرافت.</span></p></div>
        <nav className="footer-links" aria-label="پیوندهای پایین صفحه">
          <Link href="/scores">فهرست قطعات</Link><Link href="/artists">هنرمندان</Link><Link href="/subscription">اشتراک‌ها</Link><Link href="/support">پشتیبانی</Link><Link href="/feedback">گزارش اشکال</Link>
        </nav>
        <span className="footer-credit">پدیدآورنده: عرفان نادریان</span>
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
