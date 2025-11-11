"use client";

import { ArrowLeft, ClipboardList, Download } from "lucide-react";
import Link from "next/link";
import {
  type PDFCheckBox,
  PDFDocument,
  type PDFRadioGroup,
  type PDFTextField,
} from "pdf-lib";
import { useState } from "react";
import { FileUpload } from "@/components/pdf/file-upload";
import { ProcessingProgress } from "@/components/pdf/processing-progress";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  resetState,
  setError,
  setOperation,
  setProcessing,
  setProgress,
} from "@/store/slices/pdfSlice";

interface FormFieldData {
  name: string;
  type: "text" | "checkbox" | "radio";
  value: string | boolean;
  options?: string[]; // For radio buttons
}

export default function FillFormPage() {
  const dispatch = useAppDispatch();
  const { files } = useAppSelector((state) => state.pdf);
  const [formFields, setFormFields] = useState<FormFieldData[]>([]);
  const [fieldsDetected, setFieldsDetected] = useState(false);
  const [filledPdfUrl, setFilledPdfUrl] = useState<string>("");
  const [completed, setCompleted] = useState(false);

  const handleAnalyzeForm = async () => {
    if (files.length === 0) {
      dispatch(setError("PDF 파일을 업로드해주세요."));
      return;
    }

    try {
      dispatch(setProcessing(true));
      dispatch(setOperation("PDF 양식 분석"));
      dispatch(setProgress(20));

      const file = files[0];
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);

      dispatch(setProgress(40));

      const form = pdfDoc.getForm();
      const fields = form.getFields();

      dispatch(setProgress(60));

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
            options: options,
          });
        }
      }

      if (detectedFields.length === 0) {
        dispatch(setError("이 PDF에는 채울 수 있는 양식 필드가 없습니다."));
        dispatch(setProcessing(false));
        return;
      }

      setFormFields(detectedFields);
      setFieldsDetected(true);
      dispatch(setProgress(100));
    } catch (error) {
      console.error("양식 분석 오류:", error);
      dispatch(
        setError(
          "양식 분석 중 오류가 발생했습니다. AcroForm이 포함된 PDF인지 확인해주세요.",
        ),
      );
    } finally {
      dispatch(setProcessing(false));
    }
  };

  const handleFieldChange = (index: number, value: string | boolean) => {
    const updatedFields = [...formFields];
    updatedFields[index].value = value;
    setFormFields(updatedFields);
  };

  const handleFillForm = async () => {
    if (files.length === 0 || formFields.length === 0) {
      dispatch(setError("양식을 먼저 분석해주세요."));
      return;
    }

    try {
      dispatch(setProcessing(true));
      dispatch(setOperation("양식 채우기"));
      dispatch(setProgress(20));

      const file = files[0];
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);

      dispatch(setProgress(40));

      const form = pdfDoc.getForm();

      // Fill each field with user input
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

      dispatch(setProgress(70));

      // Flatten the form (optional - makes fields non-editable)
      // form.flatten();

      dispatch(setProgress(90));

      // Save the filled PDF
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as BlobPart], {
        type: "application/pdf",
      });
      const url = URL.createObjectURL(blob);

      setFilledPdfUrl(url);
      setCompleted(true);
      dispatch(setProgress(100));
    } catch (error) {
      console.error("양식 채우기 오류:", error);
      dispatch(setError("양식 채우기 중 오류가 발생했습니다."));
    } finally {
      dispatch(setProcessing(false));
    }
  };

  const handleDownload = () => {
    if (!filledPdfUrl) return;

    const link = document.createElement("a");
    link.href = filledPdfUrl;
    link.download =
      files[0]?.name.replace(/\.pdf$/i, "_filled.pdf") || "filled-form.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    if (filledPdfUrl) {
      URL.revokeObjectURL(filledPdfUrl);
    }
    setFormFields([]);
    setFieldsDetected(false);
    setFilledPdfUrl("");
    setCompleted(false);
    dispatch(resetState());
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            홈으로 돌아가기
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <ClipboardList
                className="w-6 h-6 text-primary"
                aria-hidden="true"
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                양식 채우기
              </h1>
              <p className="text-muted-foreground mt-1">
                PDF 양식의 필드를 자동으로 감지하고 채우세요
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <FileUpload multiple={false} />
          </Card>

          {files.length > 0 && !fieldsDetected && !completed && (
            <Card className="p-6 space-y-6">
              <div className="p-4 bg-surface rounded-lg space-y-2">
                <p className="text-sm font-medium text-foreground">
                  양식 채우기 정보
                </p>
                <ul className="text-xs text-muted-foreground space-y-1 ml-4 list-disc">
                  <li>AcroForm 필드가 포함된 PDF만 지원됩니다</li>
                  <li>
                    텍스트 필드, 체크박스, 라디오 버튼을 자동으로 감지합니다
                  </li>
                  <li>모든 필드를 채운 후 PDF로 저장할 수 있습니다</li>
                </ul>
              </div>

              <div className="flex justify-center">
                <Button
                  size="lg"
                  onClick={handleAnalyzeForm}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <ClipboardList className="w-5 h-5 mr-2" />
                  양식 분석
                </Button>
              </div>
            </Card>
          )}

          <ProcessingProgress />

          {fieldsDetected && !completed && (
            <Card className="p-6 space-y-6">
              <div>
                <p className="text-lg font-medium text-foreground mb-4">
                  감지된 필드: {formFields.length}개
                </p>
                <div className="space-y-4">
                  {formFields.map((field, index) => (
                    <div key={index} className="space-y-2">
                      <Label
                        htmlFor={`field-${index}`}
                        className="text-sm font-medium"
                      >
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
                          onChange={(e) =>
                            handleFieldChange(index, e.target.value)
                          }
                          placeholder={`${field.name} 입력`}
                        />
                      )}

                      {field.type === "checkbox" && (
                        <div className="flex items-center space-x-2">
                          <input
                            id={`field-${index}`}
                            type="checkbox"
                            checked={field.value as boolean}
                            onChange={(e) =>
                              handleFieldChange(index, e.target.checked)
                            }
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
                            <div
                              key={option}
                              className="flex items-center space-x-2"
                            >
                              <input
                                type="radio"
                                id={`field-${index}-${option}`}
                                name={`field-${index}`}
                                value={option}
                                checked={field.value === option}
                                onChange={(e) =>
                                  handleFieldChange(index, e.target.value)
                                }
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
                  ))}
                </div>
              </div>

              <div className="flex justify-center gap-3">
                <Button
                  size="lg"
                  onClick={handleFillForm}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <ClipboardList className="w-5 h-5 mr-2" />
                  양식 채우기
                </Button>
                <Button variant="outline" onClick={handleReset}>
                  취소
                </Button>
              </div>
            </Card>
          )}

          {completed && (
            <Card className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                  <ClipboardList
                    className="w-5 h-5 text-green-500"
                    aria-hidden="true"
                  />
                </div>
                <div>
                  <p className="font-medium text-foreground">
                    양식 채우기 완료!
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formFields.length}개의 필드가 채워졌습니다
                  </p>
                </div>
              </div>

              <div className="p-4 bg-surface rounded-lg">
                <p className="text-sm text-muted-foreground">
                  모든 필드가 성공적으로 채워졌습니다.
                  <br />
                  필드는 편집 가능한 상태로 유지됩니다. 필요시 PDF 뷰어에서 추가
                  수정이 가능합니다.
                </p>
              </div>

              <div className="flex justify-center gap-3">
                <Button
                  onClick={handleDownload}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Download className="w-4 h-4 mr-2" />
                  채워진 PDF 다운로드
                </Button>
                <Button variant="outline" onClick={handleReset}>
                  다시 시작
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
