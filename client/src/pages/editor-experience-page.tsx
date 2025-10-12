import { useQuery, useMutation } from "@tanstack/react-query";
import { EditorLayout } from "./editor-page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2, ChevronUp, ChevronDown, Briefcase, Edit } from "lucide-react";
import { useState } from "react";
import type { ExperiencePosition } from "@shared/schema";

export default function EditorExperiencePage() {
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    jobTitle: "",
    company: "",
    startDate: "",
    endDate: "",
    location: "",
  });

  const { data: positions = [], isLoading } = useQuery<ExperiencePosition[]>({
    queryKey: ["/api/experience"],
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      if (!formData.jobTitle || !formData.company || !formData.startDate) {
        throw new Error("Job title, company, and start date are required");
      }

      const addRes = await apiRequest("POST", "/api/experience", {
        jobTitle: formData.jobTitle,
        company: formData.company,
        startDate: formData.startDate,
        endDate: formData.endDate || null,
        location: formData.location || null,
        order: positions.length,
      });
      return await addRes.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/experience"] });
      setFormData({ jobTitle: "", company: "", startDate: "", endDate: "", location: "" });
      toast({ title: "Success", description: "Position added" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!formData.jobTitle || !formData.company || !formData.startDate) {
        throw new Error("Job title, company, and start date are required");
      }

      const position = positions.find(p => p.id === id);
      if (!position) return;

      await apiRequest("PUT", `/api/experience/${id}`, {
        jobTitle: formData.jobTitle,
        company: formData.company,
        startDate: formData.startDate,
        endDate: formData.endDate || null,
        location: formData.location || null,
        order: position.order,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/experience"] });
      setEditingId(null);
      setFormData({ jobTitle: "", company: "", startDate: "", endDate: "", location: "" });
      toast({ title: "Success", description: "Position updated" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/experience/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/experience"] });
      toast({ title: "Success", description: "Position deleted" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const reorderMutation = useMutation({
    mutationFn: async ({ id, newOrder }: { id: string; newOrder: number }) => {
      const position = positions.find(p => p.id === id);
      if (!position) return;

      await apiRequest("PUT", `/api/experience/${id}`, {
        jobTitle: position.jobTitle,
        company: position.company,
        startDate: position.startDate,
        endDate: position.endDate,
        location: position.location,
        order: newOrder,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/experience"] });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const moveUp = (index: number) => {
    if (index === 0) return;
    const currentPosition = positions[index];
    const prevPosition = positions[index - 1];
    
    reorderMutation.mutate({ id: currentPosition.id, newOrder: prevPosition.order });
    reorderMutation.mutate({ id: prevPosition.id, newOrder: currentPosition.order });
  };

  const moveDown = (index: number) => {
    if (index === positions.length - 1) return;
    const currentPosition = positions[index];
    const nextPosition = positions[index + 1];
    
    reorderMutation.mutate({ id: currentPosition.id, newOrder: nextPosition.order });
    reorderMutation.mutate({ id: nextPosition.id, newOrder: currentPosition.order });
  };

  const startEdit = (position: ExperiencePosition) => {
    setEditingId(position.id);
    setFormData({
      jobTitle: position.jobTitle,
      company: position.company,
      startDate: position.startDate,
      endDate: position.endDate || "",
      location: position.location || "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ jobTitle: "", company: "", startDate: "", endDate: "", location: "" });
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
        <h1 className="text-3xl font-bold text-foreground mb-6">Manage Experience Timeline</h1>
        
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">
              {editingId ? "Edit Position" : "Add New Position"}
            </h2>
            <div className="space-y-4">
              <Input
                placeholder="Job Title *"
                value={formData.jobTitle}
                onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                data-testid="input-job-title"
              />
              <Input
                placeholder="Company *"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                data-testid="input-company"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="Start Date (e.g., Jan 2020) *"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  data-testid="input-start-date"
                />
                <Input
                  placeholder="End Date (e.g., Dec 2023, or leave empty for Present)"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  data-testid="input-end-date"
                />
              </div>
              <Input
                placeholder="Location (optional)"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                data-testid="input-location"
              />
              <div className="flex gap-3">
                <Button
                  onClick={() => editingId ? updateMutation.mutate(editingId) : addMutation.mutate()}
                  disabled={!formData.jobTitle || !formData.company || !formData.startDate || addMutation.isPending || updateMutation.isPending}
                  data-testid={editingId ? "button-update-position" : "button-add-position"}
                >
                  {editingId ? (
                    <>
                      <Edit className="h-4 w-4 mr-2" />
                      Update Position
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Position
                    </>
                  )}
                </Button>
                {editingId && (
                  <Button
                    variant="outline"
                    onClick={cancelEdit}
                    data-testid="button-cancel-edit"
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {positions.length === 0 ? (
          <div className="text-center py-16 bg-card border border-card-border rounded-lg">
            <p className="text-muted-foreground">No experience positions yet. Add one above.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {positions.map((position, index) => (
              <Card key={position.id} data-testid={`card-position-${position.id}`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Briefcase className="h-5 w-5 text-primary" />
                      </div>
                    </div>

                    {/* Details */}
                    <div className="flex-grow">
                      <h3 className="text-lg font-bold text-foreground" data-testid={`text-title-${position.id}`}>
                        {position.jobTitle}
                      </h3>
                      <p className="text-sm font-medium text-primary" data-testid={`text-company-${position.id}`}>
                        {position.company}
                      </p>
                      <p className="text-sm text-muted-foreground" data-testid={`text-dates-${position.id}`}>
                        {position.startDate} - {position.endDate || "Present"}
                      </p>
                      {position.location && (
                        <p className="text-sm text-muted-foreground" data-testid={`text-location-${position.id}`}>
                          {position.location}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex-shrink-0 flex flex-col gap-2">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => moveUp(index)}
                          disabled={index === 0 || reorderMutation.isPending}
                          data-testid={`button-move-up-${position.id}`}
                        >
                          <ChevronUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => moveDown(index)}
                          disabled={index === positions.length - 1 || reorderMutation.isPending}
                          data-testid={`button-move-down-${position.id}`}
                        >
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startEdit(position)}
                        data-testid={`button-edit-${position.id}`}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteMutation.mutate(position.id)}
                        disabled={deleteMutation.isPending}
                        data-testid={`button-delete-${position.id}`}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </EditorLayout>
  );
}
