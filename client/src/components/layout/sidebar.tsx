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
import { DwellpathLogo } from "@/components/branding/dwellpath-logo";

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
    href: "/",
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
      {/* Mobile overlay - only when expanded */}
      {!isCollapsed && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsCollapsed(true)}
        />
      )}
      
      {/* Sidebar */}
      <div 
        ref={sidebarRef}
        className={cn(
          "fixed left-0 top-0 z-50 h-screen nav-dwellpath shadow-xl flex flex-col transition-all duration-300",
          isCollapsed ? "w-16" : "w-72"
        )}
      >
        {/* Header */}
        <div className={cn(
          "flex items-center border-b border-border nav-dwellpath transition-all duration-300",
          isCollapsed ? "p-3 justify-center" : "p-6 justify-between"
        )}>
          <div className={cn(
            "flex items-center transition-all duration-300",
            isCollapsed ? "justify-center w-full" : "opacity-100"
          )}>
            <div 
              className={cn(
                "cursor-pointer relative transition-all duration-300 hover:scale-105",
                easterEggState.logoSpin && "animate-spin",
                easterEggState.rainbowMode && "animate-pulse",
                easterEggState.showPulse && "animate-pulse scale-110",
                easterEggState.celebrationMode && "animate-bounce"
              )}
              onClick={(e) => {
                if (isCollapsed) {
                  setIsCollapsed(false);
                } else {
                  triggerLogoEasterEgg();
                }
              }}
              onMouseEnter={triggerHoverEasterEgg}
            >
              <DwellpathLogo 
                variant={isCollapsed ? "minimal" : "default"} 
                size="md"
                className={cn(
                  easterEggState.rainbowMode && "text-rainbow animate-bounce",
                  easterEggState.showZapEffect && "animate-ping"
                )}
              />
              
              {/* Sparkle overlay */}
              {easterEggState.showSparkles && (
                <div className="absolute inset-0 pointer-events-none">
                  <Sparkles className="absolute top-0 left-0 w-3 h-3 text-yellow-300 animate-ping" />
                  <Sparkles className="absolute top-1 right-0 w-2 h-2 text-blue-300 animate-ping animation-delay-100" />
                  <Sparkles className="absolute bottom-0 left-1 w-2 h-2 text-purple-300 animate-ping animation-delay-200" />
                  <Sparkles className="absolute bottom-1 right-1 w-3 h-3 text-pink-300 animate-ping animation-delay-300" />
                </div>
              )}

              {/* Zap Effect */}
              {easterEggState.showZapEffect && (
                <div className="absolute inset-0 pointer-events-none">
                  <Zap className="absolute -top-2 -left-2 w-6 h-6 text-yellow-400 animate-ping" />
                  <Zap className="absolute -top-2 -right-2 w-4 h-4 text-blue-400 animate-ping animation-delay-100" />
                  <Zap className="absolute -bottom-2 -left-2 w-5 h-5 text-purple-400 animate-ping animation-delay-200" />
                  <Zap className="absolute -bottom-2 -right-2 w-3 h-3 text-pink-400 animate-ping animation-delay-300" />
                </div>
              )}

              {/* Celebration stars */}
              {easterEggState.celebrationMode && (
                <div className="absolute inset-0 pointer-events-none">
                  <Star className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-4 text-yellow-300 animate-bounce" />
                  <Star className="absolute top-1/2 -left-3 -translate-y-1/2 w-3 h-3 text-blue-300 animate-bounce animation-delay-100" />
                  <Star className="absolute top-1/2 -right-3 -translate-y-1/2 w-3 h-3 text-purple-300 animate-bounce animation-delay-200" />
                  <Star className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-4 h-4 text-pink-300 animate-bounce animation-delay-300" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Alerts Section - consistent height regardless of state */}
        {activeAlertsCount > 0 && (
          <div className={cn(
            "border-b border-border transition-all duration-300",
            isCollapsed ? "flex justify-center py-3" : "p-4"
          )}>
            {isCollapsed ? (
              <div className="relative">
                <AlertTriangle className="w-6 h-6 text-orange-500" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {activeAlertsCount}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2 p-2 rounded-lg bg-orange-50 text-orange-700 border border-orange-200">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm font-medium">
                  {activeAlertsCount} Alert{activeAlertsCount !== 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <nav className={cn(
          "flex-1 overflow-y-auto scrollbar-hide transition-all duration-300",
          isCollapsed ? "px-1 py-4" : "p-4"
        )}>
          <div className="space-y-2">
            {navigationItems.map((item) => {
              const isActive = location === item.href || 
                (item.href !== "/" && location.startsWith(item.href));
              
              return (
                <div
                  key={item.name}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    // Trigger easter egg
                    triggerNavEasterEgg(item.name);
                    // Navigate directly without expanding sidebar
                    navigate(item.href);
                  }}
                >
                  <div 
                    className={cn(
                    "group relative flex items-center rounded-xl transition-all duration-300 cursor-pointer overflow-hidden hover:scale-105 active:scale-95",
                    isActive 
                      ? "bg-brand-accent dark:bg-accent text-white shadow-lg shadow-gold/25" 
                      : "hover:bg-brand-accent/10 dark:hover:bg-accent/20 text-brand-primary dark:text-accent hover:text-brand-accent dark:hover:text-accent",
                    isCollapsed ? "w-12 h-12 mx-auto justify-center" : "px-3 py-3 space-x-3",
                    (navClickCounts[item.name] ?? 0) >= 5 && "animate-pulse"
                  )}
                  >
                    {/* Icon */}
                    <div className={cn(
                      "flex items-center justify-center transition-all duration-300",
                      isCollapsed ? "w-full h-full" : "w-5 h-5"
                    )}>
                      <item.icon className={cn(
                        "transition-all duration-300 group-hover:scale-110",
                        isCollapsed ? "w-5 h-5" : "w-5 h-5",
                        isActive 
                          ? "text-white" 
                          : "text-brand-primary dark:text-accent group-hover:text-brand-accent dark:group-hover:text-accent"
                      )} />
                    </div>
                    
                    {/* Content - Hidden when collapsed */}
                    <div className={cn(
                      "flex-1 transition-all duration-300 overflow-hidden",
                      isCollapsed ? "w-0 opacity-0" : "opacity-100"
                    )}>
                      <div className="flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                          <p className={cn(
                            "font-medium text-sm truncate",
                            isActive ? "text-white" : "text-brand-text-light dark:text-brand-text-dark"
                          )}>
                            {item.name}
                          </p>
                          <p className={cn(
                            "text-xs opacity-75 truncate",
                            isActive ? "text-white/90" : "text-brand-text-light/60 dark:text-brand-text-dark/60"
                          )}>
                            {item.description}
                          </p>
                        </div>
                        
                        {item.badge && (
                          <Badge 
                            variant={isActive ? "secondary" : "outline"} 
                            className="text-xs ml-2 flex-shrink-0"
                          >
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Tooltip for collapsed state */}
                    {isCollapsed && (
                      <div className="absolute left-16 top-1/2 -translate-y-1/2 bg-brand-bg-dark dark:bg-brand-bg-dark text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 delay-300 pointer-events-none whitespace-nowrap z-50 shadow-lg">
                        <div className="font-medium">{item.name}</div>
                        <div className="text-brand-text-dark/70 dark:text-brand-text-dark/60 text-xs">{item.description}</div>
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-brand-bg-dark dark:bg-brand-bg-dark rotate-45"></div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </nav>

        {/* Collapse Toggle */}
        <div className={cn(
          "border-t border-blue-200/60 transition-all duration-300",
          isCollapsed ? "p-2" : "p-4"
        )}>
          <div className="group relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className={cn(
                "text-brand-primary dark:text-accent hover:text-brand-accent dark:hover:text-accent hover:bg-brand-accent/10 dark:hover:bg-accent/20 transition-all duration-200",
                isCollapsed ? "w-12 h-12 p-0 justify-center mx-auto rounded-xl" : "w-full justify-start"
              )}
            >
              {isCollapsed ? (
                <ChevronRight className="w-5 h-5" />
              ) : (
                <>
                  <ChevronRight className="w-4 h-4 mr-2 rotate-180" />
                  Collapse sidebar
                </>
              )}
            </Button>
            
            {/* Tooltip for collapsed toggle */}
            {isCollapsed && (
              <div className="absolute left-16 top-1/2 -translate-y-1/2 bg-slate-900 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 delay-300 pointer-events-none whitespace-nowrap z-50 shadow-lg">
                <div className="font-medium">Expand sidebar</div>
                <div className="text-slate-300 text-xs">Show navigation details</div>
                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-slate-900 rotate-45"></div>
              </div>
            )}
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
                  i % 4 === 0 && "text-pink-400 animation-delay-100",
                  i % 4 === 1 && "text-red-500 animation-delay-200", 
                  i % 4 === 2 && "text-rose-400 animation-delay-300",
                  i % 4 === 3 && "text-pink-500 animation-delay-400",
                  HEART_RAIN_LAYOUT[i]?.left,
                  HEART_RAIN_LAYOUT[i]?.delay,
                  HEART_RAIN_LAYOUT[i]?.size
                )}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}