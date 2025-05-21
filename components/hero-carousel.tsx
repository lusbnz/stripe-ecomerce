'use client';

import { useEffect, useState } from 'react';
import { useKeenSlider } from 'keen-slider/react';
import 'keen-slider/keen-slider.min.css';
import Image from 'next/image';

interface Banner {
  id: string;
  image_url: string;
  alt_text: string | null;
}

export function HeroCarousel() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>({
    loop: true,
    slides: { perView: 1 },
    renderMode: 'performance',
  });

  useEffect(() => {
    fetch('/api/banners')
      .then((res) => res.json())
      .then((data) => {
        setBanners(data.data || []);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching banners:', error);
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (instanceRef.current) {
        instanceRef.current.next();
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [instanceRef]);

  if (isLoading) {
    return <div className="h-[600px] bg-gray-200 animate-pulse rounded" />;
  }

  if (banners.length === 0) {
    return <div className="h-[600px] text-center">No banners available</div>;
  }

  return (
    <div ref={sliderRef} className="keen-slider rounded overflow-hidden">
      {banners.map((banner) => (
        <div key={banner.id} className="keen-slider__slide relative w-full h-[600px]">
          <Image
            src={banner.image_url}
            alt={banner.alt_text || `Banner ${banner.id}`}
            fill
            className="object-cover"
            unoptimized
          />
        </div>
      ))}
    </div>
  );
}