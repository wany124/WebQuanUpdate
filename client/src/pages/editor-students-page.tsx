import { useQuery, useMutation } from "@tanstack/react-query";
import { EditorLayout } from "./editor-page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertStudentSchema, type InsertStudent, type Student } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Edit, Trash2, User } from "lucide-react";
import { useState } from "react";

export default function EditorStudentsPage() {
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const { data: students = [], isLoading } = useQuery<Student[]>({
    queryKey: ["/api/students"],
  });

  const form = useForm<InsertStudent>({
    resolver: zodResolver(insertStudentSchema),
    defaultValues: {
      name: "",
      researchArea: "",
      startYear: new Date().getFullYear().toString(),
      websiteUrl: "",
      status: "current",
      photoUrl: "",
      order: 0,
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: InsertStudent) => {
      // Upload photo if selected
      if (photoFile) {
        const formData = new FormData();
        formData.append("file", photoFile);
        const uploadRes = await apiRequest("POST", "/api/upload/image", formData);
        const { url } = await uploadRes.json();
        data.photoUrl = url;
      }

      const res = await apiRequest(
        editingId ? "PUT" : "POST",
        editingId ? `/api/students/${editingId}` : "/api/students",
        data
      );
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
      setEditingId(null);
      setShowForm(false);
      setPhotoFile(null);
      form.reset();
      toast({ title: "Success", description: editingId ? "Student updated" : "Student added" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/students/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
      toast({ title: "Success", description: "Student deleted" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const startEdit = (item: Student) => {
    setEditingId(item.id);
    setShowForm(true);
    form.reset({
      name: item.name,
      researchArea: item.researchArea,
      startYear: item.startYear,
      websiteUrl: item.websiteUrl || "",
      status: item.status,
      photoUrl: item.photoUrl || "",
      order: item.order,
    });
  };

  const onSubmit = (data: InsertStudent) => {
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
      <div className="p-8 max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-foreground">Manage Students</h1>
          <Button 
            onClick={() => { setShowForm(!showForm); setEditingId(null); setPhotoFile(null); form.reset(); }}
            data-testid="button-add-student"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Student
          </Button>
        </div>

        {showForm && (
          <Card className="p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">{editingId ? "Edit" : "Add"} Student</h2>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <FormLabel>Photo (optional)</FormLabel>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                    data-testid="input-photo"
                  />
                </div>
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl><Input {...field} data-testid="input-name" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="researchArea" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Research Area</FormLabel>
                    <FormControl><Textarea {...field} rows={2} data-testid="input-research-area" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="startYear" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Year</FormLabel>
                      <FormControl><Input {...field} placeholder="2024" data-testid="input-start-year" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="status" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger data-testid="select-status">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="current">Current</SelectItem>
                          <SelectItem value="alumni">Alumni</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="websiteUrl" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website (optional)</FormLabel>
                    <FormControl><Input {...field} value={field.value || ""} placeholder="https://" data-testid="input-website" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="flex gap-2">
                  <Button type="submit" disabled={saveMutation.isPending} data-testid="button-save-student">
                    {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingId(null); setPhotoFile(null); }} data-testid="button-cancel">
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </Card>
        )}

        {students.length === 0 ? (
          <div className="text-center py-16 bg-card border border-card-border rounded-lg">
            <p className="text-muted-foreground">No students added yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {students.map((item) => (
              <Card key={item.id} className="p-6" data-testid={`card-student-${item.id}`}>
                <div className="flex items-start gap-4">
                  {item.photoUrl ? (
                    <img src={item.photoUrl} alt={item.name} className="w-16 h-16 rounded-full object-cover" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
                      <User className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-1">{item.name}</h3>
                    <p className="text-sm text-muted-foreground mb-1">{item.status === "current" ? "Current Student" : "Alumni"} • Since {item.startYear}</p>
                    <p className="text-sm text-foreground">{item.researchArea}</p>
                  </div>
                  <div className="flex gap-2">
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
