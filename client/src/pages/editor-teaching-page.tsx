import { useQuery, useMutation } from "@tanstack/react-query";
import { EditorLayout } from "./editor-page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCourseSchema, type InsertCourse, type Course } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Edit, Trash2 } from "lucide-react";
import { useState } from "react";

export default function EditorTeachingPage() {
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const { data: courses = [], isLoading } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  const form = useForm<InsertCourse>({
    resolver: zodResolver(insertCourseSchema),
    defaultValues: {
      courseCode: "",
      title: "",
      semester: "",
      description: "",
      syllabusUrl: "",
      materialsLink: "",
      order: 0,
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: InsertCourse) => {
      const res = await apiRequest(
        editingId ? "PUT" : "POST",
        editingId ? `/api/courses/${editingId}` : "/api/courses",
        data
      );
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      setEditingId(null);
      setShowForm(false);
      form.reset();
      toast({ title: "Success", description: editingId ? "Course updated" : "Course added" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/courses/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      toast({ title: "Success", description: "Course deleted" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const startEdit = (item: Course) => {
    setEditingId(item.id);
    setShowForm(true);
    form.reset({
      courseCode: item.courseCode,
      title: item.title,
      semester: item.semester,
      description: item.description || "",
      syllabusUrl: item.syllabusUrl || "",
      materialsLink: item.materialsLink || "",
      order: item.order,
    });
  };

  const onSubmit = (data: InsertCourse) => {
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
          <h1 className="text-3xl font-bold text-foreground">Manage Teaching</h1>
          <Button 
            onClick={() => { setShowForm(!showForm); setEditingId(null); form.reset(); }}
            data-testid="button-add-course"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Course
          </Button>
        </div>

        {showForm && (
          <Card className="p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">{editingId ? "Edit" : "Add"} Course</h2>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="courseCode" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Course Code</FormLabel>
                      <FormControl><Input {...field} placeholder="e.g. CS 101" data-testid="input-course-code" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="semester" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Semester</FormLabel>
                      <FormControl><Input {...field} placeholder="e.g. Fall 2024" data-testid="input-semester" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="title" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl><Input {...field} data-testid="input-title" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (optional)</FormLabel>
                    <FormControl><Textarea {...field} value={field.value || ""} className="min-h-[100px]" data-testid="input-description" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="flex gap-2">
                  <Button type="submit" disabled={saveMutation.isPending} data-testid="button-save-course">
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

        {courses.length === 0 ? (
          <div className="text-center py-16 bg-card border border-card-border rounded-lg">
            <p className="text-muted-foreground">No courses added yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {courses.map((item) => (
              <Card key={item.id} className="p-6" data-testid={`card-course-${item.id}`}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-1">{item.courseCode}: {item.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{item.semester}</p>
                    {item.description && <p className="text-sm text-foreground">{item.description}</p>}
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
