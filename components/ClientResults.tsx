"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState } from "react";

export const clientResults = [
  { id: 1, images: ["/images/results/client-1-1.jpg", "/images/results/client-1-2.jpg"] },
  { id: 2, images: ["/images/results/client-2-1.jpg", "/images/results/client-2-2.jpg", "/images/results/client-2-3.jpg"] },
  { id: 3, images: ["/images/results/client-3-1.jpg", "/images/results/client-3-2.jpg", "/images/results/client-3-3.jpg"] },
  { id: 4, images: ["/images/results/client-4-1.jpg"] },
  { id: 5, images: ["/images/results/client-5-1.jpg"] },
  { id: 6, images: ["/images/results/client-6-1.jpg"] },
];

function ClientCard({ result }: { result: typeof clientResults[number] }) {
  const [active, setActive] = useState(0);
  const touchStart = useRef<number | null>(null);
  const hasGallery = result.images.length > 1;
  const move = (direction: -1 | 1) => setActive((current) => (current + direction + result.images.length) % result.images.length);
  const photoArrow = "grid h-11 w-11 shrink-0 place-items-center rounded-full text-white transition-colors hover:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white";

  return <article className="relative h-[480px] shrink-0 snap-center overflow-hidden rounded-2xl bg-[#f5f5f3] shadow-[0_12px_30px_rgba(0,0,0,.08)] sm:h-[540px]">
    <div className="relative h-full w-full" onTouchStart={(event) => { touchStart.current = event.touches[0].clientX; }} onTouchEnd={(event) => {
      if (touchStart.current === null || !hasGallery) return;
      const delta = event.changedTouches[0].clientX - touchStart.current;
      if (Math.abs(delta) > 40) move(delta > 0 ? -1 : 1);
      touchStart.current = null;
    }}>
      <AnimatePresence initial={false} mode="wait">
        <motion.div key={result.images[active]} initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -18 }} transition={{ duration: 0.26, ease: "easeOut" }} className={`absolute inset-x-0 top-0 ${hasGallery ? "bottom-14" : "bottom-0"}`}>
          <Image src={result.images[active]} alt={`Результат клиента ${result.id}`} fill sizes="(max-width: 639px) calc(100vw - 40px), (max-width: 1023px) calc((100vw - 72px) / 2), 380px" className="object-contain p-3 sm:p-4" />
        </motion.div>
      </AnimatePresence>
      {hasGallery && (
        <div role="group" aria-label={`Фотографии клиента ${result.id}`} className="absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center rounded-full bg-[#171717] px-1">
          <button type="button" aria-label="Предыдущее фото" onClick={() => move(-1)} className={photoArrow}><ChevronLeft size={15} aria-hidden="true" /></button>
          {result.images.map((image, index) => (
            <button
              type="button"
              key={image}
              aria-label={`Фото ${index + 1}`}
              aria-current={active === index ? "true" : undefined}
              onClick={() => setActive(index)}
              className="grid h-11 w-8 place-items-center rounded-full hover:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
            >
              <span className={`h-1.5 rounded-full transition-all ${active === index ? "w-4 bg-white" : "w-1.5 bg-white/45"}`} />
            </button>
          ))}
          <button type="button" aria-label="Следующее фото" onClick={() => move(1)} className={photoArrow}><ChevronRight size={15} aria-hidden="true" /></button>
        </div>
      )}
    </div>
  </article>;
}

export default function ClientResults() {
  const track = useRef<HTMLDivElement>(null);
  const scroll = (direction: -1 | 1) => track.current?.scrollBy({ left: direction * track.current.clientWidth, behavior: "smooth" });

  return <section className="shell py-28 sm:py-40">
    <div className="flex items-end justify-between gap-6">
      <div>
        <p className="eyebrow">Результаты</p>
        <h2 className="display mt-5 text-5xl font-semibold sm:text-7xl">Результаты<br/>моих клиентов</h2>
      </div>
      <div role="group" aria-label="Переключение между клиентами" className="hidden gap-2 lg:flex">
        <button type="button" aria-label="Предыдущие клиенты" onClick={() => scroll(-1)} className="grid h-12 w-12 place-items-center rounded-full border border-neutral-300 transition-colors hover:bg-black hover:text-white"><ChevronLeft size={22} aria-hidden="true" /></button>
        <button type="button" aria-label="Следующие клиенты" onClick={() => scroll(1)} className="grid h-12 w-12 place-items-center rounded-full border border-neutral-300 transition-colors hover:bg-black hover:text-white"><ChevronRight size={22} aria-hidden="true" /></button>
      </div>
    </div>
    <div ref={track} className="-mx-5 mt-14 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-3 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden">
      {clientResults.map((result) => <div key={result.id} className="w-[calc(100vw-40px)] shrink-0 sm:w-[calc((100vw-88px)/2)] lg:w-[calc((100%-32px)/3)]"><ClientCard result={result}/></div>)}
    </div>
  </section>;
}
