import { useState, useEffect, useRef } from "react";
import { useSidebar } from "@/hooks/useSidebar";
import { Link, useLocation } from "wouter";
import { 
  Home, 
  Calendar, 
  Receipt, 
  BookOpen, 
  Bot, 
  Download, 
  Settings,
  MapPin,
  AlertTriangle,
  TrendingUp,
  FileCheck,
  ChevronRight,
  Sparkles,
  Heart,
  Zap,
  Star,
  Crown,
  Building
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { DwellpathLogo } from "@/components/branding/DwellpathLogo";

const HEART_RAIN_LAYOUT: Array<{ left: string; delay: string; size: string }> = [
  { left: "left-[10%]", delay: "", size: "h-3 w-3" },
  { left: "left-[18%]", delay: "anim-delay-100", size: "h-4 w-4" },
  { left: "left-[26%]", delay: "anim-delay-200", size: "h-3 w-3" },
  { left: "left-[34%]", delay: "anim-delay-300", size: "h-5 w-5" },
  { left: "left-[42%]", delay: "anim-delay-400", size: "h-4 w-4" },
  { left: "left-[50%]", delay: "anim-delay-100", size: "h-3 w-3" },
  { left: "left-[58%]", delay: "anim-delay-200", size: "h-4 w-4" },
  { left: "left-[66%]", delay: "anim-delay-300", size: "h-3 w-3" },
  { left: "left-[74%]", delay: "anim-delay-400", size: "h-5 w-5" },
  { left: "left-[82%]", delay: "anim-delay-100", size: "h-4 w-4" },
  { left: "left-[90%]", delay: "anim-delay-200", size: "h-3 w-3" },
  { left: "left-[14%]", delay: "anim-delay-300", size: "h-4 w-4" },
];

const navigationItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: Home,
    description: "Overview & analytics"
  },
  {
    name: "Log Days",
    href: "/log-days",
    icon: Calendar,
    description: "Track residency days"
  },
  {
    name: "Expenses",
    href: "/expenses",
    icon: Receipt,
    description: "Track state expenses"
  },
  {
    name: "Journal",
    href: "/journal",
    icon: BookOpen,
    description: "Secure travel logs"
  },
  {
    name: "AI Assistant",
    href: "/ai-assistant", 
    icon: Bot,
    description: "Ask Dwellpath AI",
    badge: "AI"
  },
  {
    name: "Export",
    href: "/export",
    icon: Download,
    description: "Data export"
  },
  {
    name: "Audit Prep",
    href: "/audit-prep",
    icon: FileCheck,
    description: "PDF audit bundles"
  },
  {
    name: "Scorecard",
    href: "/scorecard", 
    icon: TrendingUp,
    description: "Risk assessment dashboard"
  },
  {
    name: "Properties",
    href: "/properties",
    icon: Building,
    description: "Manage real estate portfolio"
  },
  {
    name: "Premium",
    href: "/premium",
    icon: Crown,
    description: "Upgrade to premium features"
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
    description: "Customize your experience"
  }
];

