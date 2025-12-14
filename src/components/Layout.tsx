import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { GlobalUploadBar } from './GlobalUploadBar';
import { Search, User, ChevronLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const canGoBack = location.key !== 'default';
  const showBackButton = location.pathname !== '/dashboard';

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header with global upload */}
        <header className="border-b border-border bg-card/80 backdrop-blur-sm">
          <div className="h-14 px-4 flex items-center justify-between gap-4">
            {/* Left: Back navigation */}
            <div className="flex items-center gap-2">
              {showBackButton && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => canGoBack ? navigate(-1) : navigate('/dashboard')}
                    className="gap-1.5 text-muted-foreground hover:text-foreground"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Back</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate('/dashboard')}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Home className="w-4 h-4" />
                  </Button>
                  <div className="h-6 w-px bg-border mx-2" />
                </>
              )}
              
              <div className="relative hidden md:block">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="search-global"
                  type="search"
                  placeholder="Search ideas..."
                  className="input-field pl-9 w-48"
                  aria-label="Global search"
                />
              </div>
            </div>
            
            <button
              id="user-menu"
              className="w-8 h-8 rounded-full bg-gradient-to-br from-solar-gold to-solar-orange flex items-center justify-center hover:opacity-90 focus-ring"
              aria-label="User menu"
            >
              <User className="w-4 h-4 text-white" />
            </button>
          </div>
          
          {/* Global Upload Bar */}
          <div className="px-4 pb-3">
            <GlobalUploadBar />
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-auto p-6 bg-gradient-to-br from-background via-background to-primary/3">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
