/**
 * Footer links data structure
 * Organized by section: Product, Company, Help & Resources
 */

export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterSection {
  title: string;
  links: FooterLink[];
}

/**
 * Product Links - All PDF tools and features
 */
export const productLinks: FooterLink[] = [
  { label: "모든 PDF 도구", href: "/tools" },
  { label: "PDF 합치기", href: "/merge-pdf" },
  { label: "PDF 나누기", href: "/split-pdf" },
  { label: "PDF 압축", href: "/compress-pdf" },
  { label: "PDF 변환", href: "/convert-pdf" },
  { label: "PDF 편집", href: "/edit-pdf" },
  { label: "PDF 서명", href: "/sign-pdf" },
  { label: "Watermark PDF", href: "/watermark-pdf" },
];

/**
 * Company Links - About, careers, media, etc.
 */
export const companyLinks: FooterLink[] = [
  { label: "회사 소개", href: "/about" },
  { label: "블로그", href: "/blog" },
  { label: "채용", href: "/careers" },
  { label: "미디어 키트", href: "/media-kit" },
  { label: "제휴 프로그램", href: "/affiliate" },
  { label: "API 개발자", href: "/developers" },
];

/**
 * Help & Resources Links - Support, legal, etc.
 */
export const helpLinks: FooterLink[] = [
  { label: "고객 지원", href: "/support" },
  { label: "FAQ", href: "/faq" },
  { label: "가격", href: "/pricing" },
  { label: "문의하기", href: "/contact" },
  { label: "개인정보처리방침", href: "/privacy" },
  { label: "이용약관", href: "/terms" },
  { label: "쿠키 정책", href: "/cookies" },
];

/**
 * All footer sections combined
 */
export const footerSections: FooterSection[] = [
  { title: "제품", links: productLinks },
  { title: "회사", links: companyLinks },
  { title: "도움말", links: helpLinks },
];
