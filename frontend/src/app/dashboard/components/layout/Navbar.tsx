"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu, Search, ArrowUpRight } from "lucide-react";
import { appRoutes, defaultRouteByRole } from "@/config/roleAccess";
import { api } from "@/lib/axios";
import { usePosStore } from "@/stores/posStore";

export default function Navbar({
  onOpenMobileMenu,
}: {
  onOpenMobileMenu: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [roleChanging, setRoleChanging] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const role = usePosStore((state) => state.role);
  const setRole = usePosStore((state) => state.setRole);
  const searchablePages = useMemo(
    () =>
      appRoutes
        .filter((page) => page.roles.includes(role) && page.key !== "logout")
        .map((page) => ({
          label: page.name,
          href: page.href,
          description: page.description,
          keywords: page.keywords,
        })),
    [role]
  );

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setFocused(false);
      }
    }

    window.addEventListener("mousedown", handlePointerDown);
    return () => window.removeEventListener("mousedown", handlePointerDown);
  }, []);

  const results = useMemo(() => {
    const trimmed = query.trim().toLowerCase();

    if (!trimmed) {
      return searchablePages.slice(0, 6).map((page) => ({
        ...page,
        score: 0,
        matchedText: page.description,
      }));
    }

    const queryWords = trimmed.split(/\s+/).filter(Boolean);

    return searchablePages
      .map((page) => {
        const searchTargets = [
          page.label,
          page.href.replace("/", ""),
          page.description,
          ...page.keywords,
        ];
        const haystack = searchTargets.join(" ").toLowerCase();

        let score = 0;
        let matchedText = page.description;

        if (page.label.toLowerCase().startsWith(trimmed)) score += 8;
        if (page.label.toLowerCase().includes(trimmed)) score += 6;
        if (page.href.toLowerCase().includes(trimmed)) score += 5;

        for (const word of queryWords) {
          if (page.keywords.some((keyword) => keyword.toLowerCase().includes(word))) {
            score += 4;
            matchedText =
              page.keywords.find((keyword) => keyword.toLowerCase().includes(word)) ??
              matchedText;
          } else if (page.description.toLowerCase().includes(word)) {
            score += 2;
            matchedText = page.description;
          } else if (haystack.includes(word)) {
            score += 1;
          }
        }

        return { ...page, score, matchedText };
      })
      .filter((page) => page.score > 0)
      .sort((a, b) => b.score - a.score || a.label.localeCompare(b.label))
      .slice(0, 6);
  }, [query, searchablePages]);

  useEffect(() => {
    results.slice(0, 3).forEach((result) => router.prefetch(result.href));
  }, [results, router]);

  const shouldShowResults = focused && (query.trim().length > 0 || results.length > 0);

  function openResult(href: string) {
    setQuery("");
    setFocused(false);
    setHighlightedIndex(0);
    if (pathname !== href) {
      router.push(href);
    }
  }

  async function handleRoleChange(nextRole: typeof role) {
    setRoleChanging(true);

    try {
      await api.post("/auth/guest", { role: nextRole });
      setRole(nextRole);
      const destination = defaultRouteByRole[nextRole];
      if (pathname !== destination) {
        router.replace(destination);
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : "Unable to switch role");
    } finally {
      setRoleChanging(false);
    }
  }
  return (
    <div className="flex min-h-14 items-center gap-3 sm:min-h-16 sm:gap-4">
      <button
        type="button"
        onClick={onOpenMobileMenu}
        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-700 transition hover:bg-slate-50 lg:hidden"
        aria-label="Open navigation menu"
      >
        <Menu size={18} />
      </button>

      <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
        <div ref={containerRef} className="relative w-full sm:max-w-64 lg:max-w-80">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setHighlightedIndex(0);
            }}
            onFocus={() => {
              setFocused(true);
              setHighlightedIndex(0);
            }}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown") {
                event.preventDefault();
                setHighlightedIndex((prev) =>
                  Math.min(prev + 1, Math.max(results.length - 1, 0))
                );
              }

              if (event.key === "ArrowUp") {
                event.preventDefault();
                setHighlightedIndex((prev) => Math.max(prev - 1, 0));
              }

              if (event.key === "Enter" && results[highlightedIndex]) {
                event.preventDefault();
                openResult(results[highlightedIndex].href);
              }

              if (event.key === "Escape") {
                setFocused(false);
              }
            }}
            placeholder="Search revenue, stock, transfers, insights..."
            className="w-full min-w-0 rounded-xl border border-slate-300 py-2.5 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
          />

          {shouldShowResults ? (
            <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-30 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_24px_60px_-30px_rgba(15,23,42,0.35)]">
              {results.length > 0 ? (
                <div className="py-2">
                  {results.map((result, index) => {
                    const active = pathname === result.href;
                    const highlighted = index === highlightedIndex;

                    return (
                      <button
                        key={result.href}
                        type="button"
                        onClick={() => openResult(result.href)}
                        className={`flex w-full items-start justify-between gap-3 px-4 py-3 text-left transition ${
                          highlighted || active ? "bg-slate-50" : "hover:bg-slate-50"
                        }`}
                      >
                        <div>
                          <div className="text-sm font-semibold text-slate-900">
                            {result.label}
                          </div>
                          <div className="mt-1 text-xs leading-5 text-slate-500">
                            {query.trim()
                              ? `Best match for "${query.trim()}": ${result.matchedText}`
                              : result.description}
                          </div>
                        </div>
                        <ArrowUpRight size={15} className="mt-0.5 shrink-0 text-slate-400" />
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="px-4 py-4 text-sm text-slate-500">
                  No matching page found.
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3 lg:gap-4">
        <select
          value={role}
          onChange={(event) => void handleRoleChange(event.target.value as typeof role)}
          disabled={roleChanging}
          className="hidden h-10 rounded-xl border border-slate-300 bg-white px-3 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-60 md:block"
          aria-label="Current role"
        >
          {["OWNER", "ADMIN", "STORE_MANAGER", "CASHIER", "WAREHOUSE_MANAGER", "ANALYST"].map((item) => (
            <option key={item} value={item}>
              {item.replaceAll("_", " ")}
            </option>
          ))}
        </select>

        <button className="hidden text-sm text-slate-600 hover:text-slate-900 sm:block">
          Notifications
        </button>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-700 sm:hidden"
          aria-label="Notifications"
        >
          !
        </button>

        <div className="whitespace-nowrap text-sm font-medium text-slate-700">
          {role.replaceAll("_", " ")}
        </div>
      </div>
    </div>
  );
}
