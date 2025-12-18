import { cn } from "@/lib/utils";
import { SelectItem } from "@/components/ui/select";

type StateSelectItemProps = {
  value: string;
  stateCode: string;
  label: string;
  className?: string;
};

export function StateSelectItem({
  value,
  stateCode,
  label,
  className,
}: StateSelectItemProps) {
  return (
    <SelectItem value={value} textValue={label} className={cn("py-2", className)}>
      <span className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 bg-brand-accent dark:bg-accent rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-lg flex-shrink-0">
          {stateCode.toUpperCase()}
        </div>
        <span className="truncate">{label}</span>
      </span>
    </SelectItem>
  );
}


