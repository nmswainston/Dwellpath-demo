import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DwellpathLogoProps {
  variant?: 'default' | 'minimal' | 'wordmark';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function DwellpathLogo({ 
  variant = 'default', 
  size = 'md',
  className 
}: DwellpathLogoProps) {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl'
  };

  const iconSizes = {
    sm: 18,
    md: 24,
    lg: 32,
    xl: 40
  };

  if (variant === 'minimal') {
    return (
      <div className={cn('flex items-center justify-center', className)}>
        <div className="relative">
          <MapPin 
            size={iconSizes[size]} 
            className="text-brand-primary dark:text-accent fill-current" 
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-bold text-background">D</span>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'wordmark') {
    return (
      <div className={cn('flex items-center space-x-2', className)}>
        <span className={cn('dwellpath-logo font-heading text-brand-primary dark:text-foreground', sizeClasses[size])}>
          dwellpath
        </span>
      </div>
    );
  }

  return (
    <div className={cn('flex items-center space-x-3', className)}>
      <div className="relative">
        <MapPin 
          size={iconSizes[size]} 
          className="text-brand-primary dark:text-accent" 
        />
        <div className="absolute top-1 left-1/2 transform -translate-x-1/2">
          <div className="w-1 h-1 bg-brand-primary dark:bg-accent rounded-full opacity-60"></div>
        </div>
      </div>
      <span className={cn('dwellpath-logo font-heading text-brand-primary dark:text-foreground', sizeClasses[size])}>
        dwellpath
      </span>
    </div>
  );
}