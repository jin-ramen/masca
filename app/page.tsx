'use client'

import { gsap } from "gsap"
import { useGSAP } from "@gsap/react";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin"
import { MotionPathPlugin } from "gsap/MotionPathPlugin"

import TraceText from "@/components/TraceText";
import Button from "@/components/Button";

gsap.registerPlugin(DrawSVGPlugin, MotionPathPlugin)

export default function Home() {
  useGSAP(() => {
    gsap.fromTo(
      ".stroke",
      { drawSVG: 0 },
      { drawSVG: "100%", duration: 0.3, stagger: 0.25, ease: "none" }
    )
  })

  return (
    <section className="grid grid-rows-[1fr_auto_1fr] min-h-screen bg-blue-600">
      <div className="p-8 row-2 inline-flex md:grid md:grid-cols-2 md:gap-8">
         <div className="flex flex-col gap-6 justify-center md:col-1">
            <span className="eyebrow text-yellow-500">founded 2001 &middot; 6 states &middot; 1 territory</span>
            <h1 className="text-white">
               A home for <br/> Malaysians <br/> studying <TraceText />
            </h1>
            <p 
               className="text-gray-300"
            >
               MASCA is the peak student representative body for Malaysians across Australia — built by students, for students. Selamat datang, and welcome home.
            </p>
            <div className="flex gap-4">
               <Button
                  variant="accent"
               >
                  Become a Member <span>&rarr;</span>
               </Button>
               <Button 
                  variant="outline" 
                  className="text-white border-gray-300"
               >
                  See Whats On
               </Button>
            </div>
         </div>
      </div>
    </section>
  );
}
