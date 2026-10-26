"use client";

import { useEffect, useRef, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

type Sequence = {
  element: HTMLElement;
  timeline: gsap.core.Timeline | null;
  trigger: ScrollTrigger | null;
  extras: gsap.core.Timeline[];
  extraTriggers: ScrollTrigger[];
  cards: Set<HTMLElement>;
  playFrame: number;
  started: boolean;
  completed: boolean;
  play: () => void;
  finish: () => void;
};

/** One owner for presentation sections; hero and interactive layers are excluded. */
export default function useSiteChoreography(ref: RefObject<HTMLElement | null>) {
  const readSections = useRef(new WeakSet<HTMLElement>());
  const readCards = useRef(new WeakSet<HTMLElement>());

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const main = root.querySelector<HTMLElement>("main") ?? root;
    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia(main);
    media.add({
      motion: "(prefers-reduced-motion: no-preference)",
      reduced: "(prefers-reduced-motion: reduce)",
      mobile: "(max-width: 800px)",
    }, context => {
      const groups = new Map<HTMLElement, Sequence>();
      const registeredCards = new WeakSet<HTMLElement>();
      const mobile = !!context.conditions?.mobile;
      let disposed = false;
      let scanFrame = 0;
      let refreshFrame = 0;
      let refreshTimer = 0;
      let previousY = scrollY;
      const reduced = !context.conditions?.motion || !!context.conditions.reduced;
      const owns = (element: HTMLElement, group: HTMLElement) => {
        let owner = element.closest<HTMLElement>("[data-choreography]");
        if (!mobile && owner?.dataset.choreography === "event-card") owner = owner.parentElement?.closest<HTMLElement>("[data-choreography]") ?? null;
        return owner === group;
      };
      const targets = (group: HTMLElement, selector: string) => Array.from(group.querySelectorAll<HTMLElement>(selector))
        .filter(element => owns(element, group) && element.getClientRects().length > 0);
      const anchorTargets = (group: HTMLElement) => {
        if (!location.hash) return false;
        try {
          const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
          return !!target && (target === group || group.contains(target));
        } catch { return false; }
      };
      const scheduleRefresh = () => {
        clearTimeout(refreshTimer);
        refreshTimer = window.setTimeout(() => {
          cancelAnimationFrame(refreshFrame);
          refreshFrame = requestAnimationFrame(() => { if (!disposed) ScrollTrigger.refresh(); });
        }, 120);
      };

      const addCards = (sequence: Sequence) => {
        if (sequence.element.dataset.choreography !== "catalog") return;
        const container = sequence.element.querySelector<HTMLElement>("[data-choreo-cards]");
        if (!container) return;
        const cards = Array.from(container.children).filter((element): element is HTMLElement =>
          element instanceof HTMLElement && element.matches(".shop-product-card") && element.getClientRects().length > 0
          && !registeredCards.has(element));
        cards.forEach(card => { registeredCards.add(card); sequence.cards.add(card); });
        const unread = cards.filter(card => !readCards.current.has(card));
        if (!unread.length || reduced) return;
        const vars = { y: 0, opacity: 1, duration: mobile ? .44 : .52, stagger: mobile ? .06 : .07, ease: "power3.out" };
        if (!sequence.started && sequence.timeline) {
          sequence.timeline.fromTo(unread, { y: mobile ? 18 : 28, opacity: .65 }, vars, .1);
          return;
        }
        // Late catalog responses animate only the new cards, never a read heading.
        const timeline = gsap.timeline({ paused: true }).fromTo(unread, { y: mobile ? 18 : 28, opacity: .65 }, vars);
        sequence.extras.push(timeline);
        const complete = () => {
          unread.forEach(card => readCards.current.add(card));
          timeline.progress(1).pause();
        };
        const bounds = container.getBoundingClientRect();
        if (bounds.bottom <= 0 || anchorTargets(sequence.element) || readSections.current.has(sequence.element) && bounds.top < 0) {
          complete();
        } else if (bounds.top <= innerHeight * .9) {
          unread.forEach(card => readCards.current.add(card));
          timeline.play();
        } else {
          sequence.extraTriggers.push(ScrollTrigger.create({
            trigger: container, start: "top 90%", end: "bottom top", once: true,
            onEnter: () => { unread.forEach(card => readCards.current.add(card)); timeline.play(); },
            onLeave: complete, onEnterBack: complete,
          }));
        }
      };

      const register = (group: HTMLElement) => {
        if (groups.has(group) || group.closest(".home-opening,[data-presentation]")) return;
        if (!mobile && group.dataset.choreography === "event-card") { group.dataset.choreographyState = "complete"; return; }
        const bounds = group.getBoundingClientRect();
        const wasRead = readSections.current.has(group) || bounds.bottom <= 0
          || scrollY > 12 && bounds.top < innerHeight * .15 || anchorTargets(group);
        const markRead = () => {
          readSections.current.add(group);
          if (!mobile && group.dataset.choreography === "event-pair") {
            group.querySelectorAll<HTMLElement>('[data-choreography="event-card"]').forEach(card => readSections.current.add(card));
          }
        };
        const sequence: Sequence = {
          element: group, timeline: null, trigger: null, extras: [], extraTriggers: [], cards: new Set(), playFrame: 0,
          started: reduced || wasRead, completed: reduced || wasRead,
          play: () => {
            if (sequence.started || sequence.playFrame) return;
            sequence.playFrame = requestAnimationFrame(() => {
              sequence.playFrame = 0;
              if (disposed || !group.isConnected) return;
              sequence.started = true;
              markRead();
              sequence.cards.forEach(card => readCards.current.add(card));
              group.dataset.choreographyState = "running";
              sequence.timeline?.play();
            });
          },
          finish: () => {
            cancelAnimationFrame(sequence.playFrame);
            sequence.playFrame = 0;
            sequence.started = true;
            sequence.completed = true;
            markRead();
            sequence.cards.forEach(card => readCards.current.add(card));
            sequence.timeline?.progress(1).pause();
            sequence.extras.forEach(timeline => timeline.progress(1).pause());
            sequence.trigger?.kill();
            sequence.extraTriggers.forEach(trigger => trigger.kill());
            group.dataset.choreographyState = "complete";
          },
        };
        groups.set(group, sequence);
        if (reduced || wasRead) {
          if (bounds.top < innerHeight) markRead();
          group.dataset.choreographyState = "complete";
          addCards(sequence);
          return;
        }

        group.dataset.choreographyState = "waiting";
        const images = targets(group, "[data-choreo-media]");
        const headings = targets(group, "[data-choreo-heading]");
        const lines = targets(group, "[data-choreo-line]");
        const items = targets(group, "[data-choreo-item]");
        const captions = targets(group, "[data-choreo-caption]");
        const pair = group.dataset.choreography === "event-pair" || group.dataset.choreography === "event-card";
        const timeline = gsap.timeline({ paused: true, defaults: { ease: "power3.out" }, onComplete: () => {
          sequence.completed = true;
          group.dataset.choreographyState = "complete";
        } });
        sequence.timeline = timeline;
        if (images.length) timeline.fromTo(images, { clipPath: "inset(100% 0 0 0)" }, {
          clipPath: "inset(0% 0% 0% 0%)", duration: pair ? mobile ? .54 : .78 : mobile ? .5 : .66,
          stagger: pair ? mobile ? .08 : .1 : 0,
        }, 0);
        if (headings.length) timeline.fromTo(headings, { yPercent: 105 }, { yPercent: 0, duration: mobile ? .42 : .52, stagger: .045 }, .035);
        if (lines.length) timeline.fromTo(lines, { scaleX: 0, transformOrigin: "left center" }, { scaleX: 1, duration: mobile ? .4 : .5 }, .08);
        if (items.length) timeline.fromTo(items, { y: mobile ? 16 : 24, opacity: .65 }, {
          y: 0, opacity: 1, duration: mobile ? .36 : .44, stagger: mobile ? .04 : .06,
        }, .12);
        if (captions.length) timeline.fromTo(captions, { y: mobile ? 12 : 18, opacity: .65 }, {
          y: 0, opacity: 1, duration: mobile ? .3 : .42, stagger: mobile ? .08 : .1,
        }, mobile ? .25 : .32);
        addCards(sequence);
        if (!timeline.duration()) { sequence.finish(); return; }
        sequence.trigger = ScrollTrigger.create({
          trigger: group, start: "top 88%", end: "bottom top", once: true,
          onEnter: () => sequence.play(), onLeave: () => sequence.finish(),
          onEnterBack: () => sequence.finish(), onLeaveBack: () => { if (sequence.started) sequence.finish(); },
        });
        // Includes sections already inside the viewport at initialization.
        if (bounds.top <= innerHeight * .88) sequence.play();
      };

      const scan = context.add("scan", () => {
        if (disposed) return;
        main.querySelectorAll<HTMLElement>("[data-choreography]").forEach(group => {
          register(group);
          const sequence = groups.get(group);
          if (sequence) addCards(sequence);
        });
      });
      scan();
      const observer = new MutationObserver(() => {
        cancelAnimationFrame(scanFrame);
        scanFrame = requestAnimationFrame(() => { if (!disposed) { scan(); scheduleRefresh(); } });
      });
      observer.observe(main, { subtree: true, childList: true });
      let lastWidth = main.getBoundingClientRect().width;
      let lastHeight = main.getBoundingClientRect().height;
      const layout = new ResizeObserver(() => {
        const bounds = main.getBoundingClientRect();
        if (Math.abs(bounds.width - lastWidth) < .5 && Math.abs(bounds.height - lastHeight) < .5) return;
        lastWidth = bounds.width;
        lastHeight = bounds.height;
        // A disclosure may resize on every frame: refresh only after it settles.
        scheduleRefresh();
      });
      layout.observe(main);
      const onScroll = () => {
        const jump = Math.abs(scrollY - previousY) > innerHeight * .6;
        previousY = scrollY;
        groups.forEach(sequence => {
          const bounds = sequence.element.getBoundingClientRect();
          if (bounds.bottom <= 0 || jump && bounds.top < innerHeight) sequence.finish();
        });
      };
      const onInteraction = (event: Event) => {
        const target = event.target as Element | null;
        let group = target?.closest<HTMLElement>("[data-choreography]");
        while (group && !groups.has(group)) group = group.parentElement?.closest<HTMLElement>("[data-choreography]");
        if (group && (event.type === "focusin" || target?.closest("button,a,input,select,textarea"))) groups.get(group)?.finish();
      };
      const onPageShow = (event: PageTransitionEvent) => {
        if (event.persisted) groups.forEach(sequence => { if (sequence.element.getBoundingClientRect().top < innerHeight) sequence.finish(); });
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("pageshow", onPageShow);
      main.addEventListener("focusin", onInteraction);
      main.addEventListener("pointerdown", onInteraction);
      document.fonts.ready.then(() => { if (!disposed) scheduleRefresh(); });
      return () => {
        disposed = true;
        observer.disconnect();
        layout.disconnect();
        cancelAnimationFrame(scanFrame);
        cancelAnimationFrame(refreshFrame);
        clearTimeout(refreshTimer);
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("pageshow", onPageShow);
        main.removeEventListener("focusin", onInteraction);
        main.removeEventListener("pointerdown", onInteraction);
        groups.forEach(sequence => {
          cancelAnimationFrame(sequence.playFrame);
          sequence.element.dataset.choreographyState = "complete";
        });
      };
    });
    return () => media.revert();
  }, [ref]);
}
