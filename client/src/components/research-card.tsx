import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { FileText, ExternalLink } from "lucide-react";
import { Button } from "./ui/button";
import type { Research } from "@shared/schema";
import { Link } from "wouter";
import { Badge } from "./ui/badge";

interface ResearchCardProps {
  research: Research;
}

export function ResearchCard({ research }: ResearchCardProps) {
  return (
    <Card className="h-full hover:shadow-lg transition-shadow" data-testid={`card-research-${research.id}`}>
      {research.thumbnailUrl && (
        <div className="aspect-video w-full overflow-hidden rounded-t-lg">
          <img 
            src={research.thumbnailUrl} 
            alt={research.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <CardHeader className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg leading-tight">
            <Link href={`/research/${research.id}`}>
              <span className="hover:text-primary transition-colors cursor-pointer" data-testid={`link-research-${research.id}`}>
                {research.title}
              </span>
            </Link>
          </CardTitle>
        </div>
        <p className="text-sm text-muted-foreground" data-testid={`text-authors-${research.id}`}>{research.authors}</p>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground" data-testid={`text-venue-${research.id}`}>{research.venue}</span>
          <span className="text-muted-foreground">•</span>
          <span className="text-muted-foreground" data-testid={`text-date-${research.id}`}>{research.date}</span>
        </div>
        {research.tags && research.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {research.tags.map((tag, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs" data-testid={`badge-tag-${research.id}-${idx}`}>
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-3 mb-4" data-testid={`text-abstract-${research.id}`}>
          {research.abstract}
        </p>
        <div className="flex flex-wrap gap-2">
          {research.pdfUrl && (
            <Button variant="outline" size="sm" asChild data-testid={`button-pdf-${research.id}`}>
              <a href={research.pdfUrl} target="_blank" rel="noopener noreferrer">
                <FileText className="h-4 w-4 mr-1" />
                PDF
              </a>
            </Button>
          )}
          {research.externalLink && (
            <Button variant="outline" size="sm" asChild data-testid={`button-external-${research.id}`}>
              <a href={research.externalLink} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-1" />
                Link
              </a>
            </Button>
          )}
          <Button variant="default" size="sm" asChild data-testid={`button-details-${research.id}`}>
            <Link href={`/research/${research.id}`}>
              Details
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
