"use client";

import { useEffect, useRef, type RefObject } from "react";
import gsap from "gsap";

/**
 * Animate native dialogs while preserving their focus trap and top-layer behavior.
 * Close only after the exit animation and restore the previous body scroll style.
 * Pointer opens suppress the autofocus ring; keyboard use restores visible focus.
 */
export default function useDialogMotion(
  ref: RefObject<HTMLDialogElement | null>,
  opened: boolean,
  kind: "menu" | "cart",
) {
  const previousOverflow = useRef<string | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const restore = () => {
      if (previousOverflow.current !== null) {
        document.body.style.overflow = previousOverflow.current;
        previousOverflow.current = null;
      }
    };
    const timeline = gsap.timeline();
    const keyboardFocus = () => {
      el.dataset.keyboardFocus = "true";
    };
    const pointerFocus = () => {
      el.dataset.keyboardFocus = "false";
    };
    if (opened) {
      const entering = !el.open;
      if (!el.open) {
        previousOverflow.current = document.body.style.overflow;
        // Native dialogs mark autofocus as focus-visible even after a tap.
        el.dataset.keyboardFocus = String(
          document.activeElement?.matches(":focus-visible") ?? false,
        );
        el.showModal();
      }
      el.addEventListener("keydown", keyboardFocus);
      el.addEventListener("pointerdown", pointerFocus);
      document.body.style.overflow = "hidden";
      if (kind === "menu") {
        // Keep the top-row controls in the same position as the header.
        // Retarget the current values when an opening/closing is interrupted.
        if (entering) {
          el.dataset.menuRevealed = "false";
          gsap.set(el, { opacity: 0, clearProps: "transform" });
          gsap.set(el.querySelectorAll(".mobile-menu-link,.mobile-menu-bottom"), { y: reduced ? 0 : 12, opacity: .5 });
          el.getBoundingClientRect();
        }
        el.dataset.menuRevealed = "true";
        timeline
          .to(
            el,
            { opacity: 1, "--menu-backdrop": .28, duration: reduced ? 0 : .2, ease: "power3.out" },
          )
          .to(
            el.querySelectorAll(".mobile-menu-link"),
            {
              y: 0,
              opacity: 1,
              duration: reduced ? 0 : .26,
              stagger: reduced ? 0 : .025,
              ease: "power3.out",
            },
            0,
          )
          .to(
            el.querySelector(".mobile-menu-bottom"),
            { y: 0, opacity: 1, duration: reduced ? 0 : .26, ease: "power3.out" },
            reduced ? 0 : .08,
          );
      } else {
        timeline.fromTo(
          el,
          { xPercent: 100, "--overlay-opacity": 0 },
          {
            xPercent: 0,
            "--overlay-opacity": 0.48,
            duration: reduced ? 0 : 0.36,
            ease: "power3.out",
          },
        );
      }
    } else if (el.open) {
      if (kind === "menu") el.dataset.menuRevealed = "false";
      timeline.to(
        el,
        kind === "menu"
          ? {
              opacity: 0,
              "--menu-backdrop": 0,
              duration: reduced ? 0 : .25,
              ease: "power3.out",
              onComplete: () => {
                el.close();
                restore();
              },
            }
          : {
              xPercent: 100,
              "--overlay-opacity": 0,
              duration: reduced ? 0 : 0.32,
              ease: "power3.in",
              onComplete: () => {
                el.close();
                restore();
              },
            },
      );
    }
    return () => {
      timeline.kill();
      el.removeEventListener("keydown", keyboardFocus);
      el.removeEventListener("pointerdown", pointerFocus);
    };
  }, [opened, kind, ref]);
  useEffect(
    () => () => {
      ref.current?.close();
      if (previousOverflow.current !== null) {
        document.body.style.overflow = previousOverflow.current;
        previousOverflow.current = null;
      }
    },
    [ref],
  );
}
