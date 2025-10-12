import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema, type InsertUser } from "@shared/schema";
import { Redirect } from "wouter";
import { Loader2 } from "lucide-react";
import { useState } from "react";

export default function AuthPage() {
  const { user, isLoading, loginMutation, registerMutation } = useAuth();
  const [isRegister, setIsRegister] = useState(false);

  const form = useForm<InsertUser>({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user) {
    return <Redirect to="/editor" />;
  }

  const onSubmit = (data: InsertUser) => {
    if (isRegister) {
      registerMutation.mutate(data);
    } else {
      loginMutation.mutate(data);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Form Column */}
      <div className="flex-1 flex items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">{isRegister ? "Create Account" : "Editor Login"}</CardTitle>
            <CardDescription>
              {isRegister ? "Register to access the editor" : "Sign in to manage the portfolio content"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="username" {...field} data-testid="input-username" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} data-testid="input-password" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loginMutation.isPending || registerMutation.isPending}
                  data-testid={isRegister ? "button-register" : "button-login"}
                >
                  {(loginMutation.isPending || registerMutation.isPending) ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    isRegister ? "Register" : "Sign In"
                  )}
                </Button>
              </form>
            </Form>
            <div className="mt-4 text-center text-sm">
              <Button
                variant="link"
                className="text-muted-foreground"
                onClick={() => setIsRegister(!isRegister)}
                data-testid="button-toggle-auth"
              >
                {isRegister ? "Already have an account? Sign in" : "Need an account? Register"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Hero Column */}
      <div className="hidden lg:flex flex-1 bg-slate-900 items-center justify-center p-12">
        <div className="max-w-md text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Content Management System</h1>
          <p className="text-lg text-slate-300">
            Manage your academic portfolio with ease. Edit personal information, research publications, teaching courses, and student profiles.
          </p>
        </div>
      </div>
    </div>
  );
}
