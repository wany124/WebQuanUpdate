import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";
import type { CarouselImage } from "@shared/schema";

interface ImageCarouselProps {
  images: CarouselImage[];
}

export function ImageCarousel({ images }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  useEffect(() => {
    if (images.length === 0) return;
    
    const interval = setInterval(next, 5000);
    return () => clearInterval(interval);
  }, [images.length]);

  if (images.length === 0) {
    return (
      <div className="w-full aspect-[21/9] bg-slate-800 rounded-lg flex items-center justify-center">
        <p className="text-muted-foreground">No images available</p>
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-[16/9] md:aspect-[21/9] rounded-lg overflow-hidden group">
      <img
        src={images[currentIndex].imageUrl}
        alt={images[currentIndex].caption || `Slide ${currentIndex + 1}`}
        className="w-full h-full object-cover"
        data-testid={`carousel-image-${currentIndex}`}
      />
      
      {images[currentIndex].caption && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
          <p className="text-white text-lg" data-testid="carousel-caption">{images[currentIndex].caption}</p>
        </div>
      )}

      {images.length > 1 && (
        <>
          <Button
            variant="outline"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 border-white/20 text-white hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={prev}
            data-testid="button-carousel-prev"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 border-white/20 text-white hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={next}
            data-testid="button-carousel-next"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {images.map((_, idx) => (
              <button
                key={idx}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentIndex ? "bg-white w-6" : "bg-white/50"
                }`}
                onClick={() => setCurrentIndex(idx)}
                data-testid={`button-carousel-dot-${idx}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
