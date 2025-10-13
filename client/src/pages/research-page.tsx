import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Loader2, ExternalLink, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Research } from "@shared/schema";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { Link } from "wouter";

export default function ResearchPage() {
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  
  const { data: allResearch = [], isLoading } = useQuery<Research[]>({
    queryKey: ["/api/research"],
  });

  const categories = ["all", ...new Set(allResearch.map(r => r.category))];
  
  const filteredResearch = categoryFilter === "all" 
    ? allResearch 
    : allResearch.filter(r => r.category === categoryFilter);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Header - Title integrated into gradient background */}
      <div className="bg-gradient-to-b from-slate-900 to-background py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Research</h1>
          <p className="text-lg text-muted-foreground max-w-3xl">
            Explore publications and research projects in data science, actuarial science, and computational statistics.
          </p>
        </div>
      </div>

      {/* Research List */}
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filters - naturally positioned */}
          <div className="mb-12 flex justify-between items-center gap-4">
            <p className="text-muted-foreground" data-testid="text-research-count">
              {filteredResearch.length} {filteredResearch.length === 1 ? 'publication' : 'publications'}
            </p>
            <div className="w-48">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger data-testid="select-category-filter">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat} data-testid={`option-category-${cat}`}>
                      {cat === "all" ? "All Categories" : cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center min-h-[40vh]">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredResearch.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">No research publications found.</p>
            </div>
          ) : (
            <div className="space-y-0">
              {filteredResearch.map((research, index) => (
                <div key={research.id}>
                  {/* Research Item - Full-width row, no box container */}
                  <div 
                    className="py-8"
                    data-testid={`research-item-${research.id}`}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-start">
                      {/* Image Section - Left Side with subtle shadow only */}
                      <div className="md:col-span-2">
                        {research.imageUrl ? (
                          <img 
                            src={research.imageUrl} 
                            alt={research.title}
                            className="w-full h-64 md:h-80 object-cover shadow-lg"
                            data-testid={`img-research-${research.id}`}
                          />
                        ) : (
                          <div className="w-full h-64 md:h-80 bg-muted/50 flex items-center justify-center shadow-lg">
                            <FileText className="h-16 w-16 text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      {/* Content Section - Right Side flowing naturally */}
                      <div className="md:col-span-3 flex flex-col">
                        {/* Title */}
                        <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-3" data-testid={`text-title-${research.id}`}>
                          {research.title}
                        </h3>

                        {/* Authors */}
                        {research.authors && (
                          <p className="text-sm text-muted-foreground mb-2" data-testid={`text-authors-${research.id}`}>
                            {research.authors}
                          </p>
                        )}

                        {/* Publication and Year - integrated into text flow */}
                        <div className="flex flex-wrap gap-2 items-center mb-4">
                          {research.publication && (
                            <span className="text-base font-medium text-foreground" data-testid={`text-publication-${research.id}`}>
                              {research.publication}
                            </span>
                          )}
                          {research.year && (
                            <span className="text-base text-muted-foreground" data-testid={`text-year-${research.id}`}>
                              • {research.year}
                            </span>
                          )}
                        </div>

                        {/* Category and Tags - flowing with content */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          <Badge variant="default" data-testid={`badge-category-${research.id}`}>
                            {research.category}
                          </Badge>
                          {research.tags && research.tags.map((tag, idx) => (
                            <Badge key={idx} variant="secondary" data-testid={`badge-tag-${research.id}-${idx}`}>
                              {tag}
                            </Badge>
                          ))}
                        </div>

                        {/* Description */}
                        {research.description && (
                          <p className="text-foreground leading-relaxed mb-6" data-testid={`text-description-${research.id}`}>
                            {research.description}
                          </p>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-3 mt-auto">
                          <Button variant="default" asChild data-testid={`button-learn-more-${research.id}`}>
                            <Link href={`/research/${research.id}`}>
                              Learn More
                            </Link>
                          </Button>
                          {research.doiLink && (
                            <Button variant="outline" asChild data-testid={`button-doi-${research.id}`}>
                              <a href={research.doiLink} target="_blank" rel="noopener noreferrer">
                                DOI Link
                                <ExternalLink className="ml-2 h-4 w-4" />
                              </a>
                            </Button>
                          )}
                          {research.pdfUrl && (
                            <Button variant="outline" asChild data-testid={`button-pdf-${research.id}`}>
                              <a href={research.pdfUrl} target="_blank" rel="noopener noreferrer">
                                View PDF
                                <ExternalLink className="ml-2 h-4 w-4" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Thin horizontal divider between items */}
                  {index < filteredResearch.length - 1 && (
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
