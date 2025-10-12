import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Home, FileText, BookOpen, Users, Image as ImageIcon, LogOut } from "lucide-react";

interface EditorLayoutProps {
  children: React.ReactNode;
}

function EditorLayout({ children }: EditorLayoutProps) {
  const { logoutMutation } = useAuth();
  const [location] = useLocation();

  const navItems = [
    { path: "/editor", label: "Dashboard", icon: Home },
    { path: "/editor/personal", label: "Personal Info", icon: Users },
    { path: "/editor/carousel", label: "Carousel", icon: ImageIcon },
    { path: "/editor/research", label: "Research", icon: FileText },
    { path: "/editor/teaching", label: "Teaching", icon: BookOpen },
    { path: "/editor/students", label: "Students", icon: Users },
  ];

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <div className="w-64 bg-card border-r border-card-border flex flex-col">
        <div className="p-6 border-b border-card-border">
          <h1 className="text-xl font-bold text-foreground">Content Editor</h1>
          <p className="text-sm text-muted-foreground mt-1">Portfolio Management</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            return (
              <Link key={item.path} href={item.path}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  data-testid={`link-editor-${item.label.toLowerCase().replace(" ", "-")}`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-card-border space-y-2">
          <Button variant="outline" className="w-full" asChild data-testid="button-view-site">
            <Link href="/">View Public Site</Link>
          </Button>
          <Button variant="destructive" className="w-full" onClick={handleLogout} data-testid="button-logout">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}

export default function EditorPage() {
  return (
    <EditorLayout>
      <div className="p-8">
        <h1 className="text-3xl font-bold text-foreground mb-6">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/editor/personal">
            <div className="p-6 bg-card border border-card-border rounded-lg hover:shadow-lg transition-shadow cursor-pointer" data-testid="card-personal-info">
              <Users className="h-8 w-8 text-primary mb-3" />
              <h2 className="text-xl font-semibold mb-2">Personal Info</h2>
              <p className="text-sm text-muted-foreground">Edit biography, photo, and contact details</p>
            </div>
          </Link>

          <Link href="/editor/carousel">
            <div className="p-6 bg-card border border-card-border rounded-lg hover:shadow-lg transition-shadow cursor-pointer" data-testid="card-carousel">
              <ImageIcon className="h-8 w-8 text-primary mb-3" />
              <h2 className="text-xl font-semibold mb-2">Carousel Images</h2>
              <p className="text-sm text-muted-foreground">Manage homepage slideshow images</p>
            </div>
          </Link>

          <Link href="/editor/research">
            <div className="p-6 bg-card border border-card-border rounded-lg hover:shadow-lg transition-shadow cursor-pointer" data-testid="card-research">
              <FileText className="h-8 w-8 text-primary mb-3" />
              <h2 className="text-xl font-semibold mb-2">Research</h2>
              <p className="text-sm text-muted-foreground">Add and edit research papers and projects</p>
            </div>
          </Link>

          <Link href="/editor/teaching">
            <div className="p-6 bg-card border border-card-border rounded-lg hover:shadow-lg transition-shadow cursor-pointer" data-testid="card-teaching">
              <BookOpen className="h-8 w-8 text-primary mb-3" />
              <h2 className="text-xl font-semibold mb-2">Teaching</h2>
              <p className="text-sm text-muted-foreground">Manage courses and syllabi</p>
            </div>
          </Link>

          <Link href="/editor/students">
            <div className="p-6 bg-card border border-card-border rounded-lg hover:shadow-lg transition-shadow cursor-pointer" data-testid="card-students">
              <Users className="h-8 w-8 text-primary mb-3" />
              <h2 className="text-xl font-semibold mb-2">Students</h2>
              <p className="text-sm text-muted-foreground">Manage PhD student profiles</p>
            </div>
          </Link>
        </div>
      </div>
    </EditorLayout>
  );
}

export { EditorLayout };
