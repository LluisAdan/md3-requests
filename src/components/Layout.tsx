import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, Inbox, LayoutDashboard, FileText, Plus } from 'lucide-react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { NavLink } from './NavLink';

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const { signOut, user } = useAuth();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        {/* Desktop sidebar - hidden on mobile */}
        <div className="hidden md:block">
          <AppSidebar />
        </div>
        
        <div className="flex-1 flex flex-col w-full min-w-0">
          {/* Desktop header */}
          <header className="hidden md:flex border-b border-border/50 bg-card/80 backdrop-blur-sm sticky top-0 z-50">
            <div className="flex items-center justify-between px-6 py-4 w-full">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="h-10 w-10" />
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md">
                    <Inbox className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-xl font-semibold text-foreground">Internal Requests Portal</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold uppercase">
                    {(user?.email?.[0] || 'U').toUpperCase()}
                  </div>
                  <span className="text-sm text-muted-foreground">{user?.email?.split('@')[0] || 'Unknown'}</span>
                </div>
                <Button
                  variant="ghost" 
                  size="sm" 
                  onClick={signOut}
                  className="gap-2 h-10 hover:bg-destructive/10 hover:text-destructive transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </div>
          </header>

          {/* Mobile top bar */}
          <header className="md:hidden border-b border-border/50 bg-card/80 backdrop-blur-sm sticky top-0 z-50">
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2 min-w-0">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Inbox className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm sm:text-base font-semibold text-foreground truncate">Requests Portal</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold uppercase">
                    {(user?.email?.[0] || 'U').toUpperCase()}
                  </div>
                  <span className="text-xs text-muted-foreground">{user?.email?.split('@')[0] || 'Unknown'}</span>
                </div>
                <Button
                  variant="ghost" 
                  size="sm" 
                  onClick={signOut}
                  className="gap-1.5 flex-shrink-0 h-9 hover:bg-destructive/10 hover:text-destructive transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline text-sm">Sign Out</span>
                </Button>
              </div>
            </div>
            
            {/* Mobile navigation */}
            <div className="flex items-center gap-2 px-4 py-2 border-t border-border/30 bg-section overflow-x-auto scrollbar-hide">
              <div className="flex items-center gap-2 min-w-max">
                <NavLink
                  to="/dashboard"
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-row-hover transition-colors whitespace-nowrap"
                  activeClassName="bg-primary/10 text-primary font-medium"
                >
                  <LayoutDashboard className="h-4 w-4 flex-shrink-0" />
                  <span>Dashboard</span>
                </NavLink>
                <NavLink
                  to="/"
                  end
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-row-hover transition-colors whitespace-nowrap"
                  activeClassName="bg-primary/10 text-primary font-medium"
                >
                  <FileText className="h-4 w-4 flex-shrink-0" />
                  <span>Requests</span>
                </NavLink>
                <NavLink
                  to="/new"
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-row-hover transition-colors whitespace-nowrap"
                  activeClassName="bg-primary/10 text-primary font-medium"
                >
                  <Plus className="h-4 w-4 flex-shrink-0" />
                  <span>New</span>
                </NavLink>
              </div>
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
