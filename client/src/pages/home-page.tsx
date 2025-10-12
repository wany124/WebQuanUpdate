import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ImageCarousel } from "@/components/image-carousel";
import { ResearchCard } from "@/components/research-card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Loader2 } from "lucide-react";
import type { PersonalInfo, CarouselImage, Research } from "@shared/schema";

export default function HomePage() {
  const { data: personalInfo, isLoading: infoLoading } = useQuery<PersonalInfo>({
    queryKey: ["/api/personal-info"],
  });

  const { data: carouselImages = [], isLoading: carouselLoading } = useQuery<CarouselImage[]>({
    queryKey: ["/api/carousel"],
  });

  const { data: featuredResearch = [], isLoading: researchLoading } = useQuery<Research[]>({
    queryKey: ["/api/research/featured"],
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

      {/* Hero Section */}
      <div className="bg-gradient-to-b from-slate-900 to-background py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4" data-testid="text-tagline">
            {personalInfo?.tagline || "DATA SCIENCE APPLICATION IN ACTUARIAL SCIENCE"}
          </h1>
        </div>
      </div>

      {/* Biography Section */}
      {personalInfo && (
        <section className="py-12 md:py-16 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-card border border-card-border rounded-lg p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Photo */}
                {personalInfo.photoUrl && (
                  <div className="flex justify-center md:justify-start">
                    <img 
                      src={personalInfo.photoUrl} 
                      alt={personalInfo.name}
                      className="w-48 h-48 rounded-lg object-cover shadow-lg"
                      data-testid="img-profile"
                    />
                  </div>
                )}
                
                {/* Bio and Details */}
                <div className={personalInfo.photoUrl ? "md:col-span-2" : "md:col-span-3"}>
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2" data-testid="text-name">
                    {personalInfo.name}
                  </h2>
                  <p className="text-lg text-muted-foreground mb-4" data-testid="text-title">
                    {personalInfo.title}
                  </p>
                  <p className="text-base text-foreground leading-relaxed mb-6" data-testid="text-bio">
                    {personalInfo.bio}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {personalInfo.interests && personalInfo.interests.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-foreground mb-2">Interests</h3>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {personalInfo.interests.map((interest, idx) => (
                            <li key={idx} data-testid={`text-interest-${idx}`}>• {interest}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {personalInfo.education && personalInfo.education.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-foreground mb-2">Education</h3>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {personalInfo.education.map((edu, idx) => (
                            <li key={idx} data-testid={`text-education-${idx}`}>• {edu}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {personalInfo.experience && personalInfo.experience.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-foreground mb-2">Experience</h3>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {personalInfo.experience.map((exp, idx) => (
                            <li key={idx} data-testid={`text-experience-${idx}`}>• {exp}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Carousel Section */}
      {!carouselLoading && carouselImages.length > 0 && (
        <section className="py-12 md:py-16 bg-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl md:text-3xl font-bold text-center text-white mb-8">
              RECENT & UPCOMING TALKS
            </h2>
            <ImageCarousel images={carouselImages} />
          </div>
        </section>
      )}

      {/* Featured Research */}
      {!researchLoading && featuredResearch.length > 0 && (
        <section className="py-12 md:py-16 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl md:text-3xl font-bold text-center text-foreground mb-8">
              Featured Research
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {featuredResearch.map((research) => (
                <ResearchCard key={research.id} research={research} />
              ))}
            </div>
            <div className="text-center">
              <Button variant="default" size="lg" asChild data-testid="button-view-all-research">
                <Link href="/research">View All Research</Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
