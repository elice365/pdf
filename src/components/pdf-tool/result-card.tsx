import { Card } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

interface ResultCardProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  description?: string;
  children?: React.ReactNode;
}

/**
 * Result card component for displaying successful processing results
 */
export function ResultCard({
  icon: Icon,
  title,
  subtitle,
  description,
  children,
}: ResultCardProps) {
  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-green-500" aria-hidden="true" />
        </div>
        <div>
          <p className="font-medium text-foreground">{title}</p>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
      </div>

      {description && (
        <div className="p-4 bg-surface rounded-lg">
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      )}

      {children}
    </Card>
  );
}
