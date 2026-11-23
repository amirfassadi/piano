"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState, useSyncExternalStore, type FormEvent, type ReactNode } from "react";
import { AlignJustify, ArrowUpRight, BookOpen, Headphones, Heart, Home, Moon, Search, Sun, UserRound, X } from "lucide-react";
import { t, type Locale } from "@/lib/i18n";

type LocaleContextValue = { locale: Locale; setLocale: (locale: Locale) => void };
const LocaleContext = createContext<LocaleContextValue>({ locale: "fa", setLocale: () => undefined });
type FavoritesContextValue = { liked: string[]; toggleLike: (slug: string) => void };
const FavoritesContext = createContext<FavoritesContextValue | null>(null);
const preferenceEvent = "nuance-preference-change";

function subscribeToPreferences(callback: () => void) {
  window.addEventListener(preferenceEvent, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(preferenceEvent, callback);
    window.removeEventListener("storage", callback);
  };
}

function getLocaleSnapshot(): Locale {
  return window.localStorage.getItem("nuance-language") === "en" ? "en" : "fa";
}
function getLocaleServerSnapshot(): Locale { return "fa"; }
function getThemeSnapshot(): boolean { return window.localStorage.getItem("nuance-theme") === "dark"; }
function getThemeServerSnapshot(): boolean { return false; }
function notifyPreferenceChange() { window.dispatchEvent(new Event(preferenceEvent)); }

export function useLocale(): LocaleContextValue {
  return useContext(LocaleContext);
}

export function useFavorites(): FavoritesContextValue {
  const context = useContext(FavoritesContext);
  if (!context) throw new Error("useFavorites must be used within SiteShell");
  return context;
}

