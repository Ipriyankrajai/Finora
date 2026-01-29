import Link from "next/link";

import { cn } from "@/lib/utils";

interface LogoProps {
  /** Show subtitle "finance clarity" */
  showSubtitle?: boolean;
  /** Size variant */
  size?: "sm" | "default" | "lg";
  /** Additional className for the container */
  className?: string;
  /** Disable link (just render logo without Link wrapper) */
  asLink?: boolean;
}

const sizeConfig = {
  sm: {
    box: "size-8",
    letter: "text-sm",
    title: "text-base",
    subtitle: "text-[8px]",
    offset:
      "translate-x-0.5 translate-y-0.5 group-hover:translate-x-1 group-hover:translate-y-1",
  },
  default: {
    box: "size-10",
    letter: "text-base",
    title: "text-lg",
    subtitle: "text-[9px]",
    offset:
      "translate-x-1 translate-y-1 group-hover:translate-x-1.5 group-hover:translate-y-1.5",
  },
  lg: {
    box: "size-12",
    letter: "text-lg",
    title: "text-xl",
    subtitle: "text-[10px]",
    offset:
      "translate-x-1.5 translate-y-1.5 group-hover:translate-x-2 group-hover:translate-y-2",
  },
};

export function Logo({
  showSubtitle = true,
  size = "default",
  className,
  asLink = true,
}: LogoProps) {
  const config = sizeConfig[size];

  const content = (
    <div className={cn("inline-flex items-center gap-3 group", className)}>
      {/* Logo mark */}
      <div
        className={cn(
          "relative flex items-center justify-center",
          config.box
        )}
      >
        {/* Shadow/offset layer */}
        <div
          className={cn(
            "absolute inset-0 border transition-transform",
            config.offset,
            "border-emerald-500/30 dark:border-emerald-500/40"
          )}
        />
        {/* Main box */}
        <div
          className={cn(
            "absolute inset-0 border transition-colors",
            "border-foreground/30 bg-background group-hover:border-foreground/50"
          )}
        />
        {/* Letter */}
        <span
          className={cn(
            "relative font-bold tracking-tighter",
            config.letter,
            "text-foreground"
          )}
        >
          F
        </span>
      </div>

      {/* Wordmark */}
      <div className="flex flex-col">
        <span
          className={cn(
            "font-semibold tracking-tight leading-none",
            config.title,
            "text-foreground"
          )}
        >
          Finora
        </span>
        {showSubtitle && (
          <span
            className={cn(
              "tracking-widest uppercase mt-0.5",
              config.subtitle,
              "text-muted-foreground"
            )}
          >
            finance clarity
          </span>
        )}
      </div>
    </div>
  );

  if (!asLink) {
    return content;
  }

  return <Link href="/">{content}</Link>;
}

export default Logo;
