"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Droplet, Heart, CheckCircle2 } from "lucide-react";

export function TextManifesto() {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const el = textRef.current;
    if (!el) return;

    const words = el.querySelectorAll(".manifesto-word");

    // Word by word illumination as the user scrolls through
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top 75%",
        end: "bottom 45%",
        scrub: 0.8,
      },
    });

    tl.to(words, {
      opacity: 1,
      color: "#FFFFFF",
      filter: "blur(0px)",
      stagger: 0.05,
      ease: "power1.out",
    });

    return () => {
      tl.kill();
      ScrollTrigger.getAll().forEach((st) => {
        if (st.vars.trigger === containerRef.current) st.kill();
      });
    };
  }, []);

  const manifestoParagraph =
    "Most reminder apps fail because they interrupt your workflow with noisy notifications you end up closing. Water Buddy is different — a silent, delightful desktop presence that respects your focus and turns drinking water into an effortless habit.";

  const words = manifestoParagraph.split(" ");

  return (
    <section
      ref={containerRef}
      className="relative z-10 w-full py-16 sm:py-24 max-w-4xl mx-auto text-center"
    >
      <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-[#0C141F]/80 px-4 py-1.5 text-xs font-mono text-[#38BDF8] mb-8">
        <Droplet className="w-3.5 h-3.5 text-[#38BDF8]" />
        <span>BUILT DIFFERENTLY</span>
      </div>

      <p
        ref={textRef}
        className="text-2xl sm:text-4xl md:text-5xl font-semibold leading-relaxed tracking-tight text-slate-600 transition-colors"
      >
        {words.map((word, i) => (
          <span
            key={i}
            className="manifesto-word inline-block mr-2.5 transition-all duration-300 opacity-25 filter blur-[0.5px]"
          >
            {word}
          </span>
        ))}
      </p>

      {/* Human benefits badges */}
      <div className="flex flex-wrap items-center justify-center gap-6 mt-12 text-xs font-mono text-slate-400">
        <div className="flex items-center gap-2 bg-[#0C141F]/60 px-3.5 py-1.5 rounded-full border border-white/5">
          <CheckCircle2 className="w-4 h-4 text-[#34D399]" />
          <span>Zero desktop notification banners</span>
        </div>
        <div className="flex items-center gap-2 bg-[#0C141F]/60 px-3.5 py-1.5 rounded-full border border-white/5">
          <CheckCircle2 className="w-4 h-4 text-[#34D399]" />
          <span>No phone alerts to dismiss</span>
        </div>
        <div className="flex items-center gap-2 bg-[#0C141F]/60 px-3.5 py-1.5 rounded-full border border-white/5">
          <Heart className="w-4 h-4 text-[#38BDF8]" />
          <span>Keeps your energy steady all afternoon</span>
        </div>
      </div>
    </section>
  );
}

export default TextManifesto;
