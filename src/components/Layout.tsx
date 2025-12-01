import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, Inbox, LayoutDashboard, FileText, Plus } from 'lucide-react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { NavLink } from './NavLink';

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const { signOut } = useAuth();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        {/* Desktop sidebar - hidden on mobile */}
        <div className="hidden md:block">
          <AppSidebar />
        </div>
        
        <div className="flex-1 flex flex-col w-full">
          {/* Desktop header */}
          <header className="hidden md:flex border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
            <div className="flex items-center justify-between px-4 py-4 w-full">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <Inbox className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-xl font-semibold text-foreground">Internal Requests Portal</span>
                </div>
              </div>

              <Button 
                variant="ghost" 
                size="sm" 
                onClick={signOut}
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </header>

          {/* Mobile top bar */}
          <header className="md:hidden border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
            <div className="flex items-center justify-between px-3 py-2.5">
              <div className="flex items-center gap-2 min-w-0">
                <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                  <Inbox className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm sm:text-base font-semibold text-foreground truncate">Requests Portal</span>
              </div>

              <Button 
                variant="ghost" 
                size="sm" 
                onClick={signOut}
                className="gap-1.5 flex-shrink-0 text-xs sm:text-sm"
              >
                <LogOut className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
            
            {/* Mobile navigation */}
            <div className="flex items-center gap-2 px-3 py-2 border-t border-border/50 bg-background/50 overflow-x-auto">
              <NavLink
                to="/dashboard"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs sm:text-sm hover:bg-accent/50 transition-colors whitespace-nowrap"
                activeClassName="bg-accent text-accent-foreground font-medium"
              >
                <LayoutDashboard className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                <span>Dashboard</span>
              </NavLink>
              <NavLink
                to="/"
                end
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs sm:text-sm hover:bg-accent/50 transition-colors whitespace-nowrap"
                activeClassName="bg-accent text-accent-foreground font-medium"
              >
                <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                <span>Requests</span>
              </NavLink>
              <NavLink
                to="/new"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs sm:text-sm hover:bg-accent/50 transition-colors whitespace-nowrap"
                activeClassName="bg-accent text-accent-foreground font-medium"
              >
                <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                <span>New</span>
              </NavLink>
            </div>
          </header>

          <main className="flex-1 p-4 md:p-8">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};
