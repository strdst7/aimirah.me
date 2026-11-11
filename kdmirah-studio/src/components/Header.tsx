import { useEffect, useState } from "react";
import { Icon, Logo, Wordmark } from "./Icon";
import { GITHUB_STARS, SITE } from "../lib/content";
import { lockScroll, unlockScroll } from "../lib/scrollLock";
import { cn } from "@aimirah/shared/cn";

type HeaderProps = {
  dark: boolean;
  onToggleTheme: () => void;
  onOpenSearch: () => void;
  onSignIn: () => void;
  onNotify: (message: string) => void;
};

const LANGUAGES = ["English", "Français", "Deutsch", "Español", "Português", "日本語", "한국어"];

const NAV = [
  { label: "Videos", href: "#videos" },
  { label: "Skills", href: "#skills" },
  { label: "Sections", href: "#sections" },
  { label: "Learn", href: "#faq" },
];

export function Header({ dark, onToggleTheme, onOpenSearch, onSignIn, onNotify }: HeaderProps) {
  const [languageOpen, setLanguageOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setLanguageOpen(false);
        setMobileOpen(false);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    lockScroll();
    return () => unlockScroll();
  }, [mobileOpen]);

  const navLink =
    "inline-flex h-9 items-center rounded-full px-2.5 text-sm font-medium text-muted transition-colors hover:bg-fg/[0.05] hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fg/30";
  const iconButton =
    "grid size-8 shrink-0 place-items-center rounded-full border border-line bg-card/60 text-muted transition-colors hover:border-line-strong hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fg/30";

  return (
    <>
      <header
        className="relative z-40 border-b border-line/70 bg-bg/95 backdrop-blur-xl supports-[backdrop-filter]:bg-bg/90"
        data-testid="site-header"
      >
        <nav className="mx-auto flex w-full max-w-[1500px] flex-wrap items-center gap-x-3 gap-y-2 px-4 py-2.5 sm:px-6 lg:px-8 xl:h-16 xl:flex-nowrap xl:py-0">
          <a href="#" className="group -ml-2 flex shrink-0 items-center gap-2 rounded-xl px-2 py-1.5 transition-colors hover:bg-fg/[0.05]">
            <Logo className="transition-transform duration-200 group-hover:scale-105" />
            <Wordmark className="text-[17px]" />
          </a>

          <div className="hidden items-center gap-1 md:flex">
            {NAV.map((item) => (
              <a key={item.href} href={item.href} className={navLink}>
                {item.label}
              </a>
            ))}
          </div>

          <div className="order-last w-full xl:order-none xl:ml-auto xl:w-[224px] xl:flex-none">
            <button
              type="button"
              onClick={onOpenSearch}
              aria-label="Search videos and prompts"
              className="flex h-9 w-full items-center justify-between gap-3 rounded-full border border-line bg-card/70 pr-3 pl-3.5 text-[13px] text-muted transition-colors hover:border-line-strong hover:bg-card focus-visible:ring-2 focus-visible:ring-fg/30 focus-visible:outline-none"
            >
              <span className="truncate">What do you want to create?</span>
              <Icon name="search" className="size-[17px] shrink-0" />
            </button>
          </div>

          <div className="ml-auto flex items-center gap-1.5 sm:gap-2 xl:ml-0">
            <button
              type="button"
              onClick={() => onNotify("Skill request form opened")}
              aria-label="Request a Skill"
              title="Request a Skill"
              className="grid size-8 shrink-0 place-items-center rounded-full bg-lime text-ink transition-colors hover:bg-[#e8432b] focus-visible:ring-2 focus-visible:ring-fg/30 focus-visible:outline-none"
            >
              <Icon name="message-plus" className="size-4" />
            </button>

            <div className="relative hidden md:block">
              <button
                type="button"
                aria-label="Change language"
                aria-expanded={languageOpen}
                onClick={() => setLanguageOpen((open) => !open)}
                className={iconButton}
              >
                <Icon name="globe" className="size-4" />
              </button>
              {languageOpen && (
                <div className="absolute top-full right-0 z-50 w-44 pt-2">
                  <div className="animate-fade-up rounded-2xl border border-line bg-card p-1.5 shadow-xl">
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => {
                          setLanguageOpen(false);
                          onNotify(`Language set to ${lang} (demo)`);
                        }}
                        className={cn(
                          "flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-[13px] transition-colors hover:bg-soft",
                          lang === "English" && "font-semibold"
                        )}
                      >
                        {lang}
                        {lang === "English" && <Icon name="check" className="size-3.5 text-muted" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
              title={dark ? "Light theme" : "Dark theme"}
              onClick={onToggleTheme}
              className={cn(iconButton, "hidden md:grid")}
            >
              <Icon name={dark ? "sun" : "moon"} className="size-4" />
            </button>

            <button
              type="button"
              onClick={onSignIn}
              className="hidden h-9 items-center justify-center rounded-full bg-fg px-3.5 text-[13px] font-semibold text-bg transition-opacity hover:opacity-85 focus-visible:ring-2 focus-visible:ring-fg/30 focus-visible:outline-none sm:inline-flex md:px-4"
            >
              Sign In
            </button>

            <button
              type="button"
              aria-label="Open menu"
              onClick={() => setMobileOpen(true)}
              className="grid size-9 shrink-0 place-items-center rounded-full border border-line bg-card/60 text-fg transition-colors hover:bg-card md:hidden"
            >
              <Icon name="menu" className="size-[18px]" />
            </button>
          </div>
        </nav>
      </header>

      {languageOpen && (
        <button
          type="button"
          aria-label="Close language menu"
          onClick={() => setLanguageOpen(false)}
          className="fixed inset-0 z-30 cursor-default bg-transparent"
        />
      )}

      {mobileOpen && (
        <div className="fixed inset-0 z-[80] md:hidden" role="dialog" aria-modal="true" aria-label="Site menu">
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-x-2 top-2 bottom-2 flex animate-scale-in flex-col overflow-y-auto rounded-3xl border border-line bg-bg p-4">
            <div className="flex items-center justify-between">
              <a href="#" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
                <Logo />
                <Wordmark className="text-[17px]" />
              </a>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                className="grid size-9 place-items-center rounded-full border border-line bg-card/70"
              >
                <Icon name="x" className="size-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                onOpenSearch();
              }}
              className="mt-4 flex h-11 w-full items-center justify-between gap-3 rounded-full border border-line bg-card/70 px-4 text-[14px] text-muted"
            >
              What do you want to create?
              <Icon name="search" className="size-[18px]" />
            </button>

            <div className="mt-4 grid gap-0.5 text-[15px] font-medium">
              {NAV.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-between rounded-xl px-2 py-3 transition-colors hover:bg-soft"
                >
                  {link.label}
                  <Icon name="arrow-right" className="size-4 text-muted" />
                </a>
              ))}
            </div>

            <div className="mt-auto grid gap-2 pt-6">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onToggleTheme}
                  className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full border border-line text-[13px] font-semibold"
                >
                  <Icon name={dark ? "sun" : "moon"} className="size-4" />
                  {dark ? "Light mode" : "Dark mode"}
                </button>
                <a
                  href={SITE.archiveUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full border border-line text-[13px] font-semibold"
                >
                  <Icon name="github" className="size-4" />
                  GitHub
                  <span className="rounded-full bg-lime px-1.5 py-0.5 text-[10px] font-bold text-ink tabular-nums">
                    {GITHUB_STARS.toLocaleString()}
                  </span>
                </a>
              </div>
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  onSignIn();
                }}
                className="inline-flex h-11 items-center justify-center rounded-full bg-fg text-[14px] font-semibold text-bg"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
