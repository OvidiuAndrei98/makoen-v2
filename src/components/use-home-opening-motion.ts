"use client";

import { useLayoutEffect, type RefObject } from "react";
import gsap from "gsap";

/** A short entrance leaves every service available in the normal page flow. */
export default function useHomeOpeningMotion(ref: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;
    const media = gsap.matchMedia(root);
    media.add("(prefers-reduced-motion: no-preference)", () => {
      if (window.scrollY > 12 || window.location.hash) return;
      const entrance = gsap.timeline({ defaults: { ease: "power3.out" } })
        .fromTo(".opening-title-line", { yPercent: 110 }, { yPercent: 0, duration: .6, stagger: .07 }, 0)
        .fromTo(".opening-photo-enter", { scale: 1.025 }, { scale: 1, duration: .8 }, 0)
        .fromTo(".opening-copy-follow", { y: 12, opacity: .2 }, { y: 0, opacity: 1, duration: .5 }, .15);
      const finish = () => { if (window.scrollY > 12) entrance.progress(1).pause(); };
      window.addEventListener("scroll", finish, { passive: true });
      return () => window.removeEventListener("scroll", finish);
    });
    return () => media.revert();
  }, [ref]);
}
