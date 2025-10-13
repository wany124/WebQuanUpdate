import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { EventsCarousel } from "@/components/events-carousel";
import { ExperienceTimeline } from "@/components/experience-timeline";
import { Loader2 } from "lucide-react";
import type { PersonalInfo, Event, ExperiencePosition } from "@shared/schema";

export default function HomePage() {
  const { data: personalInfo, isLoading: infoLoading } = useQuery<PersonalInfo>({
    queryKey: ["/api/personal-info"],
  });

  const { data: events = [], isLoading: eventsLoading } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  const { data: experience = [], isLoading: experienceLoading } = useQuery<ExperiencePosition[]>({
    queryKey: ["/api/experience"],
  });

  if (infoLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section - Title integrated into background */}
      <div className="bg-gradient-to-b from-slate-900 to-background py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground" data-testid="text-tagline">
            {personalInfo?.tagline || "DATA SCIENCE APPLICATION IN ACTUARIAL SCIENCE"}
          </h1>
        </div>
      </div>

      {/* Biography Section - No card container, natural flow */}
      {personalInfo && (
        <section className="py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-start">
              {/* Photo with subtle shadow only - no container */}
              {personalInfo.photoUrl && (
                <div className="flex justify-center md:justify-start">
                  <img 
                    src={personalInfo.photoUrl} 
                    alt={personalInfo.name}
                    className="w-56 h-56 rounded-lg object-cover shadow-lg"
                    data-testid="img-profile"
                  />
                </div>
              )}
              
              {/* Bio and Details - flowing naturally on background */}
              <div className={personalInfo.photoUrl ? "md:col-span-2" : "md:col-span-3"}>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3" data-testid="text-name">
                  {personalInfo.name}
                </h2>
                <p className="text-xl text-muted-foreground mb-6" data-testid="text-title">
                  {personalInfo.title}
                </p>
                <p className="text-base text-foreground leading-relaxed mb-10" data-testid="text-bio">
                  {personalInfo.bio}
                </p>

                {/* Interests, Education, Experience - directly on background */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {personalInfo.interests && personalInfo.interests.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-3">Interests</h3>
                      <ul className="text-sm text-muted-foreground space-y-2">
                        {personalInfo.interests.map((interest, idx) => (
                          <li key={idx} data-testid={`text-interest-${idx}`}>• {interest}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {personalInfo.education && personalInfo.education.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-3">Education</h3>
                      <ul className="text-sm text-muted-foreground space-y-2">
                        {personalInfo.education.map((edu, idx) => (
                          <li key={idx} data-testid={`text-education-${idx}`}>• {edu}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {personalInfo.experience && personalInfo.experience.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-3">Experience</h3>
                      <ul className="text-sm text-muted-foreground space-y-2">
                        {personalInfo.experience.map((exp, idx) => (
                          <li key={idx} data-testid={`text-experience-${idx}`}>• {exp}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Subtle divider line at bottom of section */}
            <div className="border-b border-border/50 mt-16"></div>
          </div>
        </section>
      )}

      {/* Events Carousel Section */}
      {!eventsLoading && events.length > 0 && (
        <section className="py-12 md:py-16 bg-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl md:text-3xl font-bold text-center text-white mb-8">
              Recent & Upcoming Talks
            </h2>
            <EventsCarousel events={events} />
          </div>
        </section>
      )}

      {/* Experience Timeline Section */}
      {!experienceLoading && experience.length > 0 && (
        <section className="py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-12">
              Professional Experience
            </h2>
            <ExperienceTimeline positions={experience} />
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
