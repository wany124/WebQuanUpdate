import { useQuery, useMutation } from "@tanstack/react-query";
import { EditorLayout } from "./editor-page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, Trash2, Calendar, ChevronUp, ChevronDown } from "lucide-react";
import { useState } from "react";
import type { Event } from "@shared/schema";

export default function EditorEventsPage() {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    date: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { data: events = [], isLoading } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!selectedFile || !newEvent.title || !newEvent.date) {
        throw new Error("Title, date, and image are required");
      }

      setUploading(true);
      const formData = new FormData();
      formData.append("file", selectedFile);
      
      const uploadRes = await apiRequest("POST", "/api/upload/image", formData);
      const { url } = await uploadRes.json();
      
      const addRes = await apiRequest("POST", "/api/events", {
        title: newEvent.title,
        description: newEvent.description || null,
        date: newEvent.date,
        imageUrl: url,
        order: events.length,
      });
      return await addRes.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      setNewEvent({ title: "", description: "", date: "" });
      setSelectedFile(null);
      setUploading(false);
      toast({ title: "Success", description: "Event added" });
    },
    onError: (error: Error) => {
      setUploading(false);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/events/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({ title: "Success", description: "Event deleted" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const reorderMutation = useMutation({
    mutationFn: async ({ id, newOrder }: { id: string; newOrder: number }) => {
      const event = events.find(e => e.id === id);
      if (!event) return;

      await apiRequest("PUT", `/api/events/${id}`, {
        title: event.title,
        description: event.description,
        date: event.date,
        imageUrl: event.imageUrl,
        order: newOrder,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const moveUp = (index: number) => {
    if (index === 0) return;
    const currentEvent = events[index];
    const prevEvent = events[index - 1];
    
    reorderMutation.mutate({ id: currentEvent.id, newOrder: prevEvent.order });
    reorderMutation.mutate({ id: prevEvent.id, newOrder: currentEvent.order });
  };

  const moveDown = (index: number) => {
    if (index === events.length - 1) return;
    const currentEvent = events[index];
    const nextEvent = events[index + 1];
    
    reorderMutation.mutate({ id: currentEvent.id, newOrder: nextEvent.order });
    reorderMutation.mutate({ id: nextEvent.id, newOrder: currentEvent.order });
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
        <h1 className="text-3xl font-bold text-foreground mb-6">Manage Events Carousel</h1>
        
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Add New Event</h2>
            <div className="space-y-4">
              <Input
                placeholder="Event Title *"
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                data-testid="input-event-title"
              />
              <Input
                placeholder="Event Date (e.g., March 15, 2024) *"
                value={newEvent.date}
                onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                data-testid="input-event-date"
              />
              <Textarea
                placeholder="Event Description (optional)"
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                rows={3}
                data-testid="input-event-description"
              />
              <div>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  disabled={uploading}
                  data-testid="input-event-image"
                />
                {selectedFile && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Selected: {selectedFile.name}
                  </p>
                )}
              </div>
              <Button
                onClick={() => uploadMutation.mutate()}
                disabled={uploading || !newEvent.title || !newEvent.date || !selectedFile}
                data-testid="button-add-event"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Add Event
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {events.length === 0 ? (
          <div className="text-center py-16 bg-card border border-card-border rounded-lg">
            <p className="text-muted-foreground">No events yet. Add one above.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event, index) => (
              <Card key={event.id} data-testid={`card-event-${event.id}`}>
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Image */}
                    <div className="md:col-span-1">
                      <img 
                        src={event.imageUrl} 
                        alt={event.title}
                        className="w-full h-32 object-cover rounded-md"
                        data-testid={`img-event-${event.id}`}
                      />
                    </div>

                    {/* Details */}
                    <div className="md:col-span-2">
                      <h3 className="text-lg font-bold text-foreground mb-1" data-testid={`text-title-${event.id}`}>
                        {event.title}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <Calendar className="h-4 w-4" />
                        <span data-testid={`text-date-${event.id}`}>{event.date}</span>
                      </div>
                      {event.description && (
                        <p className="text-sm text-muted-foreground" data-testid={`text-description-${event.id}`}>
                          {event.description}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="md:col-span-1 flex flex-col gap-2">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => moveUp(index)}
                          disabled={index === 0 || reorderMutation.isPending}
                          data-testid={`button-move-up-${event.id}`}
                        >
                          <ChevronUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => moveDown(index)}
                          disabled={index === events.length - 1 || reorderMutation.isPending}
                          data-testid={`button-move-down-${event.id}`}
                        >
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteMutation.mutate(event.id)}
                        disabled={deleteMutation.isPending}
                        data-testid={`button-delete-${event.id}`}
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
