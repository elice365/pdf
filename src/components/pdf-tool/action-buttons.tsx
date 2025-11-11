import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { LucideIcon } from "lucide-react";

interface ActionButtonsProps {
  primaryAction: {
    label: string;
    icon?: LucideIcon;
    onClick: () => void;
    disabled?: boolean;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

/**
 * Action buttons component for PDF tool pages
 */
export function ActionButtons({
  primaryAction,
  secondaryAction,
  className = "flex justify-center gap-3",
}: ActionButtonsProps) {
  const PrimaryIcon = primaryAction.icon || Download;

  return (
    <div className={className}>
      <Button
        onClick={primaryAction.onClick}
        disabled={primaryAction.disabled}
        className="bg-primary text-primary-foreground hover:bg-primary/90"
      >
        <PrimaryIcon className="w-4 h-4 mr-2" />
        {primaryAction.label}
      </Button>

      {secondaryAction && (
        <Button variant="outline" onClick={secondaryAction.onClick}>
          {secondaryAction.label}
        </Button>
      )}
    </div>
  );
}
