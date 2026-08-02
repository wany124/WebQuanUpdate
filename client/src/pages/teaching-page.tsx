import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/navbar";
import { PageHeader } from "@/components/page-header";
import { Footer } from "@/components/footer";
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

      <PageHeader
        title="DATA SCIENCE APPLICATION IN ACTUARIAL SCIENCE"
        sectionLabel="Teaching"
      />

      {/* Courses - Natural flow without card containers */}
      <section className="py-12 md:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="flex items-center justify-center min-h-[40vh]">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">No courses listed at this time.</p>
            </div>
          ) : (
            <div className="space-y-0">
              {courses.map((course, index) => (
                <div key={course.id}>
                  {/* Course Item - flowing naturally on background */}
                  <div className="py-8" data-testid={`card-course-${course.id}`}>
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <h3 className="text-2xl font-bold text-foreground" data-testid={`text-title-${course.id}`}>
                          {course.courseCode}: {course.title}
                        </h3>
                        <p className="text-base text-muted-foreground mt-2" data-testid={`text-semester-${course.id}`}>
                          {course.semester}
                        </p>
                      </div>
                    </div>
                    
                    {course.description && (
                      <p className="text-foreground leading-relaxed mb-4 max-w-3xl" data-testid={`text-description-${course.id}`}>
                        {course.description}
                      </p>
                    )}
                    
                    <div className="flex flex-wrap gap-3">
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
                  </div>
                  
                  {/* Thin horizontal divider between courses */}
                  {index < courses.length - 1 && (
                    <div className="border-b border-border/50"></div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
