import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ImageCarousel } from "@/components/image-carousel";
import { ExperienceTimeline } from "@/components/experience-timeline";
import { Loader2 } from "lucide-react";
import type { PersonalInfo, ExperiencePosition, CarouselImage } from "@shared/schema";

export default function HomePage() {
  const { data: personalInfo, isLoading: infoLoading } = useQuery<PersonalInfo>({
    queryKey: ["/api/personal-info"],
  });

  const { data: experience = [], isLoading: experienceLoading } = useQuery<ExperiencePosition[]>({
    queryKey: ["/api/experience"],
  });

  const { data: carouselImages = [], isLoading: carouselLoading } = useQuery<CarouselImage[]>({
    queryKey: ["/api/carousel"],
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


      {/* Hero — shorter, single-line title, dark navy matching navbar */}
      <header className="relative pt-8 md:pt-10 pb-16 md:pb-20 text-center bg-[#2c3340]">
        <div className="relative max-w-[68em] mx-auto px-4 sm:px-6 lg:px-8">
          <h1
            className="font-bold uppercase tracking-[0.18em] text-white whitespace-nowrap text-[clamp(0.7rem,2.4vw,1.875rem)]"
            data-testid="text-tagline"
          >
            {personalInfo?.tagline || "DATA SCIENCE APPLICATION IN ACTUARIAL SCIENCE"}
          </h1>
        </div>

        {/* Floating Biography plate — dark/translucent, no bottom border */}
        {personalInfo && (
          <div className="absolute left-1/2 -translate-x-1/2 -bottom-5 z-10 px-10 py-2.5 bg-[#2c3340] border-t border-x border-white/15">
            <span className="text-xs tracking-[0.25em] font-bold text-white/90 uppercase">
              Biography
            </span>
          </div>
        )}
      </header>

      {/* Biography — single dark section: bio + interests/education/experience */}
      {personalInfo && (
        <section className="bg-[#4c5461] pt-16 pb-16 md:pb-20">
          <div className="max-w-[68em] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-start">
              {personalInfo.photoUrl && (
                <div className="flex justify-center md:justify-start">
                  <img
                    src={personalInfo.photoUrl}
                    alt={personalInfo.name}
                    className="w-56 h-56 object-cover border-4 border-white/15"
                    data-testid="img-profile"
                  />
                </div>
              )}

              <div className={personalInfo.photoUrl ? "md:col-span-2" : "md:col-span-3"}>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2" data-testid="text-name">
                  {personalInfo.name}
                </h2>
                <p className="text-lg text-white/70 mb-6" data-testid="text-title">
                  {personalInfo.title}
                </p>
                <p className="text-base text-white/85 leading-relaxed" data-testid="text-bio">
                  {personalInfo.bio}
                </p>
              </div>
            </div>

            {/* Interests / Education / Experience — same dark section */}
            {((personalInfo.interests && personalInfo.interests.length > 0) ||
              (personalInfo.education && personalInfo.education.length > 0) ||
              (personalInfo.experience && personalInfo.experience.length > 0)) && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pt-8 border-t border-white/10">
                {personalInfo.interests && personalInfo.interests.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-[0.25em] text-white mb-4">
                      Interests
                    </h3>
                    <ul className="text-sm text-white/85 space-y-2">
                      {personalInfo.interests.map((interest, idx) => (
                        <li key={idx} data-testid={`text-interest-${idx}`}>• {interest}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {personalInfo.education && personalInfo.education.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-[0.25em] text-white mb-4">
                      Education
                    </h3>
                    <ul className="text-sm text-white/85 space-y-2">
                      {personalInfo.education.map((edu, idx) => (
                        <li key={idx} data-testid={`text-education-${idx}`}>• {edu}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {personalInfo.experience && personalInfo.experience.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-[0.25em] text-white mb-4">
                      Experience
                    </h3>
                    <ul className="text-sm text-white/85 space-y-2">
                      {personalInfo.experience.map((exp, idx) => (
                        <li key={idx} data-testid={`text-experience-${idx}`}>• {exp}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      )}



      {/* Professional Experience — light gray subsection (B's wrapper.style3) */}
      {!experienceLoading && experience.length > 0 && (
        <section className="relative bg-[#f3f3f3] pt-20 pb-16 md:pb-20">
          {/* Floating section plate — light box, no bottom border */}
          <div className="absolute left-1/2 -translate-x-1/2 -top-5 z-10 px-10 py-2.5 bg-white border-t border-x border-border shadow-md">
            <span className="text-xs tracking-[0.25em] font-bold text-foreground uppercase">
              Professional Experience
            </span>
          </div>

          <div className="max-w-[68em] mx-auto px-4 sm:px-6 lg:px-8">
            <ExperienceTimeline positions={experience} />
          </div>
        </section>
      )}

      {/* Recent & Upcoming Talks — dark section containing the image carousel */}
      {!carouselLoading && carouselImages.length > 0 && (
        <section className="relative bg-[#4c5461] pt-20 pb-16 md:pb-20">
          {/* Floating section plate — dark/translucent, no bottom border */}
          <div className="absolute left-1/2 -translate-x-1/2 -top-5 z-10 px-10 py-2.5 bg-[#2c3340] border-t border-x border-white/15">
            <span className="text-xs tracking-[0.25em] font-bold text-white/90 uppercase whitespace-nowrap">
              Recent &amp; Upcoming Talks
            </span>
          </div>

          <div className="max-w-[68em] mx-auto px-4 sm:px-6 lg:px-8">
            <ImageCarousel images={carouselImages} />
          </div>
        </section>
      )}


      <Footer />
    </div>
  );
}
