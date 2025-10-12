import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { Button } from "./ui/button";
import type { Event } from "@shared/schema";

interface EventsCarouselProps {
  events: Event[];
}

export function EventsCarousel({ events }: EventsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % events.length);
  };

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + events.length) % events.length);
  };

  useEffect(() => {
    if (events.length === 0) return;
    
    const interval = setInterval(next, 6000);
    return () => clearInterval(interval);
  }, [events.length]);

  if (events.length === 0) {
    return null;
  }

  return (
    <div className="relative w-full h-[500px] rounded-lg overflow-hidden group">
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-700"
        style={{ backgroundImage: `url(${events[currentIndex].imageUrl})` }}
        data-testid={`event-slide-${currentIndex}`}
      >
        {/* Dark overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30" />
        
        {/* Content */}
        <div className="relative h-full flex flex-col justify-end p-8 md:p-12">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="h-5 w-5 text-primary" />
              <span className="text-white/90 text-sm font-medium" data-testid="event-date">
                {events[currentIndex].date}
              </span>
            </div>
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-3" data-testid="event-title">
              {events[currentIndex].title}
            </h3>
            {events[currentIndex].description && (
              <p className="text-lg text-white/90 leading-relaxed" data-testid="event-description">
                {events[currentIndex].description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Navigation arrows */}
      {events.length > 1 && (
        <>
          <Button
            variant="outline"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 border-white/20 text-white hover:bg-black/50 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={prev}
            data-testid="button-event-prev"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 border-white/20 text-white hover:bg-black/50 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={next}
            data-testid="button-event-next"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>

          {/* Dots indicator */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
            {events.map((_, idx) => (
              <button
                key={idx}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentIndex ? "bg-white w-8" : "bg-white/50"
                }`}
                onClick={() => setCurrentIndex(idx)}
                data-testid={`button-event-dot-${idx}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
