"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

function stopInertia(lenis: Lenis) {
  const wasStopped = lenis.isStopped;
  lenis.stop();
  if (!wasStopped) lenis.start();
}

/** The offers occupy the pinned stage, so their readable anchor is its end. */
function homeOfferAnchor(target: HTMLElement) {
  const opening = target.closest<HTMLElement>(".home-opening.is-scroll-scene");
  if (!opening || !target.closest(".opening-services")) return target;
  const end = Number(opening.dataset.openingEnd);
  return Number.isFinite(end) && opening.dataset.openingEnd ? end : target;
}

/** One native-window scroller for the public site; dialogs keep their own scroll. */
export default function SmoothScroll() {
  const pathname = usePathname();
  const scroller = useRef<Lenis | null>(null);
  const synchronize = useRef<(() => void) | null>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();
    let initialActivation = true;
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const lenis = new Lenis({
        duration: 1.15,
        smoothWheel: true,
        syncTouch: false,
        stopInertiaOnNavigate: true,
        prevent: node => !!node.closest("dialog,textarea,select,[role='listbox'],[data-lenis-prevent]"),
      });
      scroller.current = lenis;
      let blocked = false;
      let pendingAnchor: URL | null = null;
      let disposed = false;
      let initialFrame = 0;
      const initialHash = initialActivation ? location.hash : "";
      let alignInitialHash = !!initialHash && (performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined)?.type !== "back_forward";
      const focusCleanups = new Set<() => void>();
      const focusAnchor = (target: HTMLElement) => {
        if (!target.hasAttribute("tabindex") && target.tabIndex < 0) {
          target.setAttribute("tabindex", "-1");
          const restore = () => {
            if (target.getAttribute("tabindex") === "-1") target.removeAttribute("tabindex");
            target.removeEventListener("blur", restore);
            focusCleanups.delete(restore);
          };
          focusCleanups.add(restore);
          target.addEventListener("blur", restore, { once: true });
        }
        target.focus({ preventScroll: true });
      };

      const moveToAnchor = (url: URL) => {
        if (url.pathname !== location.pathname || url.search !== location.search) return;
        let id: string;
        try { id = decodeURIComponent(url.hash.slice(1)); } catch { return; }
        const target = document.getElementById(id);
        if (!target) return;
        stopInertia(lenis);
        const oldURL = location.href;
        if (location.hash !== url.hash) {
          history.pushState(null, "", url.hash);
        }
        // Keep ordinary hash listeners informed on repeated anchor activations.
        window.dispatchEvent(new HashChangeEvent("hashchange", { oldURL, newURL: location.href }));
        lenis.scrollTo(homeOfferAnchor(target), {
          onComplete: () => focusAnchor(target),
        });
      };
      const synchronizeOverlays = () => {
        const next = !!document.querySelector("dialog[open]") || document.body.style.overflow === "hidden";
        if (next !== blocked) {
          blocked = next;
          if (blocked) lenis.stop();
          else lenis.start();
        }
        if (!blocked && pendingAnchor) {
          const destination = pendingAnchor;
          pendingAnchor = null;
          moveToAnchor(destination);
        }
      };
      synchronize.current = synchronizeOverlays;
      synchronizeOverlays();

      const onAnchorClick = (event: MouseEvent) => {
        alignInitialHash = false;
        if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        const link = event.composedPath().find(node => node instanceof HTMLAnchorElement) as HTMLAnchorElement | undefined;
        if (!link || link.hasAttribute("download") || (link.target && link.target !== "_self")) return;
        const url = new URL(link.href, location.href);
        if (url.origin === location.origin && (!url.hash || url.pathname !== location.pathname || url.search !== location.search)) {
          stopInertia(lenis);
          return;
        }
        if (url.origin !== location.origin || url.pathname !== location.pathname || url.search !== location.search || !url.hash) return;
        let target: HTMLElement | null;
        try { target = document.getElementById(decodeURIComponent(url.hash.slice(1))); } catch { return; }
        if (!target) return;
        const dialog = link.closest("dialog");
        if (dialog && !dialog.classList.contains("modern-mobile-menu")) return;
        event.preventDefault();
        if (dialog?.open) pendingAnchor = url; // The real menu handler still closes the dialog.
        else moveToAnchor(url);
      };
      const resetInertia = () => stopInertia(lenis);
      const onKeyDown = (event: KeyboardEvent) => {
        alignInitialHash = false;
        if (["Tab", "ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "].includes(event.key)) resetInertia();
      };
      const update = () => { if (!blocked) ScrollTrigger.update(); };
      const tick = (time: number) => lenis.raf(time * 1000);
      const resize = () => lenis.resize();
      const cancelInitialAlignment = () => { alignInitialHash = false; };
      lenis.on("scroll", update);
      gsap.ticker.add(tick);
      ScrollTrigger.addEventListener("refresh", resize);

      // Observe only overlay state, never the per-frame styles inside the hero.
      const dialogs = new MutationObserver(synchronizeOverlays);
      dialogs.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ["open"] });
      const bodyLock = new MutationObserver(synchronizeOverlays);
      bodyLock.observe(document.body, { attributes: true, attributeFilter: ["style"] });
      document.addEventListener("click", onAnchorClick, true);
      document.addEventListener("keydown", onKeyDown, true);
      document.addEventListener("focusin", resetInertia);
      window.addEventListener("popstate", resetInertia);
      window.addEventListener("hashchange", resetInertia);
      window.addEventListener("pageshow", resetInertia);
      window.addEventListener("pagehide", resetInertia);
      window.addEventListener("wheel", cancelInitialAlignment, { passive: true });
      window.addEventListener("touchstart", cancelInitialAlignment, { passive: true });
      // CSS smooth fragment scrolling can be interrupted as Lenis initializes.
      // Resolve only the fresh document's fragment after its fonts have settled.
      document.fonts.ready.then(() => {
        if (disposed || !alignInitialHash || location.hash !== initialHash) return;
        initialFrame = requestAnimationFrame(() => {
          if (disposed || !alignInitialHash) return;
          let target: HTMLElement | null;
          try { target = document.getElementById(decodeURIComponent(initialHash.slice(1))); } catch { return; }
          if (target) { lenis.resize(); lenis.scrollTo(homeOfferAnchor(target), { immediate: true, force: true }); }
        });
      });

      return () => {
        disposed = true;
        cancelAnimationFrame(initialFrame);
        dialogs.disconnect();
        bodyLock.disconnect();
        focusCleanups.forEach(restore => restore());
        document.removeEventListener("click", onAnchorClick, true);
        document.removeEventListener("keydown", onKeyDown, true);
        document.removeEventListener("focusin", resetInertia);
        window.removeEventListener("popstate", resetInertia);
        window.removeEventListener("hashchange", resetInertia);
        window.removeEventListener("pageshow", resetInertia);
        window.removeEventListener("pagehide", resetInertia);
        window.removeEventListener("wheel", cancelInitialAlignment);
        window.removeEventListener("touchstart", cancelInitialAlignment);
        ScrollTrigger.removeEventListener("refresh", resize);
        gsap.ticker.remove(tick);
        lenis.off("scroll", update);
        lenis.destroy();
        scroller.current = null;
        synchronize.current = null;
        pendingAnchor = null;
      };
    });
    initialActivation = false;
    return () => media.revert();
  }, []);

  useEffect(() => {
    if (scroller.current) stopInertia(scroller.current);
    scroller.current?.resize();
    synchronize.current?.();
  }, [pathname]);

  return null;
}
