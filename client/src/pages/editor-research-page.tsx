import { useQuery, useMutation } from "@tanstack/react-query";
import { EditorLayout } from "./editor-page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertResearchSchema, type InsertResearch, type Research } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Edit, Trash2 } from "lucide-react";
import { useState } from "react";

export default function EditorResearchPage() {
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const { data: research = [], isLoading } = useQuery<Research[]>({
    queryKey: ["/api/research"],
  });

  const form = useForm<InsertResearch>({
    resolver: zodResolver(insertResearchSchema),
    defaultValues: {
      title: "",
      authors: "",
      venue: "",
      date: new Date().getFullYear().toString(),
      abstract: "",
      category: "",
      tags: [],
      featured: false,
      order: 0,
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: InsertResearch) => {
      const res = await apiRequest(
        editingId ? "PUT" : "POST",
        editingId ? `/api/research/${editingId}` : "/api/research",
        data
      );
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/research"] });
      setEditingId(null);
      setShowForm(false);
      form.reset();
      toast({ title: "Success", description: editingId ? "Research updated" : "Research added" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/research/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/research"] });
      toast({ title: "Success", description: "Research deleted" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const startEdit = (item: Research) => {
    setEditingId(item.id);
    setShowForm(true);
    form.reset({
      title: item.title,
      authors: item.authors,
      venue: item.venue || "",
      date: item.date,
      abstract: item.abstract,
      pdfUrl: item.pdfUrl || "",
      externalLink: item.externalLink || "",
      thumbnailUrl: item.thumbnailUrl || "",
      citation: item.citation || "",
      category: item.category,
      tags: item.tags || [],
      featured: item.featured || false,
      order: item.order,
    });
  };

  const onSubmit = (data: InsertResearch) => {
    saveMutation.mutate(data);
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
      <div className="p-8 max-w-6xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-foreground">Manage Research</h1>
          <Button 
            onClick={() => { setShowForm(!showForm); setEditingId(null); form.reset(); }}
            data-testid="button-add-research"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Research
          </Button>
        </div>

        {showForm && (
          <Card className="p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">{editingId ? "Edit" : "Add"} Research</h2>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="title" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl><Input {...field} data-testid="input-title" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="authors" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Authors</FormLabel>
                    <FormControl><Input {...field} data-testid="input-authors" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="venue" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Venue</FormLabel>
                      <FormControl><Input {...field} value={field.value || ""} data-testid="input-venue" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="date" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year</FormLabel>
                      <FormControl><Input {...field} data-testid="input-date" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="abstract" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Abstract</FormLabel>
                    <FormControl><Textarea {...field} className="min-h-[120px]" data-testid="input-abstract" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="category" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl><Input {...field} data-testid="input-category" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="tags" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags (comma-separated)</FormLabel>
                    <FormControl>
                      <Input
                        value={Array.isArray(field.value) ? field.value.join(", ") : ""}
                        onChange={(e) => {
                          const tags = e.target.value.split(",").map(t => t.trim()).filter(Boolean);
                          field.onChange(tags);
                        }}
                        data-testid="input-tags"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="citation" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Citation (formatted bibliographic reference)</FormLabel>
                    <FormControl>
                      <Textarea {...field} value={field.value || ""} className="min-h-[80px]" placeholder="Author(s). (Year). Title. Journal, Volume(Issue), Pages. DOI" data-testid="input-citation" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="pdfUrl" render={({ field }) => (
                    <FormItem>
                      <FormLabel>PDF URL</FormLabel>
                      <FormControl><Input {...field} value={field.value || ""} placeholder="https://..." data-testid="input-pdf-url" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="externalLink" render={({ field }) => (
                    <FormItem>
                      <FormLabel>DOI / External Link</FormLabel>
                      <FormControl><Input {...field} value={field.value || ""} placeholder="https://doi.org/..." data-testid="input-external-link" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="thumbnailUrl" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image/Diagram URL</FormLabel>
                    <FormControl><Input {...field} value={field.value || ""} placeholder="https://..." data-testid="input-thumbnail-url" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="featured" render={({ field }) => (
                  <FormItem className="flex items-center gap-2">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} data-testid="checkbox-featured" />
                    </FormControl>
                    <FormLabel className="!mt-0">Featured on homepage</FormLabel>
                  </FormItem>
                )} />
                <div className="flex gap-2">
                  <Button type="submit" disabled={saveMutation.isPending} data-testid="button-save-research">
                    {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingId(null); }} data-testid="button-cancel">
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </Card>
        )}

        {research.length === 0 ? (
          <div className="text-center py-16 bg-card border border-card-border rounded-lg">
            <p className="text-muted-foreground">No research added yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {research.map((item) => (
              <Card key={item.id} className="p-6" data-testid={`card-research-${item.id}`}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{item.authors} • {item.venue} • {item.date}</p>
                    <p className="text-sm text-foreground line-clamp-2">{item.abstract}</p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button variant="outline" size="sm" onClick={() => startEdit(item)} data-testid={`button-edit-${item.id}`}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => deleteMutation.mutate(item.id)} disabled={deleteMutation.isPending} data-testid={`button-delete-${item.id}`}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </EditorLayout>
  );
}
