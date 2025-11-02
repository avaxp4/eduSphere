import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { Button } from "@/components/ui/button";
import { BookOpen, LogOut, User } from "lucide-react";
import { Link } from "react-router-dom";

export const Header = () => {
  const { user, signOut } = useAuth();
  const { isTeacher, isAdmin } = useUserRole(user?.id);

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 shadow-soft">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold">
          <div className="gradient-hero p-2 rounded-lg">
            <BookOpen className="h-6 w-6 text-white" />
          </div>
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            EduSphere
          </span>
        </Link>

        {user && (
          <nav className="flex items-center gap-4">
            {(isTeacher || isAdmin) && (
              <Link to="/teacher">
                <Button variant="ghost" size="sm">
                  لوحة المعلم
                </Button>
              </Link>
            )}
            {isAdmin && (
              <Link to="/admin">
                <Button variant="ghost" size="sm">
                  لوحة المشرف
                </Button>
              </Link>
            )}
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-muted">
              <User className="h-4 w-4" />
              <span className="text-sm">{user.email}</span>
            </div>
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </nav>
        )}
      </div>
    </header>
  );
};
