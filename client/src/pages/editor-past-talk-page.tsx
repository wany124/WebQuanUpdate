import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, FileText, Calendar, Building2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { useToast } from "../hooks/use-toast";
import type { PastTalk } from "@shared/schema";

export default function EditorPastTalkPage() {
  const [talks, setTalks] = useState<PastTalk[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTalk, setEditingTalk] = useState<PastTalk | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    conference: "",
    pdfUrl: "",
    description: "",
    talkType: "",
  });
  const [uploading, setUploading] = useState(false);
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
        description: "Failed to fetch talks",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    try {
      const formDataObj = new FormData();
      formDataObj.append("file", file);

      const response = await fetch("/api/upload/pdf", {
        method: "POST",
        body: formDataObj,
      });

      if (response.ok) {
        const { url } = await response.json();
        setFormData((prev) => ({ ...prev, pdfUrl: url }));
        toast({
          title: "Success",
          description: "PDF uploaded successfully",
        });
      } else {
        throw new Error("Upload failed");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload PDF",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    // Validation
    if (!formData.title || !formData.date || !formData.pdfUrl) {
      toast({
        title: "Error",
        description: "Title, date, and PDF are required",
        variant: "destructive",
      });
      return;
    }
  
    try {
    const payload = {
        title: formData.title,
        date: new Date(formData.date).toISOString(),
        conference: formData.conference || undefined,
        pdfUrl: formData.pdfUrl,
        description: formData.description || undefined, 
        talkType: formData.talkType || undefined,
        };
  
      console.log("📤 Sending payload:", payload);  // ← ADD THIS
  
      const url = editingTalk ? `/api/talks/${editingTalk.id}` : "/api/talks";
      const method = editingTalk ? "PUT" : "POST";
  
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      
      console.log("📥 Response status:", response.status);
      const responseData = await response.json();
      console.log("📥 Response data:", responseData);
      
      if (response.ok) {
        await fetchTalks();
        setIsDialogOpen(false);
        setEditingTalk(null);
        setFormData({
          title: "",
          date: "",
          conference: "",
          pdfUrl: "",
          description: "",
          talkType: "",
        });
        toast({
          title: "Success",
          description: editingTalk ? "Talk updated successfully" : "Talk added successfully",
        });
      } else {
        throw new Error(responseData.message || "Failed to save");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save talk",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (talk: PastTalk) => {
    setEditingTalk(talk);
    const date = new Date(talk.date);
    const dateStr = date.toISOString().split("T")[0];

    setFormData({
      title: talk.title,
      date: dateStr,
      conference: talk.conference || "",
      pdfUrl: talk.pdfUrl,
      description: talk.description || "",
      talkType: talk.talkType || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this talk?")) return;

    try {
      const response = await fetch(`/api/talks/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchTalks();
        toast({
          title: "Success",
          description: "Talk deleted successfully",
        });
      } else {
        throw new Error("Failed to delete");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete talk",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
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
        <h1 className="text-3xl font-bold">Manage Past Talks</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingTalk(null);
                setFormData({
                  title: "",
                  date: "",
                  conference: "",
                  pdfUrl: "",
                  description: "",
                  talkType: "",
                });
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Talk
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingTalk ? "Edit Talk" : "Add New Talk"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Talk Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="Enter talk title"
                  required
                />
              </div>

              {/* Date */}
              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, date: e.target.value }))
                  }
                  required
                />
              </div>

              {/* Conference */}
              <div className="space-y-2">
                <Label htmlFor="conference">Conference (Optional)</Label>
                <Input
                  id="conference"
                  value={formData.conference}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      conference: e.target.value,
                    }))
                  }
                  placeholder="e.g., ICML 2024, MIT Seminar"
                />
              </div>

              {/* Talk Type */}
              <div className="space-y-2">
                <Label htmlFor="talkType">Talk Type (Optional)</Label>
                <Input
                  id="talkType"
                  value={formData.talkType}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      talkType: e.target.value,
                    }))
                  }
                  placeholder="e.g., Seminar, Conference Talk, Workshop"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Brief description of the talk"
                  className="w-full px-3 py-2 border rounded-md text-sm"
                  rows={3}
                />
              </div>

              {/* PDF Upload */}
              <div className="space-y-2">
                <Label htmlFor="pdf">PDF Slides *</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="pdf"
                    type="file"
                    accept=".pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file);
                    }}
                    disabled={uploading}
                  />
                  {uploading && (
                    <div className="text-sm text-muted-foreground">
                      Uploading...
                    </div>
                  )}
                </div>
                {formData.pdfUrl && (
                  <div className="text-sm text-green-600 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    PDF uploaded
                  </div>
                )}
              </div>

              {/* Buttons */}
              <div className="flex justify-end space-x-2 border-t pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!formData.title || !formData.date || !formData.pdfUrl}
                >
                  {editingTalk ? "Update" : "Add"} Talk
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Talks List */}
      <Card>
        <CardHeader>
          <CardTitle>All Talks ({talks.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {talks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No talks yet. Add your first talk to get started.
            </div>
          ) : (
            <div className="space-y-4">
              {talks.map((talk) => (
                <div
                  key={talk.id}
                  className="flex items-start justify-between p-4 border rounded-lg hover:bg-slate-50"
                >
                  <div className="flex-1 min-w-0 space-y-2">
                    <p className="font-medium text-lg">{talk.title}</p>

                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(talk.date)}
                      </div>
                      {talk.conference && (
                        <div className="flex items-center gap-1">
                          <Building2 className="h-4 w-4" />
                          {talk.conference}
                        </div>
                      )}
                    </div>

                    {talk.talkType && (
                      <span className="inline-block bg-slate-100 text-slate-700 text-xs font-medium px-2 py-1 rounded">
                        {talk.talkType}
                      </span>
                    )}

                    {talk.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {talk.description}
                      </p>
                    )}

                    <a
                      href={talk.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-blue-600 hover:underline text-sm"
                    >
                      <FileText className="h-3 w-3" />
                      View PDF
                    </a>
                  </div>

                  <div className="flex items-center space-x-2 ml-4 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(talk)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(talk.id)}
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