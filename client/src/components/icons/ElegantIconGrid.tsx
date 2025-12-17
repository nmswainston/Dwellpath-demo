import {
  Globe,              // Global presence
  TrendingUp,         // Financial/legal growth
  Fingerprint,        // Identity, privacy
  ShieldCheck,        // Trust, compliance
  MousePointerClick,  // AI or insight
  Grid2X2             // Organized structure
} from "lucide-react";

interface ElegantIconGridProps {
  title?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function ElegantIconGrid({ title, size = 'md' }: ElegantIconGridProps) {
  const getIconSize = () => {
    switch (size) {
      case 'sm': return 'h-6 w-6';
      case 'lg': return 'h-10 w-10';
      default: return 'h-8 w-8';
    }
  };

  const iconClasses = `${getIconSize()} stroke-[1.5] text-brand-accent dark:text-accent transition-transform hover:scale-105`;
  
  const items = [
    { icon: <Globe className={iconClasses} />, label: 'Global Residency' },
    { icon: <TrendingUp className={iconClasses} />, label: 'Growth Tracking' },
    { icon: <Fingerprint className={iconClasses} />, label: 'Identity & Privacy' },
    { icon: <ShieldCheck className={iconClasses} />, label: 'Compliance & Protection' },
    { icon: <MousePointerClick className={iconClasses} />, label: 'AI Insights' },
    { icon: <Grid2X2 className={iconClasses} />, label: 'Organized Structure' },
  ];

  return (
    <div className="space-y-6">
      {title && (
        <h2 className="font-heading text-2xl font-bold text-brand-primary dark:text-foreground text-center">
          {title}
        </h2>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 bg-background dark:bg-card text-brand-primary dark:text-foreground p-10 rounded-2xl shadow-lg font-body">
        {items.map(({ icon, label }) => (
          <div 
            key={label} 
            className="flex items-center space-x-4 transition-transform hover:scale-105 duration-200"
          >
            {icon}
            <span className="text-lg font-medium">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}