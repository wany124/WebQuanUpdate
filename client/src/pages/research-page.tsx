import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ResearchCard } from "@/components/research-card";
import { Loader2 } from "lucide-react";
import type { Research } from "@shared/schema";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

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

      {/* Header */}
      <div className="bg-gradient-to-b from-slate-900 to-background py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Research</h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Explore publications and research projects in data science, actuarial science, and computational statistics.
          </p>
        </div>
      </div>

      {/* Research List */}
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filters */}
          <div className="mb-8 flex justify-between items-center">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResearch.map((research) => (
                <ResearchCard key={research.id} research={research} />
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
