import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/navbar";
import { PageHeader } from "@/components/page-header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { ExternalLink, User } from "lucide-react";
import { Loader2 } from "lucide-react";
import type { Student } from "@shared/schema";

export default function StudentsPage() {
  const { data: students = [], isLoading } = useQuery<Student[]>({
    queryKey: ["/api/students"],
  });

  const currentStudents = students.filter(s => s.status === "current");
  const alumni = students.filter(s => s.status === "alumni");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <PageHeader
        title="DATA SCIENCE APPLICATION IN ACTUARIAL SCIENCE"
        sectionLabel="Students"
      />

      {/* Students - Natural grid layout without card containers */}
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {isLoading ? (
            <div className="flex items-center justify-center min-h-[40vh]">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Current Students */}
              {currentStudents.length > 0 && (
                <div>
                  <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-8">
                    Current PhD Students
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    {currentStudents.map((student) => (
                      <div 
                        key={student.id} 
                        className="text-center space-y-4" 
                        data-testid={`card-student-${student.id}`}
                      >
                        {/* Photo with subtle shadow only - no container */}
                        {student.photoUrl ? (
                          <img 
                            src={student.photoUrl} 
                            alt={student.name}
                            className="w-36 h-36 rounded-full object-cover mx-auto shadow-lg"
                            data-testid={`img-student-${student.id}`}
                          />
                        ) : (
                          <div className="w-36 h-36 rounded-full bg-muted/50 flex items-center justify-center mx-auto shadow-lg">
                            <User className="h-16 w-16 text-muted-foreground" />
                          </div>
                        )}
                        
                        {/* Info flowing naturally below photo */}
                        <div>
                          <h3 className="font-semibold text-lg text-foreground" data-testid={`text-name-${student.id}`}>
                            {student.name}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1" data-testid={`text-start-${student.id}`}>
                            {student.startYear} - Present
                          </p>
                          <p className="text-sm text-foreground mt-2" data-testid={`text-research-${student.id}`}>
                            {student.researchArea}
                          </p>
                          {student.websiteUrl && (
                            <Button variant="outline" size="sm" className="mt-3" asChild data-testid={`button-website-${student.id}`}>
                              <a href={student.websiteUrl} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-3 w-3 mr-1" />
                                Website
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Subtle divider between sections */}
              {currentStudents.length > 0 && alumni.length > 0 && (
                <div className="border-b border-border/50"></div>
              )}

              {/* Alumni */}
              {alumni.length > 0 && (
                <div>
                  <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-8">
                    Alumni
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    {alumni.map((student) => (
                      <div 
                        key={student.id} 
                        className="text-center space-y-4" 
                        data-testid={`card-alumni-${student.id}`}
                      >
                        {/* Photo with subtle shadow only - no container */}
                        {student.photoUrl ? (
                          <img 
                            src={student.photoUrl} 
                            alt={student.name}
                            className="w-36 h-36 rounded-full object-cover mx-auto shadow-lg"
                            data-testid={`img-alumni-${student.id}`}
                          />
                        ) : (
                          <div className="w-36 h-36 rounded-full bg-muted/50 flex items-center justify-center mx-auto shadow-lg">
                            <User className="h-16 w-16 text-muted-foreground" />
                          </div>
                        )}
                        
                        {/* Info flowing naturally below photo */}
                        <div>
                          <h3 className="font-semibold text-lg text-foreground" data-testid={`text-alumni-name-${student.id}`}>
                            {student.name}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {student.startYear}
                          </p>
                          <p className="text-sm text-foreground mt-2">
                            {student.researchArea}
                          </p>
                          {student.websiteUrl && (
                            <Button variant="outline" size="sm" className="mt-3" asChild data-testid={`button-alumni-website-${student.id}`}>
                              <a href={student.websiteUrl} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-3 w-3 mr-1" />
                                Website
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {students.length === 0 && (
                <div className="text-center py-16">
                  <p className="text-muted-foreground text-lg">No students listed at this time.</p>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
