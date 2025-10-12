import { Briefcase, MapPin } from "lucide-react";
import type { ExperiencePosition } from "@shared/schema";

interface ExperienceTimelineProps {
  positions: ExperiencePosition[];
}

export function ExperienceTimeline({ positions }: ExperienceTimelineProps) {
  if (positions.length === 0) {
    return null;
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-border" />
        
        {/* Timeline items */}
        <div className="space-y-12">
          {positions.map((position, index) => (
            <div 
              key={position.id} 
              className={`relative flex items-center ${
                index % 2 === 0 ? "justify-start" : "justify-end"
              }`}
              data-testid={`experience-item-${position.id}`}
            >
              {/* Content */}
              <div 
                className={`w-5/12 ${
                  index % 2 === 0 ? "pr-8 text-right" : "pl-8 text-left"
                }`}
              >
                <div className="bg-card border border-card-border rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <h3 className="text-xl font-bold text-foreground mb-1" data-testid={`job-title-${position.id}`}>
                    {position.jobTitle}
                  </h3>
                  <div className="flex items-center gap-2 text-primary font-medium mb-2" 
                       style={{ justifyContent: index % 2 === 0 ? "flex-end" : "flex-start" }}>
                    <Briefcase className="h-4 w-4" />
                    <span data-testid={`company-${position.id}`}>{position.company}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1" data-testid={`dates-${position.id}`}>
                    {position.startDate} - {position.endDate || "Present"}
                  </p>
                  {position.location && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground"
                         style={{ justifyContent: index % 2 === 0 ? "flex-end" : "flex-start" }}>
                      <MapPin className="h-3 w-3" />
                      <span data-testid={`location-${position.id}`}>{position.location}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Center dot */}
              <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-primary border-4 border-background rounded-full z-10" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
