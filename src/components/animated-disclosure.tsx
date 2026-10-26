"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import gsap from "gsap";

/** Measured layout motion, retargeted from its current height on interruption. */
export default function AnimatedDisclosure({
  id, title, open, onToggle, children, className = "", headingLevel = 3,
  triggerId = `${id}-trigger`, panelId = `${id}-content`, compact = false,
}: {
  id: string; title: string; open: boolean; onToggle: () => void; children: ReactNode;
  className?: string; headingLevel?: 2 | 3; triggerId?: string; panelId?: string; compact?: boolean;
}) {
  const button = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const animation = useRef<gsap.core.Timeline | null>(null);
  const initialized = useRef(false);
  const [visible, setVisible] = useState(open);
  const [accessible, setAccessible] = useState(open);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useLayoutEffect(() => {
    const area = panel.current;
    const inner = content.current;
    if (!area || !inner) return;
    animation.current?.kill();
    const finish = () => {
      gsap.set(area, { height: open ? "auto" : 0, overflow: open ? "visible" : "hidden" });
      gsap.set(inner, { opacity: open ? 1 : 0, y: open ? 0 : 8 });
      area.hidden = !open;
      setVisible(open);
      setAccessible(open);
    };
    if (!open && area.contains(document.activeElement)) button.current?.focus({ preventScroll: true });
    if (!initialized.current || reducedMotion || window.matchMedia("(prefers-reduced-motion: reduce)").matches || (!open && area.hidden)) {
      initialized.current = true;
      finish();
      return;
    }

    let measuredHeight = -1;
    const animate = () => {
      animation.current?.kill();
      const wasHidden = area.hidden;
      const from = wasHidden ? 0 : area.getBoundingClientRect().height;
      area.hidden = false;
      setVisible(true);
      if (!open) setAccessible(false);
      if (wasHidden) gsap.set(inner, { opacity: 0, y: 8 });
      measuredHeight = inner.getBoundingClientRect().height;
      gsap.set(area, { height: from, overflow: "hidden" });
      animation.current = gsap.timeline({ defaults: { ease: "power3.out" }, onComplete: finish })
        .to(area, { height: open ? measuredHeight : 0, duration: open ? .36 : .24 }, 0)
        .to(inner, { opacity: open ? 1 : 0, y: open ? 0 : 8, duration: open ? .26 : .16 }, open ? .03 : 0);
    };
    animate();
    const observer = new ResizeObserver(() => {
      if (open && animation.current?.isActive() && Math.abs(inner.getBoundingClientRect().height - measuredHeight) > .5) animate();
    });
    observer.observe(inner);
    return () => { observer.disconnect(); animation.current?.kill(); };
  }, [open, reducedMotion]);

  const Heading = headingLevel === 2 ? "h2" : "h3";
  return <div className={`makeon-disclosure${compact ? " is-compact" : ""} ${className}`} id={id} data-state={open ? "open" : "closed"}>
    <Heading className="makeon-disclosure-heading">
      <button ref={button} type="button" className="makeon-disclosure-trigger" id={triggerId} aria-expanded={open} aria-controls={panelId} onClick={onToggle}>
        <span>{title}</span><span className="makeon-disclosure-indicator" aria-hidden="true" />
      </button>
    </Heading>
    <div ref={panel} className="makeon-disclosure-panel" id={panelId} role="region" aria-labelledby={triggerId} aria-hidden={!open} inert={!open || !accessible} hidden={!visible}>
      <div ref={content} className="makeon-disclosure-content">{children}</div>
    </div>
  </div>;
}
