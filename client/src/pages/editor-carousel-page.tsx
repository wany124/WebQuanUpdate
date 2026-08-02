import { useState, useEffect } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  Edit, 
  Plus, 
  Trash2, 
  Upload, 
  ArrowUp, 
  ArrowDown,
  FileText,
  X
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { useToast } from "../hooks/use-toast";
import type { CarouselImage } from "@shared/schema";

interface CarouselImageWithPDF extends CarouselImage {
  pdfUrl?: string;
  pdfTitle?: string;
}

interface ImageCarouselProps {
  images: CarouselImageWithPDF[];
  onUpdateCaption?: (index: number, newCaption: string) => void;
}

export function ImageCarousel({ images, onUpdateCaption }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [tempCaption, setTempCaption] = useState("");

  const next = () => setCurrentIndex((prev) => (prev + 1) % images.length);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);

  useEffect(() => {
    if (images.length === 0) return;
    const interval = setInterval(next, 5000);
    return () => clearInterval(interval);
  }, [images.length]);

  useEffect(() => {
    setTempCaption(images[currentIndex]?.caption || "");
    setIsEditing(false);
  }, [currentIndex, images]);

  if (images.length === 0) {
    return (
      <div className="w-full aspect-[21/9] bg-muted rounded-lg flex items-center justify-center">
        <p className="text-muted-foreground">No images available</p>
      </div>
    );
  }

  const handleConfirm = () => {
    if (onUpdateCaption) onUpdateCaption(currentIndex, tempCaption);
    setIsEditing(false);
  };

  const currentImage = images[currentIndex];

  return (
    <div className="relative w-full rounded-lg overflow-hidden bg-black">
      {/* Image container with full-scale display */}
      <div className="relative w-full aspect-[16/9] md:aspect-[21/9] overflow-hidden flex items-center justify-center">
        <img
          src={currentImage.imageUrl}
          alt={currentImage.caption || `Slide ${currentIndex + 1}`}
          className="w-full h-full object-contain"
        />
      </div>

      {/* Caption and PDF section */}
      <div className="bg-gradient-to-t from-black/90 to-black/50 px-6 py-6 space-y-3">
        {isEditing ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={tempCaption || ""}
              onChange={(e) => setTempCaption(e.target.value)}
              className="flex-1 px-3 py-2 rounded text-black"
              placeholder="Enter caption"
            />
            <Button size="sm" onClick={handleConfirm} variant="default">
              <Check className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsEditing(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <p className="text-white text-lg font-medium">{currentImage.caption || "No caption"}</p>
              
              {/* PDF Link */}
              {currentImage.pdfUrl && currentImage.pdfTitle && (
                <a
                  href={currentImage.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors mt-2"
                >
                  <FileText className="h-4 w-4" />
                  <span className="text-sm hover:underline">{currentImage.pdfTitle}</span>
                </a>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={() => setIsEditing(true)}
            >
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {images.length > 1 && (
        <>
          <Button
            variant="outline"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 border-white/20 text-white hover:bg-black/70 z-10"
            onClick={prev}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 border-white/20 text-white hover:bg-black/70 z-10"
            onClick={next}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {images.map((_, idx) => (
              <button
                key={idx}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentIndex ? "bg-white w-6" : "bg-white/50"
                }`}
                onClick={() => setCurrentIndex(idx)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function EditorCarouselPage() {
  const [images, setImages] = useState<CarouselImageWithPDF[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingImage, setEditingImage] = useState<CarouselImageWithPDF | null>(null);
  const [formData, setFormData] = useState({
    imageUrl: "",
    caption: "",
    order: 0,
    pdfUrl: "",
    pdfTitle: ""
  });
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  // Fetch carousel images
  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const response = await fetch("/api/carousel");
      if (response.ok) {
        const data = await response.json();
        setImages(data);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch carousel images",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File, type: 'image' | 'pdf') => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const endpoint = type === 'image' ? "/api/upload/image" : "/api/upload/pdf";
      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const { url } = await response.json();
        if (type === 'image') {
          setFormData(prev => ({ ...prev, imageUrl: url }));
        } else {
          setFormData(prev => ({ ...prev, pdfUrl: url }));
        }
        toast({
          title: "Success",
          description: `${type === 'image' ? 'Image' : 'PDF'} uploaded successfully`,
        });
      } else {
        throw new Error("Upload failed");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to upload ${type}`,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingImage ? `/api/carousel/${editingImage.id}` : "/api/carousel";
      const method = editingImage ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchImages();
        setIsDialogOpen(false);
        setEditingImage(null);
        setFormData({ imageUrl: "", caption: "", order: 0, pdfUrl: "", pdfTitle: "" });
        toast({
          title: "Success",
          description: editingImage ? "Image updated successfully" : "Image added successfully",
        });
      } else {
        throw new Error("Failed to save");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save image",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (image: CarouselImageWithPDF) => {
    setEditingImage(image);
    setFormData({
      imageUrl: image.imageUrl,
      caption: image.caption,
      order: image.order,
      pdfUrl: image.pdfUrl || "",
      pdfTitle: image.pdfTitle || ""
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this image?")) return;

    try {
      const response = await fetch(`/api/carousel/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchImages();
        toast({
          title: "Success",
          description: "Image deleted successfully",
        });
      } else {
        throw new Error("Failed to delete");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete image",
        variant: "destructive",
      });
    }
  };

  const handleReorder = async (index: number, direction: 'up' | 'down') => {
    const newImages = [...images];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex < 0 || newIndex >= newImages.length) return;

    [newImages[index], newImages[newIndex]] = [newImages[newIndex], newImages[index]];
    
    newImages.forEach((img, idx) => {
      img.order = idx;
    });

    setImages(newImages);

    try {
      for (const img of newImages) {
        await fetch(`/api/carousel/${img.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ order: img.order }),
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reorder images",
        variant: "destructive",
      });
      fetchImages();
    }
  };

  const handleUpdateCaption = async (index: number, newCaption: string) => {
    const image = images[index];
    if (!image) return;

    try {
      const response = await fetch(`/api/carousel/${image.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ caption: newCaption }),
      });

      if (response.ok) {
        await fetchImages();
        toast({
          title: "Success",
          description: "Caption updated successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update caption",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Carousel Editor</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingImage(null);
              setFormData({ imageUrl: "", caption: "", order: images.length, pdfUrl: "", pdfTitle: "" });
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Image
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingImage ? "Edit Image" : "Add New Image"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Image Upload */}
              <div className="space-y-2">
                <Label htmlFor="image">Image *</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, 'image');
                    }}
                    disabled={uploading}
                  />
                  {uploading && <div className="text-sm text-muted-foreground">Uploading...</div>}
                </div>
                {formData.imageUrl && (
                  <div className="mt-2">
                    <img
                      src={formData.imageUrl}
                      alt="Preview"
                      className="w-full h-32 object-cover rounded"
                    />
                  </div>
                )}
              </div>
              
              {/* Caption */}
              <div className="space-y-2">
                <Label htmlFor="caption">Caption</Label>
                <Input
                  id="caption"
                  value={formData.caption || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, caption: e.target.value }))}
                  placeholder="Enter image caption"
                />
              </div>

              {/* Order */}
              <div className="space-y-2">
                <Label htmlFor="order">Order</Label>
                <Input
                  id="order"
                  type="number"
                  value={formData.order || 0}
                  onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                  placeholder="Display order"
                />
              </div>

              {/* PDF Upload */}
              <div className="space-y-2 border-t pt-4">
                <Label htmlFor="pdf">PDF (Optional)</Label>
                <div className="text-sm text-muted-foreground mb-2">
                  Upload lecture slides PDF to link with this image
                </div>
                <div className="flex items-center space-x-2">
                  <Input
                    id="pdf"
                    type="file"
                    accept=".pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, 'pdf');
                    }}
                    disabled={uploading}
                  />
                </div>
                {formData.pdfUrl && (
                  <div className="text-sm text-green-600 flex items-center gap-2 mt-2">
                    <FileText className="h-4 w-4" />
                    PDF uploaded
                  </div>
                )}
              </div>

              {/* PDF Title */}
              {formData.pdfUrl && (
                <div className="space-y-2">
                  <Label htmlFor="pdfTitle">PDF Link Text</Label>
                  <Input
                    id="pdfTitle"
                    value={formData.pdfTitle || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, pdfTitle: e.target.value }))}
                    placeholder="e.g., 'View Lecture Slides'"
                  />
                </div>
              )}

              {/* Buttons */}
              <div className="flex justify-end space-x-2 border-t pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={!formData.imageUrl}>
                  {editingImage ? "Update" : "Add"} Image
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <ImageCarousel 
            images={images} 
            onUpdateCaption={handleUpdateCaption}
          />
        </CardContent>
      </Card>

      {/* Image List */}
      <Card>
        <CardHeader>
          <CardTitle>Manage Images ({images.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {images.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No images yet. Add your first image to get started.
            </div>
          ) : (
            <div className="space-y-4">
              {images.map((image, index) => (
                <div key={image.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                  <img
                    src={image.imageUrl}
                    alt={image.caption}
                    className="w-20 h-20 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{image.caption || "No caption"}</p>
                    <p className="text-sm text-muted-foreground">Order: {image.order}</p>
                    {image.pdfUrl && (
                      <a
                        href={image.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-500 hover:underline flex items-center gap-1 mt-1"
                      >
                        <FileText className="h-3 w-3" />
                        {image.pdfTitle || "View PDF"}
                      </a>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReorder(index, 'up')}
                      disabled={index === 0}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReorder(index, 'down')}
                      disabled={index === images.length - 1}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(image)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(image.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}