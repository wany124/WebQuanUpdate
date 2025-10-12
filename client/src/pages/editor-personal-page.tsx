import { useQuery, useMutation } from "@tanstack/react-query";
import { EditorLayout } from "./editor-page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPersonalInfoSchema, type InsertPersonalInfo, type PersonalInfo } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, Trash2 } from "lucide-react";
import { useState } from "react";

export default function EditorPersonalPage() {
  const { toast } = useToast();
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");

  const { data: personalInfo, isLoading } = useQuery<PersonalInfo>({
    queryKey: ["/api/personal-info"],
  });

  const form = useForm<InsertPersonalInfo & { id?: string }>({
    resolver: zodResolver(insertPersonalInfoSchema),
    values: personalInfo || {
      name: "",
      title: "",
      tagline: "",
      bio: "",
      email: "",
      phone: "",
      officeLocation: "",
      photoUrl: "",
      interests: [],
      education: [],
      experience: [],
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: InsertPersonalInfo & { id?: string }) => {
      // Upload photo if new file selected
      if (photoFile) {
        const formData = new FormData();
        formData.append("file", photoFile);
        const uploadRes = await apiRequest("POST", "/api/upload/image", formData);
        const { url } = await uploadRes.json();
        data.photoUrl = url;
      }

      const res = await apiRequest(
        personalInfo ? "PUT" : "POST",
        "/api/personal-info",
        data
      );
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/personal-info"] });
      setPhotoFile(null);
      setPhotoPreview("");
      toast({ title: "Success", description: "Personal information updated" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const onSubmit = (data: InsertPersonalInfo & { id?: string }) => {
    saveMutation.mutate(data);
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
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
      <div className="p-8 max-w-4xl">
        <h1 className="text-3xl font-bold text-foreground mb-6">Edit Personal Information</h1>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Photo Upload */}
            <div className="space-y-2">
              <FormLabel>Profile Photo</FormLabel>
              <div className="flex items-center gap-4">
                {(photoPreview || form.watch("photoUrl")) && (
                  <img 
                    src={photoPreview || form.watch("photoUrl")} 
                    alt="Profile"
                    className="w-24 h-24 rounded-lg object-cover"
                  />
                )}
                <div>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoSelect}
                    className="mb-2"
                    data-testid="input-photo-upload"
                  />
                  <p className="text-xs text-muted-foreground">Upload a profile photo</p>
                </div>
              </div>
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} data-testid="input-name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title/Position</FormLabel>
                  <FormControl>
                    <Input {...field} data-testid="input-title" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tagline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tagline (optional)</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ""} data-testid="input-tagline" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Biography</FormLabel>
                  <FormControl>
                    <Textarea {...field} className="min-h-[200px]" data-testid="input-bio" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} data-testid="input-email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone (optional)</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ""} data-testid="input-phone" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="officeLocation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Office Location (optional)</FormLabel>
                  <FormControl>
                    <Textarea {...field} value={field.value || ""} rows={2} data-testid="input-office" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="interests"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Research Interests (one per line)</FormLabel>
                  <FormControl>
                    <Textarea
                      value={(field.value || []).join("\n")}
                      onChange={(e) => field.onChange(e.target.value.split("\n").filter(Boolean))}
                      className="min-h-[100px]"
                      data-testid="input-interests"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="education"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Education (one per line)</FormLabel>
                  <FormControl>
                    <Textarea
                      value={(field.value || []).join("\n")}
                      onChange={(e) => field.onChange(e.target.value.split("\n").filter(Boolean))}
                      className="min-h-[100px]"
                      data-testid="input-education"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="experience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Experience (one per line)</FormLabel>
                  <FormControl>
                    <Textarea
                      value={(field.value || []).join("\n")}
                      onChange={(e) => field.onChange(e.target.value.split("\n").filter(Boolean))}
                      className="min-h-[100px]"
                      data-testid="input-experience"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={saveMutation.isPending} data-testid="button-save">
                {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </EditorLayout>
  );
}