export default function Sidebar() {
  const [location, navigate] = useLocation();
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const sidebarRef = useRef<HTMLDivElement>(null);
  
  // Easter egg animation states
  const [easterEggState, setEasterEggState] = useState({
    clickCount: 0,
    showSparkles: false,
    showHeartRain: false,
    logoSpin: false,
    rainbowMode: false,
    lastClickTime: 0,
    showPulse: false,
    showZapEffect: false,
    celebrationMode: false
  });
  
  // Get alerts count for badge
  const { data: alerts = [] } = useQuery({
    queryKey: ["/api/alerts"],
    select: (data: any) => data?.filter((alert: any) => !alert.isRead) || [],
  });

  const activeAlertsCount = alerts.length;
  const hasAlerts = activeAlertsCount > 0;

  // Click outside to close sidebar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        !isCollapsed && 
        sidebarRef.current && 
        !sidebarRef.current.contains(event.target as Node)
      ) {
        setIsCollapsed(true);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCollapsed, setIsCollapsed]);

  // Easter egg functions
  const triggerLogoEasterEgg = () => {
    const now = Date.now();
    const timeSinceLastClick = now - easterEggState.lastClickTime;
    
    // Reset click count if more than 3 seconds between clicks
    const newClickCount = timeSinceLastClick > 3000 ? 1 : easterEggState.clickCount + 1;
    
    setEasterEggState(prev => ({
      ...prev,
      clickCount: newClickCount,
      lastClickTime: now
    }));

    // Different animations based on click count
    if (newClickCount === 3) {
      // Triple click: Sparkle explosion with pulse
      setEasterEggState(prev => ({ ...prev, showSparkles: true, logoSpin: true, showPulse: true }));
      setTimeout(() => setEasterEggState(prev => ({ ...prev, showSparkles: false, logoSpin: false, showPulse: false })), 2000);
    } else if (newClickCount === 5) {
      // Five clicks: Heart rain with zap effect
      setEasterEggState(prev => ({ ...prev, showHeartRain: true, showZapEffect: true }));
      setTimeout(() => setEasterEggState(prev => ({ ...prev, showHeartRain: false, showZapEffect: false })), 3000);
    } else if (newClickCount === 7) {
      // Seven clicks: Rainbow celebration mode
      setEasterEggState(prev => ({ ...prev, rainbowMode: true, celebrationMode: true, clickCount: 0 }));
      setTimeout(() => setEasterEggState(prev => ({ ...prev, rainbowMode: false, celebrationMode: false })), 5000);
    } else {
      // Any click: subtle pulse
      setEasterEggState(prev => ({ ...prev, showPulse: true }));
      setTimeout(() => setEasterEggState(prev => ({ ...prev, showPulse: false })), 300);
    }
  };

  const triggerHoverEasterEgg = () => {
    // Subtle sparkle on hover after 2 seconds
    setTimeout(() => {
      setEasterEggState(prev => ({ ...prev, showSparkles: true }));
      setTimeout(() => setEasterEggState(prev => ({ ...prev, showSparkles: false })), 800);
    }, 2000);
  };

  // Konami code easter egg
  const [konamiCode, setKonamiCode] = useState<string[]>([]);
  const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const newSequence = [...konamiCode, e.code].slice(-10);
      setKonamiCode(newSequence);
      
      if (JSON.stringify(newSequence) === JSON.stringify(konamiSequence)) {
        // Secret Konami code activated! Ultimate celebration mode
        setEasterEggState(prev => ({ 
          ...prev, 
          showSparkles: true, 
          showHeartRain: true, 
          logoSpin: true, 
          rainbowMode: true,
          showZapEffect: true,
          celebrationMode: true,
          showPulse: true
        }));
        setTimeout(() => {
          setEasterEggState(prev => ({ 
            ...prev, 
            showSparkles: false, 
            showHeartRain: false, 
            logoSpin: false, 
            rainbowMode: false,
            showZapEffect: false,
            celebrationMode: false,
            showPulse: false
          }));
        }, 7000);
        setKonamiCode([]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [konamiCode]);

  // Navigation item easter egg
  const [navClickCounts, setNavClickCounts] = useState<Record<string, number>>({});
  
  const triggerNavEasterEgg = (itemName: string) => {
    const count = (navClickCounts[itemName] || 0) + 1;
    setNavClickCounts(prev => ({ ...prev, [itemName]: count }));
    
    if (count === 10) {
      // 10 clicks on same nav item triggers celebration
      setEasterEggState(prev => ({ ...prev, showSparkles: true }));
      setTimeout(() => setEasterEggState(prev => ({ ...prev, showSparkles: false })), 1500);
    }
  };

  return (
    <>
      {/* Mobile overlay - kept mounted so close/open fades smoothly */}
      <div
        className={cn(
          "fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden",
          "transition-opacity duration-300 ease-out",
          isCollapsed ? "opacity-0 pointer-events-none" : "opacity-100"
        )}
        onClick={() => setIsCollapsed(true)}
        aria-hidden={isCollapsed}
      />
      
      {/* Sidebar */}
      <aside 
        ref={sidebarRef}
        className={cn(
          "fixed left-0 top-0 z-50 h-screen nav-dwellpath shadow-xl overflow-hidden",
          "grid grid-rows-[var(--app-shell-sidebar-header-h)_var(--app-shell-sidebar-alerts-h)_1fr_var(--app-shell-sidebar-footer-h)]",
          "transition-[width] duration-300 ease-out will-change-[width]",
          isCollapsed ? "w-16" : "w-72"
        )}
      >
        {/* Header */}
        <div className="h-[var(--app-shell-sidebar-header-h)] border-b border-border px-3 flex items-center">
          <div className="flex items-center w-full justify-start">
            <div 
              className={cn(
                "cursor-pointer relative transition-transform duration-300 hover:scale-105 flex items-center",
                easterEggState.logoSpin && "animate-spin",
                easterEggState.rainbowMode && "animate-pulse",
                easterEggState.showPulse && "animate-pulse scale-110",
                easterEggState.celebrationMode && "animate-bounce"
              )}
              onClick={() => {
                if (isCollapsed) {
                  setIsCollapsed(false);
                } else {
                  triggerLogoEasterEgg();
                }
              }}
              onMouseEnter={triggerHoverEasterEgg}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  if (isCollapsed) {
                    setIsCollapsed(false);
                  } else {
                    triggerLogoEasterEgg();
                  }
                }
              }}
            >
              <span className="relative w-10 h-10 flex items-center justify-center rounded-xl">
                <DwellpathLogo 
                  variant="minimal"
                  size="md"
                  className={cn(
                    easterEggState.rainbowMode && "text-rainbow animate-bounce",
                    easterEggState.showZapEffect && "animate-ping"
                  )}
                />
              </span>

              <span
                className={cn(
                  "inline-block dwellpath-logo font-heading uppercase tracking-wider text-base whitespace-nowrap overflow-hidden",
                  // Only animate smoothly-interpolated props; avoid layout “jumps”.
                  "transition-[opacity,max-width,margin] duration-300 ease-out",
                  isCollapsed ? "opacity-0 max-w-0 ml-0" : "opacity-100 max-w-[180px] ml-3"
                )}
              >
                DWELLPATH
              </span>
              
              {/* Sparkle overlay */}
              {easterEggState.showSparkles && (
                <div className="absolute inset-0 pointer-events-none">
                  <Sparkles className="absolute top-0 left-0 w-3 h-3 text-muted-foreground/25 animate-pulse" />
                  <Sparkles className="absolute top-1 right-0 w-2 h-2 text-muted-foreground/20 animate-pulse anim-delay-100" />
                  <Sparkles className="absolute bottom-0 left-1 w-2 h-2 text-muted-foreground/20 animate-pulse anim-delay-200" />
                  <Sparkles className="absolute bottom-1 right-1 w-3 h-3 text-muted-foreground/25 animate-pulse anim-delay-300" />
                </div>
              )}

              {/* Zap Effect */}
              {easterEggState.showZapEffect && (
                <div className="absolute inset-0 pointer-events-none">
                  <Zap className="absolute -top-2 -left-2 w-6 h-6 text-muted-foreground/25 animate-pulse" />
                  <Zap className="absolute -top-2 -right-2 w-4 h-4 text-muted-foreground/20 animate-pulse anim-delay-100" />
                  <Zap className="absolute -bottom-2 -left-2 w-5 h-5 text-muted-foreground/22 animate-pulse anim-delay-200" />
                  <Zap className="absolute -bottom-2 -right-2 w-3 h-3 text-muted-foreground/18 animate-pulse anim-delay-300" />
                </div>
              )}

              {/* Celebration stars */}
              {easterEggState.celebrationMode && (
                <div className="absolute inset-0 pointer-events-none">
                  <Star className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-4 text-muted-foreground/25 animate-pulse" />
                  <Star className="absolute top-1/2 -left-3 -translate-y-1/2 w-3 h-3 text-muted-foreground/20 animate-pulse anim-delay-100" />
                  <Star className="absolute top-1/2 -right-3 -translate-y-1/2 w-3 h-3 text-muted-foreground/20 animate-pulse anim-delay-200" />
                  <Star className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-4 h-4 text-muted-foreground/25 animate-pulse anim-delay-300" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Alerts Slot - fixed row height, never mounts/unmounts */}
        <div className="h-[var(--app-shell-sidebar-alerts-h)] border-b border-border px-3 flex items-center">
          {/* Collapsed alert icon/badge */}
          <div
            className={cn(
              "relative transition-all duration-200",
              isCollapsed && hasAlerts ? "opacity-100" : "opacity-0 w-0 overflow-hidden"
            )}
            aria-hidden={!(isCollapsed && hasAlerts)}
          >
            <AlertTriangle className="w-6 h-6 text-[hsl(var(--status-warning))]" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-[hsl(var(--status-warning)/0.16)] border border-[hsl(var(--status-warning)/0.25)] text-[hsl(var(--status-warning))] text-xs rounded-full flex items-center justify-center font-bold">
              {activeAlertsCount}
            </div>
          </div>

          {/* Expanded alert pill */}
          <div
            className={cn(
              "flex items-center rounded-lg bg-[hsl(var(--status-warning)/0.10)] text-[hsl(var(--status-warning))] border border-[hsl(var(--status-warning)/0.25)] h-7 px-2 transition-all duration-200 ml-0",
              !isCollapsed && hasAlerts ? "opacity-100 w-full" : "opacity-0 w-0 overflow-hidden"
            )}
            aria-hidden={!(!isCollapsed && hasAlerts)}
          >
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span className="text-sm font-medium whitespace-nowrap ml-2">
              {activeAlertsCount} Alert{activeAlertsCount !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Invisible placeholder to keep row stable when empty */}
          <div
            aria-hidden
            className={cn(
              "h-7 w-full",
              hasAlerts ? "opacity-0 w-0 overflow-hidden" : "opacity-0"
            )}
          />
        </div>

        {/* Navigation */}
        <nav
          className={cn(
            "min-h-0 overflow-y-auto scrollbar-hide py-4",
            // Collapsed: remove side padding so icons/hitboxes are centered in the full 64px rail.
            // Expanded: keep the comfortable gutter.
            "transition-[padding] duration-300 ease-out",
            isCollapsed ? "px-0" : "px-2"
          )}
        >
          <div className="space-y-2">
            {navigationItems.map((item) => {
              const isActive = location === item.href || 
                (item.href !== "/" && location.startsWith(item.href));
              
              return (
                <button
                  key={item.name}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    // Trigger easter egg
                    triggerNavEasterEgg(item.name);
                    // Navigate directly without expanding sidebar
                    navigate(item.href);
                  }}
                  type="button"
                  aria-label={item.name}
                  title={isCollapsed ? `${item.name} — ${item.description}` : item.name}
                  className={cn(
                    "group relative w-full h-10 flex items-center rounded-xl cursor-pointer overflow-hidden",
                    // Keep alignment/padding stable; animate opacity/max-width instead of non-animating layout props like justify-content.
                    "justify-start px-3 transition-[background-color,color,opacity,transform] duration-300",
                    "active:scale-95",
                    // Expanded behavior unchanged: highlight applies to the whole row.
                    !isCollapsed &&
                      (isActive
                        ? "bg-[var(--interactive-selected-bg)] text-[var(--interactive-selected-text)] shadow-sm"
                        : "hover:bg-[var(--interactive-hover-bg)] hover:text-[var(--interactive-hover-text)] text-muted-foreground"),
                    // Collapsed: keep the row clickable, but center a fixed icon hitbox and move highlight onto it.
                    isCollapsed &&
                      "bg-transparent text-muted-foreground hover:bg-transparent hover:text-[var(--interactive-hover-text)]",
                    (navClickCounts[item.name] ?? 0) >= 5 && "animate-pulse"
                  )}
                >
                  {/* Icon hitbox (collapsed): fixed square so icon + highlight are optically centered and consistent */}
                  <span
                    className={cn(
                      "shrink-0 flex items-center justify-center transition-all duration-300",
                      // Keep stable so the icon doesn’t “jump” when collapsing/expanding.
                      "w-10 h-10 rounded-xl",
                      isCollapsed &&
                        (isActive
                          ? "bg-[var(--interactive-selected-bg)] shadow-sm"
                          : "group-hover:bg-[var(--interactive-hover-bg)]")
                    )}
                  >
                    <item.icon
                      className={cn(
                        "w-5 h-5 transition-transform duration-300 group-hover:scale-110",
                        isActive
                          ? "text-[var(--interactive-selected-text)]"
                          : "text-muted-foreground group-hover:text-[var(--interactive-hover-text)]"
                      )}
                    />
                  </span>

                  {/* Label (never unmounted; hidden via width/opacity only) */}
                  <span
                    className={cn(
                      "inline-block text-sm font-medium whitespace-nowrap overflow-hidden transition-all duration-300",
                      isActive ? "text-[var(--interactive-selected-text)]" : "text-brand-text-light dark:text-brand-text-dark",
                      isCollapsed ? "opacity-0 max-w-0 ml-0" : "opacity-100 max-w-[180px] ml-3"
                    )}
                  >
                    {item.name}
                  </span>

                  {/* Badge (kept stable; hidden when collapsed) */}
                  <Badge
                    variant={isActive ? "secondary" : "outline"}
                    className={cn(
                      // IMPORTANT: don't keep `ml-auto` in collapsed mode — auto margins in a flex row
                      // will push the icon off-center even if the badge is width:0/hidden.
                      "text-xs shrink-0 transition-all duration-300",
                      !isCollapsed && "ml-auto",
                      item.badge ? "opacity-100" : "opacity-0 w-0 overflow-hidden",
                      isCollapsed && "opacity-0 w-0 overflow-hidden"
                    )}
                  >
                    {item.badge || "•"}
                  </Badge>

                  {/* Tooltip (always in DOM; only visible on hover when collapsed) */}
                  <div
                    className={cn(
                      "absolute left-16 top-1/2 -translate-y-1/2 bg-popover text-foreground border border-border text-xs px-3 py-2 rounded-lg opacity-0 transition-all duration-200 delay-300 pointer-events-none whitespace-nowrap z-50 shadow-lg",
                      isCollapsed ? "group-hover:opacity-100" : ""
                    )}
                    aria-hidden={!isCollapsed}
                  >
                    <div className="font-medium">{item.name}</div>
                    <div className="text-brand-text-dark/70 dark:text-brand-text-dark/60 text-xs">{item.description}</div>
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-popover rotate-45"></div>
                  </div>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Collapse Toggle */}
        <div
          className={cn(
            "h-[var(--app-shell-sidebar-footer-h)] border-t border-border flex items-center",
            "transition-[padding] duration-300 ease-out",
            isCollapsed ? "px-0" : "px-2"
          )}
        >
          <div className="group relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className={cn(
                "text-brand-primary dark:text-primary hover:text-[var(--interactive-hover-text)] hover:bg-[var(--interactive-hover-bg)]",
                "transition-[background-color,color,opacity,transform] duration-200",
                // Keep layout stable; let the sidebar width/padding animation do the work.
                "h-10 w-full justify-start rounded-xl gap-0 px-3 py-0"
              )}
            >
              <span className="w-10 h-10 flex items-center justify-center rounded-xl">
                <ChevronRight className={cn("w-5 h-5 transition-transform duration-200", !isCollapsed && "rotate-180")} />
              </span>
              <span
                className={cn(
                  "inline-block whitespace-nowrap overflow-hidden",
                  "transition-[opacity,max-width,margin] duration-200 ease-out",
                  isCollapsed ? "opacity-0 max-w-0 ml-0" : "opacity-100 max-w-[220px] ml-2"
                )}
              >
                Collapse sidebar
              </span>
            </Button>
            
            {/* Tooltip for collapsed toggle */}
            <div
              className={cn(
                "absolute left-16 top-1/2 -translate-y-1/2 bg-popover text-foreground border border-border text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 delay-300 pointer-events-none whitespace-nowrap z-50 shadow-lg",
                isCollapsed ? "opacity-0 group-hover:opacity-100" : "opacity-0"
              )}
              aria-hidden={!isCollapsed}
            >
              <div className="font-medium">Expand sidebar</div>
              <div className="text-muted-foreground text-xs">Show navigation details</div>
              <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-popover rotate-45"></div>
            </div>
          </div>
        </div>

        {/* Heart Rain Easter Egg */}
        {easterEggState.showHeartRain && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(12)].map((_, i) => (
              <Heart
                key={i}
                className={cn(
                  "absolute heart-fall",
                  // Easter egg should be subtle and brand-consistent (no saturated candy colors).
                  "text-muted-foreground/20",
                  i % 4 === 0 && "anim-delay-100",
                  i % 4 === 1 && "anim-delay-200", 
                  i % 4 === 2 && "anim-delay-300",
                  i % 4 === 3 && "anim-delay-400",
                  HEART_RAIN_LAYOUT[i]?.left,
                  HEART_RAIN_LAYOUT[i]?.delay,
                  HEART_RAIN_LAYOUT[i]?.size
                )}
              />
            ))}
          </div>
        )}
      </aside>
    </>
  );
}