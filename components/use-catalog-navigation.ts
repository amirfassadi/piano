"use client";

import { usePathname, useRouter } from "next/navigation";
import { updateCatalogUrl, type CatalogUrlPatch } from "@/lib/catalog-url";

export const CATALOG_NAVIGATION_EVENT = "nuance:catalog-navigation";

type NavigationDetail = { href: string };

export function announceCatalogNavigation(href: string) {
  window.dispatchEvent(new CustomEvent<NavigationDetail>(CATALOG_NAVIGATION_EVENT, { detail: { href } }));
}

export function useCatalogNavigation() {
  const pathname = usePathname() ?? "/";
  const router = useRouter();

  return (patch: CatalogUrlPatch, targetPath = pathname) => {
    const href = updateCatalogUrl(targetPath, window.location.search, window.location.hash, patch);
    const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    if (href === current) return;
    router.push(href, { scroll: false });
    announceCatalogNavigation(href);
  };
}
