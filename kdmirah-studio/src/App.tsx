import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { VideoGallery } from "./components/VideoGallery";
import { VideoModal } from "./components/VideoModal";
import { SearchDialog } from "./components/SearchDialog";
import { PopularSkills } from "./components/PopularSkills";
import { Faq } from "./components/Faq";
import { ClosingCta, Footer } from "./components/Footer";
import { AuthDialog, SkillDialog } from "./components/Dialogs";
import { Toast } from "./components/Toast";
import {
  CATEGORY_BY_KEY,
  sortVideos,
  videos,
  type CategoryKey,
  type Skill,
  type Video,
} from "./lib/content";

export default function App() {
  const [dark, setDark] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    const stored = window.localStorage.getItem("kdmirah-theme");
    if (stored) return stored === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });
  const [category, setCategory] = useState<CategoryKey>("all");
  const [compare, setCompare] = useState(false);
  const [sort, setSort] = useState("trending");
  const [page, setPage] = useState(1);
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeVideo, setActiveVideo] = useState<Video | null>(null);
  const [activeSkill, setActiveSkill] = useState<Skill | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [toast, setToast] = useState<{ id: number; message: string } | null>(null);
  const toastId = useRef(0);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    document.documentElement.style.colorScheme = dark ? "dark" : "light";
    try {
      window.localStorage.setItem("kdmirah-theme", dark ? "dark" : "light");
    } catch {
      // storage can be unavailable in private modes
    }
  }, [dark]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const notify = useCallback((message: string) => {
    toastId.current += 1;
    setToast({ id: toastId.current, message });
  }, []);

  const copy = useCallback(
    async (text: string, message: string) => {
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        const area = document.createElement("textarea");
        area.value = text;
        area.style.position = "fixed";
        area.style.opacity = "0";
        document.body.appendChild(area);
        area.select();
        try {
          document.execCommand("copy");
        } catch {
          // ignore copy failures
        }
        document.body.removeChild(area);
      }
      notify(message);
    },
    [notify]
  );

  const filtered = useMemo(() => {
    const categoryName = CATEGORY_BY_KEY[category];
    const list = categoryName ? videos.filter((video) => video.category === categoryName) : videos;
    return sortVideos(list, sort);
  }, [category, sort]);

  const modalList =
    activeVideo && !filtered.some((video) => video.slug === activeVideo.slug) ? videos : filtered;
  const activeIndex = activeVideo
    ? Math.max(
        0,
        modalList.findIndex((video) => video.slug === activeVideo.slug)
      )
    : 0;

  function changeCategory(key: CategoryKey) {
    setCategory(key);
    setPage(1);
  }

  function copyPrompt(video: Video) {
    void copy(video.prompt, `Prompt by @${video.author} copied to clipboard`);
  }

  function installSkill(skill: Skill) {
    void copy(`npx kdmirah add ${skill.slug}`, `Install command for ${skill.title} copied`);
  }

  function navigateVideo(direction: 1 | -1) {
    if (!activeVideo || modalList.length === 0) return;
    const next = (activeIndex + direction + modalList.length) % modalList.length;
    setActiveVideo(modalList[next]);
  }

  return (
    <div className="flex min-h-screen flex-col bg-bg text-fg">
      <div className="sticky top-0 z-50">
        <Header
          dark={dark}
          onToggleTheme={() => setDark((value) => !value)}
          onOpenSearch={() => setSearchOpen(true)}
          onSignIn={() => setAuthOpen(true)}
          onNotify={notify}
        />
      </div>

      <main id="main-content" className="flex-1">
        <Hero />
        <VideoGallery
          videos={filtered}
          page={page}
          category={category}
          compare={compare}
          sort={sort}
          onPageChange={setPage}
          onCategory={changeCategory}
          onCompare={(value) => {
            setCompare(value);
            setPage(1);
          }}
          onSort={(value) => {
            setSort(value);
            setPage(1);
          }}
          onOpen={(video) => setActiveVideo(video)}
          onCopy={copyPrompt}
          onOpenSkill={(skill) => setActiveSkill(skill)}
        />
        <PopularSkills onOpenSkill={(skill) => setActiveSkill(skill)} onNotify={notify} />
        <Faq />
        <ClosingCta />
      </main>

      <Footer onNotify={notify} />

      {searchOpen && (
        <SearchDialog
          onClose={() => setSearchOpen(false)}
          onSelect={(video) => {
            setSearchOpen(false);
            setActiveVideo(video);
          }}
          onCategory={changeCategory}
        />
      )}

      {activeVideo && (
        <VideoModal
          video={activeVideo}
          index={activeIndex}
          count={modalList.length}
          onClose={() => setActiveVideo(null)}
          onNavigate={navigateVideo}
          onCopy={copyPrompt}
          onOpenSkill={(skill) => setActiveSkill(skill)}
        />
      )}

      {activeSkill && (
        <SkillDialog
          skill={activeSkill}
          onClose={() => setActiveSkill(null)}
          onInstall={installSkill}
        />
      )}

      {authOpen && <AuthDialog onClose={() => setAuthOpen(false)} onNotify={notify} />}

      {toast && <Toast key={toast.id} message={toast.message} onClose={() => setToast(null)} />}
    </div>
  );
}
