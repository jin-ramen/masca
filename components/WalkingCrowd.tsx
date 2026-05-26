'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import Jin from '@/public/casts/Jin Hong.svg';
import Pei from '@/public/casts/Pei Wei.svg';

interface StaticImageData {
  src: string;
  height: number;
  width: number;
  blurDataURL?: string;
}

interface WalkerAsset {
  name: string;
  src: StaticImageData | string;
  // Optional per-peep nudge if one figure is drawn larger/smaller within its
  // own canvas (case 2 below). 1 = no change. e.g. 0.9 shrinks, 1.1 enlarges.
  scale?: number;
}

const walkerAssets: WalkerAsset[] = [
  { name: 'Jin Hong', src: Jin },
  { name: 'Pei Wei', src: Pei },
  // Add more peeps here as you export them:
  // { name: 'Aisha', src: Aisha, scale: 0.95 },
];

// Uniform TARGET HEIGHT for every walker. Sizing by height (not width) means
// peeps stand the same height regardless of each SVG's viewBox aspect ratio —
// which is what fixes "Pei is bigger than Jin". Width follows naturally.
const PEEP_HEIGHT = 360; // px

// Random vertical wobble per walker, on top of the layer's base y.
const Y_JITTER = 22; // px, +/-

// ── Depth layers, back -> front ─────────────────────────────────────────
// All walkers are the same height now. Depth comes from the vertical band
// each row sits in (`y`) plus z-index. Each layer runs its own spawn loop.
//
// y      : base vertical offset (more negative = higher = further back).
//          gaps between these values = gaps between rows.
// z      : stacking order (front covers back)
// target : concurrent walkers (density)
// spawn  : ms between spawns (lower = refills faster)
// dur    : [min,max] seconds to cross (lower = faster)
// gap    : spacing between walkers when prefilled, in peep-widths (<1 overlaps)
type Layer = {
  y: number;
  z: number;
  target: number;
  spawn: number;
  dur: [number, number];
  gap: number;
};

const LAYERS: Layer[] = [
  { y: -80, z: 10, target: 6, spawn: 2400, dur: [22, 32], gap: 1.0 },  // back
  { y: 0, z: 20, target: 9, spawn: 1400, dur: [14, 22], gap: 0.7 },  // mid
  { y: 120, z: 30, target: 16, spawn: 600, dur: [8, 14], gap: 0.42 },     // front
];

// Approx on-screen width a walker occupies, for overlap spacing math. Since
// we now size by height, exact widths vary per peep; this is a good-enough
// average for prefill spacing. Tune if your peeps are very wide/narrow.
const APPROX_PEEP_WIDTH = 300;

export default function WalkingCrowd() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      const container = containerRef.current;
      if (!container) return;

      const reduceMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;

      const intervals: ReturnType<typeof setInterval>[] = [];
      const counts = LAYERS.map(() => 0);

      const spawnWalker = (layerIdx: number, prefillProgress?: number) => {
        const layer = LAYERS[layerIdx];
        if (counts[layerIdx] >= layer.target) return;
        counts[layerIdx]++;

        const asset =
          walkerAssets[Math.floor(Math.random() * walkerAssets.length)];
        const direction: 'ltr' | 'rtl' = Math.random() > 0.2 ? 'ltr' : 'rtl';
        const duration = gsap.utils.random(layer.dur[0], layer.dur[1]);
        const yOffset = layer.y + gsap.utils.random(-Y_JITTER, Y_JITTER);

        // Per-peep optional scale correction (defaults to 1).
        const peepScale = asset.scale ?? 1;
        const h = PEEP_HEIGHT * peepScale;

        const walkerNode = document.createElement('div');
        walkerNode.className = 'absolute bottom-0 left-0 pointer-events-none';
        walkerNode.style.zIndex = String(layer.z);
        walkerNode.style.transform = `translateY(${yOffset}px)`;

        const imgSrc =
          typeof asset.src === 'string' ? asset.src : asset.src.src;

        // Sized by HEIGHT; width:auto keeps each peep's true proportions.
        walkerNode.innerHTML = `
          <div class="walker-move" style="display:inline-block; height:${h}px; will-change:transform;">
            <div class="walker-bob" style="will-change:transform; height:80%;">
              <img src="${imgSrc}" alt="${asset.name}"
                   loading="lazy" decoding="async"
                   style="height:100%; width:auto; display:block;" />
            </div>
          </div>
        `;
        container.appendChild(walkerNode);

        const moveTarget = walkerNode.querySelector(
          '.walker-move'
        ) as HTMLElement | null;
        const bobTarget = walkerNode.querySelector(
          '.walker-bob'
        ) as HTMLElement | null;
        if (!moveTarget || !bobTarget) {
          counts[layerIdx]--;
          return;
        }

        const faceScaleX = direction === 'rtl' ? -1 : 1;
        gsap.set(moveTarget, { scaleX: faceScaleX });

        const containerW = container.clientWidth;
        const offLeft = -APPROX_PEEP_WIDTH;
        const offRight = containerW + APPROX_PEEP_WIDTH;
        const fromX = direction === 'ltr' ? offLeft : offRight;
        const toX = direction === 'ltr' ? offRight : offLeft;

        gsap.set(moveTarget, { x: fromX });

        if (reduceMotion) {
          const frac = Math.random();
          gsap.set(moveTarget, { x: gsap.utils.interpolate(fromX, toX, frac) });
          return;
        }

        if (prefillProgress != null) {
          gsap.set(moveTarget, {
            x: gsap.utils.interpolate(fromX, toX, prefillProgress),
          });
        }

        const remaining = prefillProgress != null ? 1 - prefillProgress : 1;
        gsap.to(moveTarget, {
          x: toX,
          duration: duration * remaining,
          ease: 'none',
          onComplete: () => {
            walkerNode.remove();
            counts[layerIdx]--;
          },
        });

        gsap.to(bobTarget, {
          y: -10,
          rotation: gsap.utils.random(-2, 2),
          duration: gsap.utils.random(0.28, 0.4),
          yoyo: true,
          repeat: -1,
          ease: 'power1.inOut',
          transformOrigin: 'bottom center',
        });
      };

      LAYERS.forEach((layer, layerIdx) => {
        const containerW = container.clientWidth;
        const step =
          (APPROX_PEEP_WIDTH * layer.gap) / (containerW + APPROX_PEEP_WIDTH * 2);
        for (let i = 0; i < layer.target; i++) {
          const progress = Math.min(0.98, i * step + Math.random() * step * 0.5);
          spawnWalker(layerIdx, progress);
        }
      });

      if (reduceMotion) return;

      LAYERS.forEach((_, layerIdx) => {
        const id = setInterval(
          () => spawnWalker(layerIdx),
          LAYERS[layerIdx].spawn
        );
        intervals.push(id);
      });

      // Pause spawning + animation when the banner is off-screen (perf/battery).
      const io = new IntersectionObserver(
        ([entry]) => {
          const tweens = gsap.getTweensOf(
            container.querySelectorAll('.walker-move, .walker-bob')
          );
          if (entry.isIntersecting) tweens.forEach((t) => t.play());
          else tweens.forEach((t) => t.pause());
        },
        { threshold: 0 }
      );
      io.observe(container);

      return () => {
        intervals.forEach(clearInterval);
        io.disconnect();
      };
    },
    { scope: containerRef }
  );

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[500px] bg-[#FFFEF8] overflow-hidden"
    />
  );
}