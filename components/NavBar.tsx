'use client'

import Image from "next/image";
import Link from "next/link"
import { usePathname } from "next/navigation"
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { useEffect, useRef, useState } from "react";
import Button from "./Button";

const navLinks = [
  { name: "Home", href: "/"},
  { name: "Events", href: "/events"},
  { name: "Welfare", href: "/care"},
  { name: "About", href: "/about"},
  { name: "Contact", href: "/contact"}
]

export default function NavBar() {
  const headerRef = useRef(null)
  const panelRef = useRef(null)
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href)

  // Close the mobile menu whenever the route changes. Adjusting state during
  // render with a previous-value guard (instead of in an effect) avoids the
  // cascading-render warning. https://react.dev/learn/you-might-not-need-an-effect
  const [prevPathname, setPrevPathname] = useState(pathname)
  if (pathname !== prevPathname) {
    setPrevPathname(pathname)
    setOpen(false)
  }

  // Close the mobile menu on Escape.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  // Lock background scroll while the full-screen menu is open.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [open])

  useGSAP(() => {
    gsap.to(headerRef.current, {
      backgroundColor: 'rgba(255,255,255,0.8)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      ease: 'entranceEase',
      scrollTrigger: {
        start: 80,
        end: 80,
        toggleActions: 'play none none reverse',
      },
    })
  }, { scope: headerRef })

  // Animate the mobile dropdown open/close.
  useGSAP(() => {
    if (!panelRef.current) return
    gsap.to(panelRef.current, {
      height: open ? window.innerHeight : 0,
      opacity: open ? 1 : 0,
      duration: 0.4,
      ease: "entranceEase",
    })
  }, { dependencies: [open] })


  return (
    <header ref={headerRef} className="fixed top-0 left-0 w-full z-50 grid grid-cols-[auto_auto_auto] py-4 px-6 md:px-16 bg-white">
      {/* Logo mobile + desktop */}
      <Link href="/" className="col-1 justify-self-start relative z-20">
        <div className="flex items-center gap-4">
          <Image src="/logo/logo.svg" alt="Masca logo" width={40} height={40} priority />
          <div className="flex flex-col leading-none">
            <span className="text-xl font-bold tracking-wider text-blue-600">MASCA</span>
            <span className="text-xs font-semibold text-gray-700/80 uppercase">malaysian students&apos; council</span>
          </div>
        </div>
      </Link>

      {/* mobile view — satay silhouette toggle (monochrome via CSS mask) */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "Close menu" : "Open menu"}
        className="col-3 justify-self-end lg:hidden p-2 -mr-2 relative z-20"
      >
        <span
          className={`block w-9 h-7 transition-colors ${open ? "bg-red-600" : "bg-blue-600"}`}
          style={{
            WebkitMask: "url(/satay.svg) center / contain no-repeat",
            mask: "url(/satay.svg) center / contain no-repeat",
          }}
        />
      </button>

      {/* desktop view */}
      <nav className="col-2 justify-self-center hidden lg:flex gap-8">
        {navLinks.map((link) => {
          const active = isActive(link.href)
          return (
            <Button
              key={link.name} href={link.href} variant="ghost"
              className={active ? "text-red-600 border-b-3 border-b-red-600" : "text-blue-600 border-0"}
            >
              {link.name}
            </Button>
          )
        })}   
      </nav>

      <div className="col-3 justify-self-end hidden lg:inline-flex gap-6">
        <Button
          href="/sign-in" variant="ghost"
          className={isActive("/sign-in") ? "text-red-600 border-b-3 border-b-red-600" : "text-blue-600 border-0"}
        >
          Sign In
        </Button>
        <Button href="/sign-up" variant="accent">
          Become a Member
        </Button>
      </div>

      {/* mobile full-screen menu */}
      <div
        id="mobile-menu"
        ref={panelRef}
        className="fixed inset-x-0 top-0 z-10 lg:hidden overflow-hidden bg-white/95 backdrop-blur-md"
        style={{ height: 0, opacity: 0 }}
      >
        <nav className="flex flex-col items-center justify-center gap-6 h-dvh px-6 text-center">
          {navLinks.map((link) => {
            const active = isActive(link.href)
            return (
              <Button
                key={link.name} href={link.href} variant="ghost"
                className={`text-3xl! ${active ? "text-red-600" : "text-blue-600"}`}
              >
                {link.name}
              </Button>
            )
          })}
          <Button
            href="/sign-in" variant="ghost"
            className={`text-3xl! ${isActive("/sign-in") ? "text-red-600" : "text-blue-600"}`}
          >
            Sign In
          </Button>
          <Button href="/sign-up" variant="accent" className="text-xl! px-8 py-4 mt-2">
            Become a Member
          </Button>
        </nav>
      </div>

    </header>
  )
}