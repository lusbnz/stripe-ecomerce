"use client";

import { useEffect } from "react";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import Image from "next/image";

const images = [
  "https://www.lofree.co/cdn/shop/files/Banner-PC_1f1a8545-b21d-4fc0-bb18-bbe87a08cd16.png?v=1741175643&width=2000",
  "https://www.lofree.co/cdn/shop/files/banner-Destop.jpg?v=1742895994&width=2800",
  "https://www.lofree.co/cdn/shop/files/Flow_Lite_home_hero03_1_5c0c47d1-423c-4e3f-bfb8-7fd8f49492b6.webp?v=1735798769&width=2200",
  "https://www.lofree.co/cdn/shop/files/Flow_home_hero04_94459c38-68fc-410c-80b2-22e239c4846b.webp?v=1720417230&width=1800",
];

export function HeroCarousel() {
  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>({
    loop: true,
    slides: { perView: 1 },
    renderMode: "performance",
  });

  useEffect(() => {
    const interval = setInterval(() => {
      if (instanceRef.current) {
        instanceRef.current.next();
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [instanceRef]);

  return (
    <div ref={sliderRef} className="keen-slider rounded overflow-hidden">
      {images.map((src, i) => (
        <div key={i} className="keen-slider__slide relative w-full h-[600px]">
          <Image
            src={src}
            alt={`Slide ${i}`}
            fill
            className="object-cover"
            unoptimized
          />
        </div>
      ))}
    </div>
  );
}
