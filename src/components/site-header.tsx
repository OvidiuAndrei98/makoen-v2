"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, ShoppingBag } from "lucide-react";
import { CartButton, useCart } from "./cart-provider";
import BrandLogo from "./brand-logo";
import useDialogMotion from "./use-dialog-motion";
import { legal } from "@/lib/legal";
const mainLinks = [
  { label: "Cafeaua ta", href: "/cafea-pentru-birouri" },
  { label: "Pauza ta de hidratare", href: "/apa" },
  { label: "Prăjitoria ta", href: "/cafea" },
  { label: "Evenimentul tău", href: "/cafea-la-evenimente" },
  { label: "Despre Makeon", href: "/#despre" },
];
const extraLinks = [
  { label: "Filtre și mentenanță", href: "/apa#filtre" },
  { label: "Prăjire și blenduri", href: "/cafea-pentru-birouri#servicii" },
];
function MenuMark() {
  return <span className="menu-mark" aria-hidden="true"><span /><span /></span>;
}
export default function SiteHeader({ onOffer, sectionBase = "/" }: {
  onOffer?: () => void;
  sectionBase?: "/" | "/apa" | "/cafea-pentru-birouri" | "/cafea-la-evenimente";
}) {
  const pathname = usePathname();
  const { count, open: openCart } = useCart();
  const [mobileMenu, setMobileMenu] = useState(false);
  const menu = useRef<HTMLDialogElement>(null);
  const afterClose = useRef<"offer" | "cart" | null>(null);
  useDialogMotion(menu, mobileMenu, "menu");
  useEffect(() => { afterClose.current = null; setMobileMenu(false); }, [pathname]);
  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1280px)");
    const close = () => { if (desktop.matches) { afterClose.current = null; setMobileMenu(false); } };
    desktop.addEventListener("change", close);
    return () => desktop.removeEventListener("change", close);
  }, []);
  const current = (href: string) => href === pathname || (href === "/cafea" && pathname.startsWith("/cafea/"));
  return <header className="header site-header-modern">
    <a className="site-skip-link" href="#main-content">Sari la conținut</a><BrandLogo priority />
    <nav className="desktop-nav" aria-label="Navigație principală">{mainLinks.map(link => <Link key={link.href} href={link.href} aria-current={current(link.href) ? "page" : undefined}>{link.label}</Link>)}</nav>
    <div className="header-actions"><CartButton />
      {onOffer ? <button className="offer-button" onClick={onOffer}>Cere ofertă<ArrowUpRight size={17} aria-hidden="true" /></button> : <Link className="offer-button" href={`${sectionBase}#abonamente`}>Cere ofertă<ArrowUpRight size={17} aria-hidden="true" /></Link>}
      <button type="button" className="menu-button" aria-label={mobileMenu ? "Închide meniul" : "Deschide meniul"} aria-expanded={mobileMenu} aria-controls="mobile-navigation" onClick={() => setMobileMenu(value => !value)}><MenuMark /></button>
    </div>
    <dialog ref={menu} className="mobile-menu-dialog modern-mobile-menu" aria-label="Meniul Makeon" onCancel={event => { event.preventDefault(); setMobileMenu(false); }}
      onClose={() => { setMobileMenu(false); const action = afterClose.current; afterClose.current = null; if (action === "offer") onOffer?.(); if (action === "cart") { document.querySelector<HTMLButtonElement>(".header-actions .cart-button")?.focus({ preventScroll: true }); openCart(); } }}>
      <div className="mobile-menu-top"><BrandLogo /><div className="mobile-menu-controls"><button type="button" className="cart-button" aria-label={`Deschide coșul de cafea (${count})`} onClick={() => { afterClose.current = "cart"; setMobileMenu(false); }}><ShoppingBag size={19} aria-hidden="true" /><span>{count}</span></button><button type="button" className="mobile-menu-close" aria-label="Închide meniul" aria-expanded={mobileMenu} aria-controls="mobile-navigation" onClick={() => setMobileMenu(false)} autoFocus><MenuMark /></button></div></div>
      <nav id="mobile-navigation" className="mobile-menu-nav" aria-label="Navigație mobilă">{mainLinks.map(link => <Link className="mobile-menu-link" key={link.href} href={link.href} aria-current={current(link.href) ? "page" : undefined} onClick={() => setMobileMenu(false)}>{link.label}<ArrowUpRight size={22} aria-hidden="true" /></Link>)}
        <div className="mobile-secondary-links">{extraLinks.map(link => <Link key={link.href} href={link.href} onClick={() => setMobileMenu(false)}>{link.label}</Link>)}</div>
      </nav>
      <div className="mobile-menu-bottom">{onOffer ? <button type="button" className="mobile-offer-button" onClick={() => { afterClose.current = "offer"; setMobileMenu(false); }}>Cere ofertă<ArrowUpRight size={18} /></button> : <Link className="mobile-offer-button" href="/#abonamente" onClick={() => setMobileMenu(false)}>Cere ofertă<ArrowUpRight size={18} /></Link>}<a href={legal.phoneHref}>{legal.phone}</a></div>
    </dialog>
  </header>;
}
