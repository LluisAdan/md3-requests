import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Link, useLocation } from 'react-router-dom';
import { FileText, Plus, LogOut, Inbox } from 'lucide-react';

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const { signOut } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Inbox className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-semibold text-foreground">Requests Portal</span>
              </Link>
              
              <nav className="hidden md:flex items-center gap-1">
                <Link to="/">
                  <Button 
                    variant={isActive('/') ? 'secondary' : 'ghost'} 
                    size="sm"
                    className="gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    Requests
                  </Button>
                </Link>
                <Link to="/new">
                  <Button 
                    variant={isActive('/new') ? 'secondary' : 'ghost'} 
                    size="sm"
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    New Request
                  </Button>
                </Link>
              </nav>
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
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
};
