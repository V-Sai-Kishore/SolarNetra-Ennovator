import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, PlayCircle, FolderOpen, Settings, 
  ChevronLeft, ChevronRight, Zap, Sun, Layers, Shield, CheckCircle, BarChart3, FileText
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { ideasConfig } from '@/lib/ideas';
import { cn } from '@/lib/utils';
import { CATEGORY_COLORS, CATEGORY_ICONS } from '@/lib/types';

const mainNavItems = [
  { id: 'nav-dashboard', path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'nav-runall', path: '/run-all', icon: PlayCircle, label: 'Run All' },
  { id: 'nav-results', path: '/results', icon: FolderOpen, label: 'Results' },
];

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  detection: Sun,
  segmentation: Layers,
  quality: Shield,
  validation: CheckCircle,
  scoring: BarChart3,
  metadata: FileText,
};

export function Sidebar() {
  const { sidebarCollapsed, setSidebarCollapsed } = useApp();

  // Group ideas by category
  const groupedIdeas = ideasConfig.reduce((acc, idea) => {
    if (!acc[idea.category]) acc[idea.category] = [];
    acc[idea.category].push(idea);
    return acc;
  }, {} as Record<string, typeof ideasConfig>);

  return (
    <aside
      className={cn(
        "h-screen bg-sidebar flex flex-col border-r border-sidebar-border transition-all duration-300",
        sidebarCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="p-4 flex items-center gap-3 border-b border-sidebar-border">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-solar-gold to-solar-orange flex items-center justify-center shadow-lg shadow-solar-gold/30">
          <Zap className="w-5 h-5 text-white" />
        </div>
        {!sidebarCollapsed && (
          <div>
            <span className="font-bold text-sidebar-foreground block">SolarNetra</span>
            <span className="text-xs text-sidebar-foreground/60">v1.0</span>
          </div>
        )}
      </div>

      {/* Main nav */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        {mainNavItems.map((item) => (
          <NavLink
            key={item.id}
            id={item.id}
            to={item.path}
            className={({ isActive }) => cn(
              "sidebar-item",
              isActive && "sidebar-item-active"
            )}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!sidebarCollapsed && <span>{item.label}</span>}
          </NavLink>
        ))}

        {/* Ideas section grouped by category */}
        {!sidebarCollapsed && (
          <div className="pt-4">
            <p className="px-3 py-2 text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider">
              Analysis Ideas
            </p>
          </div>
        )}
        
        <div className="space-y-3 max-h-[calc(100vh-280px)] overflow-y-auto custom-scrollbar">
          {Object.entries(groupedIdeas).map(([category, ideas]) => {
            const CategoryIcon = categoryIcons[category] || FileText;
            const colorClass = CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS];
            
            return (
              <div key={category} className="space-y-0.5">
                {!sidebarCollapsed && (
                  <div className="flex items-center gap-2 px-3 py-1.5">
                    <CategoryIcon 
                      className="w-3.5 h-3.5" 
                      style={{ color: `hsl(var(--${colorClass}))` }} 
                    />
                    <span className="text-xs font-medium text-sidebar-foreground/70 capitalize">
                      {category}
                    </span>
                  </div>
                )}
                
                {ideas.map((idea) => (
                  <NavLink
                    key={idea.id}
                    id={`nav-idea-${idea.id}`}
                    to={`/idea/${idea.id}`}
                    className={({ isActive }) => cn(
                      "sidebar-item text-xs py-1.5",
                      isActive && "sidebar-item-active"
                    )}
                    title={idea.name}
                  >
                    <span 
                      className={cn(
                        "w-5 h-5 rounded flex items-center justify-center text-[10px] font-mono font-bold flex-shrink-0 transition-colors",
                        "bg-sidebar-accent/50 text-sidebar-foreground/70"
                      )}
                      style={{ 
                        backgroundColor: `hsl(var(--${colorClass}) / 0.15)`,
                        color: `hsl(var(--${colorClass}))`
                      }}
                    >
                      {idea.id}
                    </span>
                    {!sidebarCollapsed && (
                      <span className="truncate">{idea.shortName}</span>
                    )}
                  </NavLink>
                ))}
              </div>
            );
          })}
        </div>

        {/* Settings */}
        <div className="pt-4 border-t border-sidebar-border mt-4">
          <NavLink
            id="nav-settings"
            to="/settings"
            className={({ isActive }) => cn(
              "sidebar-item",
              isActive && "sidebar-item-active"
            )}
          >
            <Settings className="w-5 h-5 flex-shrink-0" />
            {!sidebarCollapsed && <span>Settings</span>}
          </NavLink>
        </div>
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        className="p-3 border-t border-sidebar-border hover:bg-sidebar-accent transition-colors"
        aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {sidebarCollapsed ? (
          <ChevronRight className="w-5 h-5 text-sidebar-foreground mx-auto" />
        ) : (
          <ChevronLeft className="w-5 h-5 text-sidebar-foreground" />
        )}
      </button>
    </aside>
  );
}
