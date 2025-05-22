
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, Home, Settings, Package, FileText, Users } from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const { user, logout, isRole } = useAuth();

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <div className="hidden md:flex w-64 flex-col border-r">
      <div className="px-4 py-6">
        <h2 className="text-2xl font-semibold flex items-center gap-2 text-brand-700">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          AccessManager
        </h2>
      </div>
      
      <div className="px-4 py-2">
        <p className="text-sm text-muted-foreground">Welcome,</p>
        <p className="font-medium">{user?.username}</p>
        <p className="text-xs text-muted-foreground mt-1">
          Role: {user?.role}
        </p>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-1">
        <Link 
          to="/dashboard" 
          className={cn("nav-link", isActive("/dashboard") && "active")}
        >
          <Home className="h-4 w-4" />
          Dashboard
        </Link>

        {/* Show software management for Admins only */}
        {isRole('Admin') && (
          <Link 
            to="/create-software" 
            className={cn("nav-link", isActive("/create-software") && "active")}
          >
            <Settings className="h-4 w-4" />
            Create Software
          </Link>
        )}

        {/* Show software list for all users */}
        <Link 
          to="/software" 
          className={cn("nav-link", isActive("/software") && "active")}
        >
          <Package className="h-4 w-4" />
          Software List
        </Link>

        {/* Show request access for employees */}
        {isRole('Employee') && (
          <Link 
            to="/request-access" 
            className={cn("nav-link", isActive("/request-access") && "active")}
          >
            <FileText className="h-4 w-4" />
            Request Access
          </Link>
        )}

        {/* Show pending requests for managers */}
        {isRole('Manager') && (
          <Link 
            to="/pending-requests" 
            className={cn("nav-link", isActive("/pending-requests") && "active")}
          >
            <Users className="h-4 w-4" />
            Pending Requests
          </Link>
        )}
      </nav>
      
      <div className="mt-auto px-4 py-4 border-t">
        <Button 
          variant="ghost" 
          className="w-full justify-start text-muted-foreground"
          onClick={logout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
