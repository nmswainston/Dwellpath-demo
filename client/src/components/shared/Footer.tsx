import { cn } from "@/lib/utils";

interface FooterProps {
  className?: string;
}

export default function Footer({ className }: FooterProps) {
  return (
    <footer className={cn("w-full py-6", className)}>
      <div className="max-w-6xl mx-auto px-4 text-center text-xs text-muted-foreground">
        Crafted by{" "}
        <a
          href="https://consolelogic.net"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-4 hover:text-foreground transition-colors"
        >
          ConsoleLogic
        </a>
      </div>
    </footer>
  );
}


