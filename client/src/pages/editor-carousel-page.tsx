import { useQuery, useMutation } from "@tanstack/react-query";
import { EditorLayout } from "./editor-page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, Trash2, X } from "lucide-react";
import { useState } from "react";
import type { CarouselImage } from "@shared/schema";

export default function EditorCarouselPage() {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [newCaption, setNewCaption] = useState("");

  const { data: images = [], isLoading } = useQuery<CarouselImage[]>({
    queryKey: ["/api/carousel"],
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      
      const uploadRes = await apiRequest("POST", "/api/upload/image", formData);
      const { url } = await uploadRes.json();
      
      const addRes = await apiRequest("POST", "/api/carousel", {
        imageUrl: url,
        caption: newCaption || null,
        order: images.length,
      });
      return await addRes.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/carousel"] });
      setNewCaption("");
      setUploading(false);
      toast({ title: "Success", description: "Image uploaded" });
    },
    onError: (error: Error) => {
      setUploading(false);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/carousel/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/carousel"] });
      toast({ title: "Success", description: "Image deleted" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadMutation.mutate(file);
    }
  };

  if (isLoading) {
    return (
      <EditorLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </EditorLayout>
    );
  }

  return (
    <EditorLayout>
      <div className="p-8">
        <h1 className="text-3xl font-bold text-foreground mb-6">Manage Carousel Images</h1>
        
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Upload New Image</h2>
            <div className="space-y-4">
              <Input
                placeholder="Caption (optional)"
                value={newCaption}
                onChange={(e) => setNewCaption(e.target.value)}
                data-testid="input-carousel-caption"
              />
              <div>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  disabled={uploading}
                  data-testid="input-carousel-upload"
                />
                {uploading && <p className="text-sm text-muted-foreground mt-2">Uploading...</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        {images.length === 0 ? (
          <div className="text-center py-16 bg-card border border-card-border rounded-lg">
            <p className="text-muted-foreground">No carousel images yet. Upload one above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {images.map((image) => (
              <Card key={image.id} data-testid={`card-carousel-${image.id}`}>
                <CardContent className="p-4">
                  <img 
                    src={image.imageUrl} 
                    alt={image.caption || "Carousel image"}
                    className="w-full h-48 object-cover rounded-md mb-3"
                  />
                  {image.caption && (
                    <p className="text-sm text-foreground mb-3" data-testid={`text-caption-${image.id}`}>{image.caption}</p>
                  )}
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteMutation.mutate(image.id)}
                    disabled={deleteMutation.isPending}
                    data-testid={`button-delete-${image.id}`}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </EditorLayout>
  );
}
