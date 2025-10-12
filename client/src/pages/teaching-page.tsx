import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, FileText } from "lucide-react";
import { Loader2 } from "lucide-react";
import type { Course } from "@shared/schema";

export default function TeachingPage() {
  const { data: courses = [], isLoading } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Header */}
      <div className="bg-gradient-to-b from-slate-900 to-background py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Teaching</h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Current and recent courses in actuarial science, data science, and computational statistics.
          </p>
        </div>
      </div>

      {/* Courses */}
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="flex items-center justify-center min-h-[40vh]">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">No courses listed at this time.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {courses.map((course) => (
                <Card key={course.id} className="hover:shadow-lg transition-shadow" data-testid={`card-course-${course.id}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <CardTitle className="text-xl" data-testid={`text-title-${course.id}`}>
                          {course.courseCode}: {course.title}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1" data-testid={`text-semester-${course.id}`}>
                          {course.semester}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {course.description && (
                      <p className="text-sm text-foreground leading-relaxed" data-testid={`text-description-${course.id}`}>
                        {course.description}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {course.syllabusUrl && (
                        <Button variant="outline" size="sm" asChild data-testid={`button-syllabus-${course.id}`}>
                          <a href={course.syllabusUrl} target="_blank" rel="noopener noreferrer">
                            <FileText className="h-4 w-4 mr-1" />
                            Syllabus
                          </a>
                        </Button>
                      )}
                      {course.materialsLink && (
                        <Button variant="outline" size="sm" asChild data-testid={`button-materials-${course.id}`}>
                          <a href={course.materialsLink} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Materials
                          </a>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
