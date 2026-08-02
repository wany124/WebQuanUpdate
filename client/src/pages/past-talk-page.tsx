import { useState, useEffect } from "react";
import { FileText, Calendar, Building2, ArrowRight } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Navbar } from "@/components/navbar";
import { PageHeader } from "@/components/page-header";
import { Footer } from "@/components/footer";
import { useToast } from "../hooks/use-toast";
import type { PastTalk } from "@shared/schema";

export default function PastTalksPage() {
  const [talks, setTalks] = useState<PastTalk[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchTalks();
  }, []);

  const fetchTalks = async () => {
    try {
      const response = await fetch("/api/talks");
      if (response.ok) {
        const data = await response.json();
        setTalks(data);
      } else {
        throw new Error("Failed to fetch talks");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load past talks",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <PageHeader title="DATA SCIENCE APPLICATION IN ACTUARIAL SCIENCE" sectionLabel="Past Talks" />
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading past talks...</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <PageHeader title="DATA SCIENCE APPLICATION IN ACTUARIAL SCIENCE" sectionLabel="Past Talks" />

      <section className="max-w-[68em] mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">

      {/* Talks Grid */}
      {talks.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">No past talks yet</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
          {talks.map((talk) => (
            <Card key={talk.id} className="hover:shadow-lg transition-shadow overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl line-clamp-2">
                  {talk.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Date */}
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground">
                    {formatDate(talk.date)}
                  </span>
                </div>

                {/* Conference */}
                {talk.conference && (
                  <div className="flex items-center gap-3 text-sm">
                    <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-muted-foreground">{talk.conference}</span>
                  </div>
                )}

                {/* Talk Type */}
                {talk.talkType && (
                  <div>
                    <span className="inline-block bg-slate-100 text-slate-700 text-xs font-medium px-3 py-1 rounded-full">
                      {talk.talkType}
                    </span>
                  </div>
                )}

                {/* Description */}
                {talk.description && (
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {talk.description}
                  </p>
                )}

                {/* PDF Link */}
                <div className="pt-2">
                  <a
                    href={talk.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium text-sm"
                  >
                    <FileText className="h-4 w-4" />
                    View Slides
                    <ArrowRight className="h-3 w-3" />
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Statistics */}
      {talks.length > 0 && (
        <div className="mt-12 p-6 bg-card border border-border rounded">
          <p className="text-sm text-muted-foreground">
            Total presentations: <span className="font-semibold text-foreground">{talks.length}</span>
          </p>
        </div>
      )}
      </section>
      <Footer />
    </div>
  );
}