import { cn } from '@/lib/utils';
import { LogoIcon } from '@/components/branding/LogoIcon';

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
  const sizeConfig = {
    sm: { 
      iconSize: 32,
      textSize: 'text-base',
      spacing: 'space-y-1'
    },
    md: { 
      iconSize: 48,
      textSize: 'text-xl',
      spacing: 'space-y-1.5'
    },
    lg: { 
      iconSize: 64,
      textSize: 'text-2xl',
      spacing: 'space-y-2'
    },
    xl: { 
      iconSize: 80,
      textSize: 'text-3xl',
      spacing: 'space-y-2.5'
    }
  };

  const config = sizeConfig[size];

  // Minimal variant - just the circular emblem
  if (variant === 'minimal') {
    return (
      <div className={cn('flex items-center justify-center', className)}>
        <LogoIcon size={config.iconSize as 32 | 48 | 64 | 80} alt="Dwellpath emblem" />
      </div>
    );
  }

  // Wordmark variant - just the text
  if (variant === 'wordmark') {
    return (
      <div className={cn('flex items-center', 'text-brand-cream', className)}>
        <span className={cn('dwellpath-logo font-heading uppercase tracking-wider', config.textSize)}>
          DWELLPATH
        </span>
      </div>
    );
  }

  // Default variant - full logo with emblem and text
  return (
    <div className={cn('flex flex-col items-center justify-center', config.spacing, 'text-brand-cream', className)}>
      <LogoIcon size={config.iconSize as 32 | 48 | 64 | 80} alt="Dwellpath emblem" />
      <span className={cn('dwellpath-logo font-heading uppercase tracking-wider', config.textSize)}>
        DWELLPATH
      </span>
    </div>
  );
}