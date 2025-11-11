import { Card } from "@/components/ui/card";

interface InfoCardProps {
  title: string;
  items: string[];
}

/**
 * Information card component for PDF tool pages
 */
export function InfoCard({ title, items }: InfoCardProps) {
  return (
    <div className="p-4 bg-surface rounded-lg space-y-2">
      <p className="text-sm font-medium text-foreground">{title}</p>
      <ul className="text-xs text-muted-foreground space-y-1 ml-4 list-disc">
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
