import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { FileText, ExternalLink, ArrowLeft, Copy, Check } from "lucide-react";
import { Loader2 } from "lucide-react";
import type { Research } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function ResearchDetailPage() {
  const [, params] = useRoute("/research/:id");
  const researchId = params?.id;
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const { data: research, isLoading } = useQuery<Research>({
    queryKey: ["/api/research", researchId],
    enabled: !!researchId,
  });

  const copyCitation = () => {
    if (research?.citation) {
      navigator.clipboard.writeText(research.citation);
      setCopied(true);
      toast({ title: "Citation copied to clipboard" });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!research) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Research Not Found</h1>
          <Button asChild>
            <Link href="/research">Back to Research</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Header - integrated into gradient background */}
      <div className="bg-gradient-to-b from-slate-900 to-background py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Button variant="ghost" size="sm" asChild className="mb-6" data-testid="button-back">
            <Link href="/research">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Research
            </Link>
          </Button>

          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4" data-testid="text-title">
            {research.title}
          </h1>
          <p className="text-lg text-muted-foreground mb-2" data-testid="text-authors">{research.authors}</p>
          <div className="flex items-center gap-3 text-muted-foreground mb-6">
            <span data-testid="text-venue">{research.venue}</span>
            <span>•</span>
            <span data-testid="text-date">{research.date}</span>
            {research.category && (
              <>
                <span>•</span>
                <Badge variant="secondary" data-testid="badge-category">{research.category}</Badge>
              </>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            {research.pdfUrl && (
              <Button variant="default" asChild data-testid="button-download-pdf">
                <a href={research.pdfUrl} target="_blank" rel="noopener noreferrer">
                  <FileText className="h-4 w-4 mr-2" />
                  Download PDF
                </a>
              </Button>
            )}
            {research.externalLink && (
              <Button variant="outline" asChild data-testid="button-doi-link">
                <a href={research.externalLink} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  DOI Link
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Content - flowing naturally without card containers */}
      <section className="py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {research.thumbnailUrl && (
            <img 
              src={research.thumbnailUrl} 
              alt={research.title}
              className="w-full shadow-lg"
              data-testid="img-thumbnail"
            />
          )}

          {/* Abstract - natural flow without container */}
          <div>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Abstract</h2>
            <p className="text-base text-foreground leading-relaxed whitespace-pre-line" data-testid="text-abstract">
              {research.abstract}
            </p>
          </div>

          {/* Divider */}
          <div className="border-b border-border/50"></div>

          {/* Citation - with copy button */}
          {research.citation && (
            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Citation</h2>
              <div className="bg-muted/30 p-4 rounded-md relative">
                <p className="text-sm text-foreground font-mono leading-relaxed pr-12" data-testid="text-citation">
                  {research.citation}
                </p>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute top-4 right-4" 
                  onClick={copyCitation}
                  data-testid="button-copy-citation"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Keywords - natural flow */}
          {research.tags && research.tags.length > 0 && (
            <>
              {/* Divider */}
              <div className="border-b border-border/50"></div>
              
              <div>
                <h2 className="text-2xl font-semibold text-foreground mb-4">Keywords</h2>
                <div className="flex flex-wrap gap-2">
                  {research.tags.map((tag, idx) => (
                    <Badge key={idx} variant="secondary" data-testid={`badge-tag-${idx}`}>
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
