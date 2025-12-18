import { cn } from '@/lib/utils';

const sizeClassMap = {
  16: 'w-4 h-4',
  20: 'w-5 h-5',
  24: 'w-6 h-6',
  28: 'w-7 h-7',
  32: 'w-8 h-8',
  48: 'w-12 h-12',
  60: 'w-[60px] h-[60px]',
  64: 'w-16 h-16',
  80: 'w-20 h-20',
} as const;

type LogoIconSize = keyof typeof sizeClassMap;

interface LogoIconProps {
  /** Logical size in CSS pixels (maps to Tailwind width/height utilities). */
  size?: LogoIconSize;
  /** If true, renders as decorative (alt="" + aria-hidden). */
  decorative?: boolean;
  /** Used when `decorative` is false. Defaults to "Dwellpath". */
  alt?: string;
  className?: string;
}

export function LogoIcon({
  size = 24,
  decorative = false,
  alt = 'Dwellpath',
  className,
}: LogoIconProps) {
  return (
    <img
      src="/branding/dwellpath-logo-icon.svg"
      alt={decorative ? '' : alt}
      aria-hidden={decorative ? 'true' : undefined}
      draggable={false}
      className={cn(
        'block select-none shrink-0 aspect-square object-contain object-center',
        sizeClassMap[size],
        className
      )}
    />
  );
}


