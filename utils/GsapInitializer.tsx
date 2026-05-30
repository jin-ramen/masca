'use client';

import { useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { CustomEase } from 'gsap/CustomEase';
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(DrawSVGPlugin, ScrollTrigger, CustomEase);

export default function GsapInitializer() {
  useLayoutEffect(() => {
    CustomEase.create("entranceEase", "0.22, 1, 0.36, 1");
  }, []);

  return null;
}

gsap.registerEffect({
  name: "writeInOnScroll",
  effect: (target: gsap.TweenTarget, config: gsap.TweenVars) => {
    const { trigger, ...options } = config

    return gsap.fromTo(target, {
      drawSVG: "0%",
    }, {
      drawSVG: "100%",
      duration: 0.3,
      stagger: 0.25,
      ease: "power1.out",
      scrollTrigger: {
        trigger,
        start: "top 80%",
      },
      ...options,
    })
  }
})
