import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, FileText, ArrowRight } from "lucide-react";
import { Button } from "./ui/button";
import type { CarouselImage } from "@shared/schema";

interface ImageCarouselProps {
  images: CarouselImage[];
}

export function ImageCarousel({ images }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const next = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const prev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  // Auto-advance every 5s
  useEffect(() => {
    if (images.length === 0) return;
    const interval = setInterval(next, 5000);
    return () => clearInterval(interval);
  }, [images.length, next]);

  // Allow arrow key navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [next, prev]);

  if (images.length === 0) {
    return (
      <div className="w-full aspect-[21/9] bg-muted rounded-lg flex items-center justify-center">
        <p className="text-muted-foreground">No images available</p>
      </div>
    );
  }

  return (
    <div className="relative w-full rounded-lg overflow-hidden bg-black">
      {/* Main image container - full-scale display */}
      <div className="relative w-full aspect-[16/9] md:aspect-[21/9] overflow-hidden flex items-center justify-center">
        <img
          src={images[currentIndex].imageUrl}
          alt={images[currentIndex].caption || `Slide ${currentIndex + 1}`}
          className="w-full h-full object-contain transition-all duration-700 ease-in-out"
        />
      </div>

      {/* Caption and links section */}
      <div className="bg-gradient-to-t from-black/90 to-black/50 px-6 py-6 space-y-4">
        {/* Caption */}
        {images[currentIndex].caption && (
          <p className="text-white text-lg font-medium">{images[currentIndex].caption}</p>
        )}

        {/* Links */}
        <div className="flex flex-wrap gap-4 items-center">
          {/* PDF Link */}
          {images[currentIndex].pdfUrl && (
            <a
              href={images[currentIndex].pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
            >
              <FileText className="h-4 w-4" />
              <span className="text-sm hover:underline">View Slides</span>
            </a>
          )}

          {/* Link to Past Talks */}
          <a
            href="/talks"
            className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
          >
            <span className="text-sm hover:underline">Past Talks & Lectures</span>
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>

      {/* Always-visible navigation buttons */}
      {images.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 text-white hover:bg-black/60 z-10"
            onClick={prev}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 text-white hover:bg-black/60 z-10"
            onClick={next}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>

          {/* Dots */}
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {images.map((_, idx) => (
              <button
                key={idx}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentIndex ? "bg-white w-6" : "bg-white/50"
                }`}
                onClick={() => setCurrentIndex(idx)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}