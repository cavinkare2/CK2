import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  FolderOpen,
  Mic,
  FileText,
  Brain,
  BookOpen,
  Settings,
  ChevronLeft,
  ChevronRight,
  Moon,
  Sun,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const navItems = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/projects", label: "Projects", icon: FolderOpen },
  { path: "/recordings", label: "Recordings", icon: Mic },
  { path: "/transcripts", label: "Transcripts", icon: FileText },
  { path: "/analysis", label: "Analysis", icon: Brain },
  { path: "/guides", label: "Guides", icon: BookOpen },
];

export default function AppSidebar() {
  const [location] = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [dark, setDark] = useState(() => window.matchMedia("(prefers-color-scheme: dark)").matches);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <aside
      className={`flex flex-col h-screen bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-200 ${
        collapsed ? "w-16" : "w-56"
      }`}
      data-testid="app-sidebar"
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 h-14 border-b border-sidebar-border shrink-0">
        <svg
          viewBox="0 0 32 32"
          className="w-7 h-7 shrink-0"
          aria-label="QualVault Logo"
        >
          <rect x="2" y="2" width="28" height="28" rx="6" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M8 16 L16 8 L24 16 L16 24 Z" fill="currentColor" opacity="0.3" />
          <path d="M12 16 L16 12 L20 16 L16 20 Z" fill="currentColor" />
        </svg>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="text-sm font-bold tracking-tight leading-none">QualVault</p>
            <p className="text-[10px] text-sidebar-foreground/60 mt-0.5">Consumer Insights</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location === item.path || (item.path !== "/" && location.startsWith(item.path));
          const Icon = item.icon;
          const link = (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
              }`}
              data-testid={`nav-${item.label.toLowerCase()}`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );

          if (collapsed) {
            return (
              <Tooltip key={item.path}>
                <TooltipTrigger asChild>{link}</TooltipTrigger>
                <TooltipContent side="right">{item.label}</TooltipContent>
              </Tooltip>
            );
          }
          return link;
        })}
      </nav>

      {/* Footer */}
      <div className="px-2 pb-3 space-y-1 border-t border-sidebar-border pt-3 shrink-0">
        <button
          onClick={() => setDark(!dark)}
          className="flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground transition-colors w-full"
          data-testid="btn-theme-toggle"
        >
          {dark ? <Sun className="h-4 w-4 shrink-0" /> : <Moon className="h-4 w-4 shrink-0" />}
          {!collapsed && <span>{dark ? "Light Mode" : "Dark Mode"}</span>}
        </button>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground transition-colors w-full"
          data-testid="btn-collapse-sidebar"
        >
          {collapsed ? <ChevronRight className="h-4 w-4 shrink-0" /> : <ChevronLeft className="h-4 w-4 shrink-0" />}
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
