"use client";

import { useEffect, type RefObject } from "react";
import gsap from "gsap";

const enteredHeroes = new Set<string>();

/** Service entrances own only their explicit media, type and action layers. */
export default function usePresentationEntrance(ref: RefObject<HTMLElement | null>, kind: "service" | "events" = "service") {
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const media = gsap.matchMedia(root);
    media.add({
      motion: "(prefers-reduced-motion: no-preference)",
      reduced: "(prefers-reduced-motion: reduce)",
      mobile: "(max-width: 800px)",
    }, context => {
      root.dataset.presentationState = "complete";
      const variant = root.dataset.presentation || (root.matches(".water-intro") ? "water" : root.matches(".event-intro") || kind === "events" ? "events" : "coffee");
      const key = `${location.pathname}:${variant}`;
      if (!context.conditions?.motion || context.conditions?.reduced) {
        if (root.getBoundingClientRect().top < innerHeight) enteredHeroes.add(key);
        return;
      }
      const mobile = !!context.conditions.mobile;
      // A restored position or anchor must never wait for the top-of-page scene.
      if (enteredHeroes.has(key) || scrollY > 12 || location.hash) return;

      const frames = Array.from(root.querySelectorAll<HTMLElement>("[data-presentation-media]"));
      const products = Array.from(root.querySelectorAll<HTMLElement>("[data-presentation-product]"));
      const lines = Array.from(root.querySelectorAll<HTMLElement>("[data-presentation-line]"));
      const copy = Array.from(root.querySelectorAll<HTMLElement>("[data-presentation-copy]"));
      const actions = Array.from(root.querySelectorAll<HTMLElement>("[data-presentation-actions]"));
      if (!frames.length && !lines.length) return;

      const timeline = gsap.timeline({ paused: true, defaults: { ease: "power3.out" }, onComplete: () => { root.dataset.presentationState = "complete"; } });
      if (frames.length) timeline.fromTo(frames,
        { clipPath: variant === "coffee" ? "inset(0 100% 0 0)" : "inset(100% 0 0 0)" },
        { clipPath: "inset(0% 0% 0% 0%)", duration: mobile ? .56 : .8 }, 0);
      if (products.length) timeline.fromTo(products, { y: mobile ? 28 : 44 }, { y: 0, duration: mobile ? .52 : .72 }, .02);
      if (lines.length) timeline.fromTo(lines, { y: mobile ? 24 : 36 }, { y: 0, duration: mobile ? .45 : .64, stagger: mobile ? .045 : .065 }, .025);
      if (copy.length) timeline.fromTo(copy, { y: mobile ? 10 : 16, opacity: .65 }, { y: 0, opacity: 1, duration: mobile ? .35 : .45, stagger: .045 }, mobile ? .1 : .13);
      if (actions.length) timeline.fromTo(actions, { y: mobile ? 10 : 14, opacity: .75 }, { y: 0, opacity: 1, duration: mobile ? .36 : .46 }, mobile ? .16 : .2);

      const finish = () => {
        enteredHeroes.add(key);
        timeline.progress(1).pause();
        root.dataset.presentationState = "complete";
      };
      const onScroll = () => { if (scrollY > 12) finish(); };
      const onPageShow = (event: PageTransitionEvent) => { if (event.persisted) finish(); };
      const onPointer = (event: PointerEvent) => { if ((event.target as Element | null)?.closest("button,a,input,select,textarea")) finish(); };
      // Waiting one frame avoids marking a reverted Strict Mode setup as played.
      const frame = requestAnimationFrame(() => {
        if (!root.isConnected || scrollY > 12 || location.hash) { finish(); return; }
        enteredHeroes.add(key);
        root.dataset.presentationState = "running";
        timeline.play();
      });
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("pageshow", onPageShow);
      root.addEventListener("focusin", finish);
      root.addEventListener("pointerdown", onPointer);
      return () => {
        cancelAnimationFrame(frame);
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("pageshow", onPageShow);
        root.removeEventListener("focusin", finish);
        root.removeEventListener("pointerdown", onPointer);
        root.dataset.presentationState = "complete";
      };
    });
    return () => media.revert();
  }, [ref, kind]);
}