export function SiteShell({ children }: { children: ReactNode }) {
  const locale = useSyncExternalStore(subscribeToPreferences, getLocaleSnapshot, getLocaleServerSnapshot);
  const dark = useSyncExternalStore(subscribeToPreferences, getThemeSnapshot, getThemeServerSnapshot);
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [liked, setLiked] = useState<string[]>([]);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "fa" ? "rtl" : "ltr";
  }, [locale]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark-mode", dark);
  }, [dark]);

  function setLocale(next: Locale) {
    window.localStorage.setItem("nuance-language", next);
    notifyPreferenceChange();
    setMenuOpen(false);
  }

  function toggleTheme() {
    window.localStorage.setItem("nuance-theme", dark ? "light" : "dark");
    notifyPreferenceChange();
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const term = query.trim();
    router.push(term ? `/?q=${encodeURIComponent(term)}#catalog` : "/#catalog");
    setMenuOpen(false);
  }

  const navItems = [
    { href: "/scores", label: t(locale, "navLibrary"), icon: BookOpen },
    { href: "/artists", label: t(locale, "navArtists") },
    { href: "/song-requests", label: t(locale, "navRequests") },
    { href: "/subscription", label: t(locale, "navMembership") },
    { href: "/support", label: t(locale, "navSupport"), icon: Headphones },
  ];

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      <FavoritesContext.Provider value={{
        liked,
        toggleLike: (slug) => setLiked((current) => current.includes(slug) ? current.filter((item) => item !== slug) : [...current, slug]),
      }}>
      <div className={`site-shell ${locale === "en" ? "shell-en" : "shell-fa"}`}>
        <a className="skip-link" href="#main-content">{locale === "en" ? "Skip to content" : "رفتن به محتوای صفحه"}</a>
        <header className="site-header">
          <div className="topbar">
            <button className="menu-trigger icon-button" type="button" onClick={() => setMenuOpen((open) => !open)} aria-label={menuOpen ? t(locale, "closeMenu") : t(locale, "openMenu")} aria-expanded={menuOpen} aria-controls="primary-navigation">
              {menuOpen ? <X size={19} /> : <AlignJustify size={19} />}
            </button>
            <Link className="brand" href="/" aria-label="NUANCE — home">
              <span className="brand-mark" aria-hidden="true"><span>N</span><i /></span>
              <span className="brand-word">NUANCE</span>
              <span className="brand-caption">PIANO SCORES</span>
            </Link>
            <nav id="primary-navigation" className={`main-nav ${menuOpen ? "open" : ""}`} aria-label={locale === "en" ? "Primary navigation" : "ناوبری اصلی"}>
              {navItems.map(({ href, label, icon: Icon }) => (
                <Link key={href} href={href} className={`nav-link ${pathname === href ? "active" : ""}`} aria-current={pathname === href ? "page" : undefined} onClick={() => setMenuOpen(false)}>
                  {Icon && <Icon size={15} aria-hidden="true" />}{label}
                </Link>
              ))}
            </nav>
            <div className="header-tools">
              <button className="locale-button" type="button" onClick={() => setLocale(locale === "fa" ? "en" : "fa")} aria-label={locale === "en" ? "Switch language to Persian" : "تغییر زبان به انگلیسی"}>{t(locale, "language")}</button>
              <button className="icon-button theme-button" type="button" onClick={toggleTheme} aria-label={dark ? t(locale, "themeLight") : t(locale, "themeDark")} title={dark ? t(locale, "themeLight") : t(locale, "themeDark")}>
                {dark ? <Sun size={17} /> : <Moon size={17} />}
              </button>
              <Link className="icon-button favorite-button" href="/#catalog" aria-label={`${t(locale, "favorites")} (${liked.length})`} title={`${t(locale, "favorites")} (${liked.length})`}><Heart size={16} /><span>{liked.length}</span></Link>
              <Link className="icon-button account-button" href="/account" aria-label={t(locale, "navAccount")}><UserRound size={17} /></Link>
            </div>
          </div>
          <div className="search-row">
            <form className="global-search" onSubmit={submitSearch} role="search">
              <Search size={17} aria-hidden="true" />
              <input aria-label={t(locale, "searchLabel")} dir="auto" placeholder={t(locale, "searchPlaceholder")} value={query} onChange={(event) => setQuery(event.target.value)} />
              <button type="submit" aria-label={t(locale, "searchButton")}><ArrowUpRight size={16} /></button>
            </form>
          </div>
        </header>
        {children}
        <footer className="site-footer">
          <div className="footer-main">
            <Link className="footer-wordmark" href="/">NUANCE<span aria-hidden="true">.</span></Link>
            <p>{t(locale, "footerAbout")}<br />{t(locale, "footerNote")}</p>
          </div>
          <div className="footer-column">
            <span className="footer-heading">{t(locale, "footerExplore")}</span>
            <Link href="/scores">{t(locale, "navLibrary")}</Link>
            <Link href="/artists">{t(locale, "navArtists")}</Link>
            <Link href="/song-requests">{t(locale, "navRequests")}</Link>
          </div>
          <div className="footer-column">
            <span className="footer-heading">{t(locale, "footerHelp")}</span>
            <Link href="/subscription">{t(locale, "navMembership")}</Link>
            <Link href="/support">{t(locale, "navSupport")}</Link>
            <Link href="/account">{t(locale, "navAccount")}</Link>
          </div>
          <div className="footer-mark" aria-hidden="true"><span>♩</span><i /><i /><i /></div>
          <div className="footer-bottom"><span>© NUANCE · {new Date().getFullYear()}</span><Link href="/scores"><Heart size={13} /> {t(locale, "navLibrary")}</Link></div>
        </footer>
        <nav className="bottom-nav" aria-label={locale === "en" ? "Mobile navigation" : "ناوبری موبایل"}>
          <Link className={pathname === "/" ? "active" : ""} href="/"><Home size={18} /><span>{t(locale, "navHome")}</span></Link>
          <Link className={pathname.startsWith("/scores") ? "active" : ""} href="/scores"><BookOpen size={18} /><span>{t(locale, "navLibrary")}</span></Link>
          <Link className={pathname.startsWith("/song-requests") ? "active" : ""} href="/song-requests"><Heart size={18} /><span>{t(locale, "navRequests")}</span></Link>
          <Link className={pathname.startsWith("/account") || pathname.startsWith("/payments") ? "active" : ""} href="/account"><UserRound size={18} /><span>{t(locale, "navAccount")}</span></Link>
        </nav>
      </div>
      </FavoritesContext.Provider>
    </LocaleContext.Provider>
  );
}
