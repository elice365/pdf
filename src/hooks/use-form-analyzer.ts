import { useState, useCallback } from "react";
import {
  PDFDocument,
  type PDFTextField,
  type PDFCheckBox,
  type PDFRadioGroup,
} from "pdf-lib";
import { usePdfTool } from "./use-pdf-tool";

export interface FormFieldData {
  name: string;
  type: "text" | "checkbox" | "radio";
  value: string | boolean;
  options?: string[];
}

/**
 * Custom hook for PDF form analysis and filling
 */
export function useFormAnalyzer() {
  const tool = usePdfTool({ operationName: "PDF 양식 분석" });
  const [formFields, setFormFields] = useState<FormFieldData[]>([]);
  const [fieldsDetected, setFieldsDetected] = useState(false);
  const [filledPdfUrl, setFilledPdfUrl] = useState<string>("");
  const [completed, setCompleted] = useState(false);

  const analyzeForm = useCallback(async () => {
    if (!tool.validateFiles()) return;

    try {
      tool.startProcessing("PDF 양식 분석");
      tool.updateProgress(20);

      const arrayBuffer = await tool.firstFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);

      tool.updateProgress(40);

      const form = pdfDoc.getForm();
      const fields = form.getFields();

      tool.updateProgress(60);

      const detectedFields: FormFieldData[] = [];

      for (const field of fields) {
        const fieldName = field.getName();
        const fieldType = field.constructor.name;

        if (fieldType === "PDFTextField") {
          const textField = field as PDFTextField;
          detectedFields.push({
            name: fieldName,
            type: "text",
            value: textField.getText() || "",
          });
        } else if (fieldType === "PDFCheckBox") {
          const checkbox = field as PDFCheckBox;
          detectedFields.push({
            name: fieldName,
            type: "checkbox",
            value: checkbox.isChecked(),
          });
        } else if (fieldType === "PDFRadioGroup") {
          const radioGroup = field as PDFRadioGroup;
          const options = radioGroup.getOptions();
          detectedFields.push({
            name: fieldName,
            type: "radio",
            value: radioGroup.getSelected() || "",
            options,
          });
        }
      }

      if (detectedFields.length === 0) {
        tool.setError("이 PDF에는 채울 수 있는 양식 필드가 없습니다.");
        return;
      }

      setFormFields(detectedFields);
      setFieldsDetected(true);
      tool.updateProgress(100);
    } catch (error) {
      console.error("양식 분석 오류:", error);
      tool.setError(
        "양식 분석 중 오류가 발생했습니다. AcroForm이 포함된 PDF인지 확인해주세요."
      );
    } finally {
      tool.finishProcessing();
    }
  }, [tool]);

  const fillForm = useCallback(async () => {
    if (!tool.validateFiles() || formFields.length === 0) {
      tool.setError("양식을 먼저 분석해주세요.");
      return;
    }

    try {
      tool.startProcessing("양식 채우기");
      tool.updateProgress(20);

      const arrayBuffer = await tool.firstFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);

      tool.updateProgress(40);

      const form = pdfDoc.getForm();

      for (const fieldData of formFields) {
        try {
          const field = form.getField(fieldData.name);

          if (fieldData.type === "text") {
            const textField = field as PDFTextField;
            textField.setText(fieldData.value as string);
          } else if (fieldData.type === "checkbox") {
            const checkbox = field as PDFCheckBox;
            if (fieldData.value === true) {
              checkbox.check();
            } else {
              checkbox.uncheck();
            }
          } else if (fieldData.type === "radio") {
            const radioGroup = field as PDFRadioGroup;
            if (fieldData.value) {
              radioGroup.select(fieldData.value as string);
            }
          }
        } catch (error) {
          console.warn(`필드 ${fieldData.name} 처리 중 오류:`, error);
        }
      }

      tool.updateProgress(70);

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as BlobPart], {
        type: "application/pdf",
      });
      const url = URL.createObjectURL(blob);

      setFilledPdfUrl(url);
      setCompleted(true);
      tool.updateProgress(100);
    } catch (error) {
      console.error("양식 채우기 오류:", error);
      tool.setError("양식 채우기 중 오류가 발생했습니다.");
    } finally {
      tool.finishProcessing();
    }
  }, [tool, formFields]);

  const updateField = useCallback((index: number, value: string | boolean) => {
    setFormFields((prev) => {
      const updated = [...prev];
      updated[index].value = value;
      return updated;
    });
  }, []);

  const reset = useCallback(() => {
    if (filledPdfUrl) {
      URL.revokeObjectURL(filledPdfUrl);
    }
    setFormFields([]);
    setFieldsDetected(false);
    setFilledPdfUrl("");
    setCompleted(false);
    tool.reset();
  }, [filledPdfUrl, tool]);

  return {
    ...tool,
    formFields,
    fieldsDetected,
    filledPdfUrl,
    completed,
    analyzeForm,
    fillForm,
    updateField,
    reset,
  };
}
