"use client";

import { useLayoutEffect, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let entranceHasPlayed = false;

/** Entrance and scroll each own separate layers; the real offer controls stay mounted. */
export default function useHomeOpeningMotion(ref: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;
    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia(root);
    let disposed = false;
    let refreshFrame = 0;
    media.add({
      desktop: "(min-width:1280px) and (min-height:960px)",
      compact: "(max-width:1279px), (max-height:959px)",
      reduced: "(prefers-reduced-motion:reduce)",
    }, context => {
      const conditions = context.conditions as { desktop: boolean; compact: boolean; reduced: boolean };
      if (conditions.reduced) return;
      const stage = root.querySelector<HTMLElement>(".opening-stage")!;
      const atmosphere = root.querySelector<HTMLElement>(".opening-atmosphere")!;
      const offers = root.querySelector<HTMLElement>(".opening-services")!;
      let scene: gsap.core.Timeline | undefined;
      let sceneTrigger: ScrollTrigger | undefined;
      let entrance: gsap.core.Timeline | undefined;
      let entranceFrame = 0;
      const headerHeight = () => document.querySelector(".site-header-modern")?.getBoundingClientRect().height ?? 86;
      const remember = (trigger: ScrollTrigger) => {
        root.dataset.openingStart = String(trigger.start);
        root.dataset.openingEnd = String(trigger.end);
        root.dataset.openingProgress = String(trigger.progress);
      };

      if (conditions.desktop) {
        root.classList.add("is-scroll-scene");
        const fits = Array.from(root.querySelectorAll<HTMLElement>(".opening-offer-surface")).every(surface => {
          const article = surface.querySelector<HTMLElement>(".opening-service")!;
          return article.scrollHeight <= article.clientHeight + 2;
        });
        if (fits) {
          scene = gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: {
            id: "makeon-home-opening", trigger: root,
            start: () => `top top+=${headerHeight()}`,
            end: () => `+=${Math.round(innerHeight * .75)}`,
            scrub: true, invalidateOnRefresh: true, refreshPriority: 1,
            onRefresh: remember, onUpdate: remember,
          } });
          scene
            .fromTo(atmosphere, { clipPath:"inset(0 0% 0 0)" }, { clipPath:"inset(0 45% 0 0)", duration:.64 }, 0)
            .fromTo(".opening-photo-pan", { x:0 }, { x:() => -stage.clientWidth * .45 * .85, duration:.64 }, 0)
            .fromTo(offers, { clipPath:"inset(0 0 0 100%)" }, { clipPath:"inset(0 0 0 0%)", duration:.64 }, 0)
            .fromTo(".opening-service", { x:40, opacity:.15 }, { x:0, opacity:1, duration:.30, stagger:.10, ease:"power2.out" }, .18)
            .fromTo(".opening-product-scroll", { y:56 }, { y:0, duration:.38, stagger:.08, ease:"power3.out" }, .25)
            .to({}, { duration:.29 }, .71);
          sceneTrigger = scene.scrollTrigger;
          sceneTrigger?.refresh();
          if (sceneTrigger) remember(sceneTrigger);
        } else root.classList.remove("is-scroll-scene");
      }

      if (!entranceHasPlayed && scrollY <= 12 && !location.hash) {
        const mobile = innerWidth <= 800;
        entrance = gsap.timeline({ paused:true, defaults:{ ease:"power3.out" } })
          .fromTo(".opening-photo-enter", { scale:1.025 }, { scale:1, duration:mobile ? .6 : .8 }, 0)
          .fromTo(".opening-title-line", { yPercent:110 }, { yPercent:0, duration:mobile ? .48 : .65, stagger:.08 }, .04)
          .fromTo(".opening-description", { y:mobile ? 12 : 20 }, { y:0, duration:mobile ? .4 : .5 }, .18)
          .fromTo(".opening-copy-follow", { opacity:.2 }, { opacity:1, duration:mobile ? .4 : .5 }, .25);
        entranceFrame = requestAnimationFrame(() => {
          if (!root.isConnected) return;
          entranceHasPlayed = true;
          if (scrollY > 12 || location.hash) entrance?.progress(1).pause();
          else entrance?.play();
        });
      }
      const finishEntrance = () => { if (scrollY > 12) entrance?.progress(1).pause(); };
      const revealFocusedOffer = (event: FocusEvent) => {
        if (!sceneTrigger || !(event.target instanceof HTMLElement)
          || !event.target.closest(".opening-services") || !event.target.matches(":focus-visible")
          || sceneTrigger.progress >= .99) return;
        entrance?.progress(1).pause();
        window.scrollTo({ top:sceneTrigger.end, behavior:"instant" });
        sceneTrigger.update();
        scene?.progress(1);
      };
      window.addEventListener("scroll", finishEntrance, { passive:true });
      root.addEventListener("focusin", revealFocusedOffer);
      return () => {
        cancelAnimationFrame(entranceFrame);
        window.removeEventListener("scroll", finishEntrance);
        root.removeEventListener("focusin", revealFocusedOffer);
        root.classList.remove("is-scroll-scene");
        delete root.dataset.openingStart;
        delete root.dataset.openingEnd;
        delete root.dataset.openingProgress;
      };
    });
    Promise.allSettled([document.fonts.ready, root.querySelector<HTMLImageElement>(".opening-photo-enter img")?.decode()]).then(() => {
      if (!disposed) refreshFrame = requestAnimationFrame(() => ScrollTrigger.refresh());
    });
    return () => { disposed = true; cancelAnimationFrame(refreshFrame); media.revert(); };
  }, [ref]);
}
