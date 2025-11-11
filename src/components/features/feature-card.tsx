import type { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export function FeatureCard({
  icon: Icon,
  title,
  description,
}: FeatureCardProps) {
  return (
    <article className="group rounded-lg border border-border bg-white dark:bg-surface p-6 transition-all duration-200 hover:shadow-md dark:hover:bg-surface/80">
      <div className="flex flex-col">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-primary/10 dark:bg-primary/20">
          <Icon className="h-6 w-6 text-primary" aria-hidden="true" />
        </div>
        <h3 className="mb-2 text-lg font-bold text-foreground dark:text-foreground">
          {title}
        </h3>
        <p className="text-sm leading-relaxed text-muted-foreground dark:text-muted-foreground">
          {description}
        </p>
      </div>
    </article>
  );
}
