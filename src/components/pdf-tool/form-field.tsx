import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { FormFieldData } from "@/hooks/use-form-analyzer";

interface FormFieldProps {
  field: FormFieldData;
  index: number;
  onUpdate: (index: number, value: string | boolean) => void;
}

/**
 * Form field component for rendering different types of PDF form fields
 */
export function FormField({ field, index, onUpdate }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={`field-${index}`} className="text-sm font-medium">
        {field.name}
        <span className="ml-2 text-xs text-muted-foreground">
          (
          {field.type === "text"
            ? "텍스트"
            : field.type === "checkbox"
              ? "체크박스"
              : "라디오 버튼"}
          )
        </span>
      </Label>

      {field.type === "text" && (
        <Input
          id={`field-${index}`}
          type="text"
          value={field.value as string}
          onChange={(e) => onUpdate(index, e.target.value)}
          placeholder={`${field.name} 입력`}
        />
      )}

      {field.type === "checkbox" && (
        <div className="flex items-center space-x-2">
          <input
            id={`field-${index}`}
            type="checkbox"
            checked={field.value as boolean}
            onChange={(e) => onUpdate(index, e.target.checked)}
            className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary"
          />
          <label
            htmlFor={`field-${index}`}
            className="text-sm text-muted-foreground"
          >
            체크
          </label>
        </div>
      )}

      {field.type === "radio" && field.options && (
        <div className="space-y-2">
          {field.options.map((option) => (
            <div key={option} className="flex items-center space-x-2">
              <input
                type="radio"
                id={`field-${index}-${option}`}
                name={`field-${index}`}
                value={option}
                checked={field.value === option}
                onChange={(e) => onUpdate(index, e.target.value)}
                className="w-4 h-4 border-border text-primary focus:ring-2 focus:ring-primary"
              />
              <label
                htmlFor={`field-${index}-${option}`}
                className="text-sm text-muted-foreground"
              >
                {option}
              </label>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
