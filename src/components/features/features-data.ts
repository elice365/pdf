import type { LucideIcon } from "lucide-react";
import { Cloud, FileText, Lock, MonitorSmartphone } from "lucide-react";

export interface FeatureCardData {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
}

export const featuresData: FeatureCardData[] = [
  {
    id: "all-devices",
    icon: MonitorSmartphone,
    title: "모든 기기에서 작동",
    description:
      "PC, 태블릿, 스마트폰 등 모든 기기에서 PDF를 편집하고 변환할 수 있습니다.",
  },
  {
    id: "free-premium",
    icon: FileText,
    title: "무료 및 프리미엄",
    description:
      "무료 계정으로 기본 기능을 사용하거나 프리미엄 플랜으로 모든 기능을 이용하세요.",
  },
  {
    id: "secure-cloud",
    icon: Lock,
    title: "안전한 클라우드",
    description:
      "모든 파일은 SSL 암호화로 안전하게 전송되며 일정 시간 후 자동으로 삭제됩니다.",
  },
  {
    id: "easy-management",
    icon: Cloud,
    title: "파일 쉽게 관리",
    description:
      "클라우드에 파일을 저장하고 언제 어디서나 쉽게 접근하고 관리할 수 있습니다.",
  },
];
