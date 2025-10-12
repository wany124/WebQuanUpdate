import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Card, CardContent } from "@/components/ui/card";
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

      {/* Header */}
      <div className="bg-gradient-to-b from-slate-900 to-background py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">PhD Students</h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Current and former doctoral students in the research lab.
          </p>
        </div>
      </div>

      {/* Students */}
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {isLoading ? (
            <div className="flex items-center justify-center min-h-[40vh]">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Current Students */}
              {currentStudents.length > 0 && (
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8 text-center">
                    Current PhD Students
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {currentStudents.map((student) => (
                      <Card key={student.id} className="hover:shadow-lg transition-shadow" data-testid={`card-student-${student.id}`}>
                        <CardContent className="p-6 text-center space-y-4">
                          {student.photoUrl ? (
                            <img 
                              src={student.photoUrl} 
                              alt={student.name}
                              className="w-32 h-32 rounded-full object-cover mx-auto shadow-lg"
                              data-testid={`img-student-${student.id}`}
                            />
                          ) : (
                            <div className="w-32 h-32 rounded-full bg-secondary flex items-center justify-center mx-auto">
                              <User className="h-16 w-16 text-muted-foreground" />
                            </div>
                          )}
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
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Alumni */}
              {alumni.length > 0 && (
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8 text-center">
                    Alumni
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {alumni.map((student) => (
                      <Card key={student.id} className="hover:shadow-lg transition-shadow" data-testid={`card-alumni-${student.id}`}>
                        <CardContent className="p-6 text-center space-y-4">
                          {student.photoUrl ? (
                            <img 
                              src={student.photoUrl} 
                              alt={student.name}
                              className="w-32 h-32 rounded-full object-cover mx-auto shadow-lg"
                              data-testid={`img-alumni-${student.id}`}
                            />
                          ) : (
                            <div className="w-32 h-32 rounded-full bg-secondary flex items-center justify-center mx-auto">
                              <User className="h-16 w-16 text-muted-foreground" />
                            </div>
                          )}
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
                        </CardContent>
                      </Card>
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
