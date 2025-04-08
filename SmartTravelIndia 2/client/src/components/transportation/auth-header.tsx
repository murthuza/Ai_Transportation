import { useAuth } from "@/hooks/use-auth";
import { Button } from "../ui/button";
import { Loader2, LogOut, User } from "lucide-react";
import { useLocation } from "wouter";

export default function AuthHeader() {
  const { user, logoutMutation } = useAuth();
  const [_, navigate] = useLocation();

  if (!user) return null;

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        navigate("/auth");
      }
    });
  };

  return (
    <div className="bg-slate-50 border-b py-2 px-4 sm:px-6 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <div className="bg-primary/10 h-8 w-8 rounded-full flex items-center justify-center">
          <User size={18} className="text-primary" />
        </div>
        <span className="font-medium">{user.name || user.username}</span>
      </div>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleLogout}
        disabled={logoutMutation.isPending}
      >
        {logoutMutation.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </>
        )}
      </Button>
    </div>
  );
}