"use client";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/src/context/CartContext";
import { Icon } from "./Icon";

export function Header() {
  const [open, setOpen] = useState(false);
  const { totalItems } = useCart();
  const links = ["Home", "Products", "About", "Contact"];
  const getHref = (link: string) => link === "Home" ? "/" : link === "Products" ? "/products" : `/#${link.toLowerCase()}`;
  return <header className="relative z-20 border-b border-[var(--line)] bg-white/95 backdrop-blur"><div className="section-shell flex h-[72px] items-center justify-between"><Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}><span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--green)] text-white"><Icon name="leaf" size={20} /></span><span className="text-[22px] font-bold tracking-[-0.04em] text-[var(--navy)]">thaza<span className="text-[var(--green)]">.</span></span></Link><nav className="hidden items-center gap-9 text-[13px] font-semibold text-slate-500 md:flex">{links.map((link, index) => <Link key={link} className={index === 0 ? "text-[var(--navy)]" : "transition-colors hover:text-[var(--green)]"} href={getHref(link)}>{link}</Link>)}</nav><div className="flex items-center gap-3"><Link href="/cart" aria-label="Shopping cart" className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[var(--line)] text-[var(--navy)] transition-colors hover:border-[var(--green)] hover:text-[var(--green)]"><Icon name="cart" size={19} /><span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--green)] text-[10px] font-bold text-white">{totalItems}</span></Link><button aria-label={open ? "Close menu" : "Open menu"} className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--navy)] text-white md:hidden" onClick={() => setOpen(!open)}><Icon name={open ? "x" : "menu"} size={19} /></button></div></div>{open && <nav className="absolute left-0 right-0 top-[72px] border-b border-[var(--line)] bg-white px-8 py-5 shadow-lg md:hidden">{links.map((link) => <Link key={link} className="block border-b border-slate-100 py-3 text-sm font-semibold text-[var(--navy)] last:border-0" href={getHref(link)} onClick={() => setOpen(false)}>{link}</Link>)}</nav>}</header>;
}