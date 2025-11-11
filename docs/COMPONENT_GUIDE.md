# Component Implementation Guide

## Overview
This guide provides detailed specifications for implementing each component of the iLovePDF clone. All components should be built using shadcn/ui primitives with custom styling.

## Component Hierarchy

```
App
├── Header (Fixed)
│   ├── Logo
│   ├── NavigationMenu
│   │   ├── ToolsDropdown
│   │   └── LanguageDropdown
│   └── AuthButtons
├── Main
│   ├── HeroSection
│   │   ├── Title
│   │   └── Subtitle
│   ├── ToolsSection
│   │   ├── FilterTabs
│   │   └── ToolsGrid
│   │       └── ToolCard (×72)
│   ├── FeaturesSection
│   │   ├── ExclusiveFeatures
│   │   ├── BusinessFeatures
│   │   └── AppsFeature
│   └── PromotionSection
└── Footer
    ├── FooterLinks
    ├── ProductLinks
    └── AppDownloads
```

## 1. Header Component

### Specifications
- **Height**: 60px fixed
- **Background**: White (#FFFFFF)
- **Shadow**: `0 1px 3px rgba(0, 0, 0, 0.1)`
- **Position**: Fixed to top
- **Z-index**: 1041

### Structure
```tsx
// src/components/header/header.tsx
interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 h-[60px]",
      "bg-white shadow-sm z-[1041]",
      className
    )}>
      <nav className="flex items-center justify-between h-full px-6">
        <Logo />
        <NavigationMenu />
        <AuthButtons />
      </nav>
    </header>
  );
}
```

### Sub-components

#### Logo
```tsx
// src/components/header/logo.tsx
export function Logo() {
  return (
    <Link href="/ko" className="flex items-center">
      <Image
        src="/img/ilovepdf.svg"
        alt="iLovePDF"
        width={120}
        height={30}
        priority
      />
    </Link>
  );
}
```

#### Navigation Menu
- **Desktop**: Horizontal dropdown menus
- **Mobile**: Hamburger menu
- **Items**: PDF 합치기, PDF 분할, PDF 압축, PDF 변환 (with sub-menus)

```tsx
// src/components/header/navigation-menu.tsx
const menuItems = [
  { label: "PDF 합치기", href: "/ko/merge_pdf" },
  { label: "PDF 분할", href: "/ko/split_pdf" },
  { label: "PDF 압축", href: "/ko/compress_pdf" },
  {
    label: "PDF 변환",
    submenu: [
      { label: "JPG PDF 변환", href: "/ko/jpg_to_pdf" },
      { label: "워드 PDF 변환", href: "/ko/word_to_pdf" },
      // ... more items
    ]
  }
];
```

#### Auth Buttons
```tsx
// src/components/header/auth-buttons.tsx
export function AuthButtons() {
  return (
    <div className="flex items-center gap-4">
      <Button variant="ghost" asChild>
        <Link href="/ko/login">로그인</Link>
      </Button>
      <Button asChild>
        <Link href="/ko/register">가입하기</Link>
      </Button>
    </div>
  );
}
```

### Responsive Behavior
- **Desktop (≥1024px)**: Full navigation visible
- **Tablet (768-1023px)**: Condensed menu
- **Mobile (<768px)**: Hamburger menu

---

## 2. Hero Section

### Specifications
- **Background**: Pattern gradient
- **Padding**: 120px top, 80px bottom
- **Text Alignment**: Center

### Structure
```tsx
// src/components/hero/hero-section.tsx
export function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 mt-[60px]">
      <div className="absolute inset-0 pattern-bg opacity-50" />
      <div className="relative container mx-auto px-6 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          PDF 애호가들을 위한 온라인 툴
        </h1>
        <h2 className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
          PDF 병합, PDF 나누기, PDF 압축, 오피스 파일에서 PDF로 변환,
          PDF에서 JPG로 변환, JPG에서 PDF로 변환을 위한 무료 온라인 PDF 도구.
          설치 필요 없음
        </h2>
      </div>
    </section>
  );
}
```

### Pattern Background
```css
/* globals.css */
.pattern-bg {
  background-image:
    linear-gradient(135deg, #F5F5F5 25%, transparent 25%),
    linear-gradient(225deg, #F5F5F5 25%, transparent 25%),
    linear-gradient(45deg, #F5F5F5 25%, transparent 25%),
    linear-gradient(315deg, #F5F5F5 25%, transparent 25%);
  background-size: 40px 40px;
  background-position: 0 0, 20px 0, 20px -20px, 0 20px;
}
```

---

## 3. Filter Tabs Component

### Specifications
- **Layout**: Horizontal scrollable on mobile
- **Active State**: Primary color background
- **Transition**: 240ms ease-out

### Structure
```tsx
// src/components/tools/filter-tabs.tsx
interface FilterTabsProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

const filters = [
  { id: "all", label: "모두" },
  { id: "workflows", label: "작업 절차" },
  { id: "organize", label: "PDF 구성" },
  { id: "optimize", label: "PDF 최적화" },
  { id: "convert", label: "PDF 변환" },
  { id: "edit", label: "PDF 편집" },
  { id: "security", label: "PDF 보안" },
];

export function FilterTabs({ activeFilter, onFilterChange }: FilterTabsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-4 mb-8">
      {filters.map((filter) => (
        <button
          key={filter.id}
          onClick={() => onFilterChange(filter.id)}
          className={cn(
            "px-6 py-2 rounded-full whitespace-nowrap transition-all",
            activeFilter === filter.id
              ? "bg-primary text-white"
              : "bg-surface text-muted-foreground hover:bg-gray-200"
          )}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}
```

---

## 4. Tool Card Component

### Specifications
- **Size**: Flexible width, maintains aspect ratio
- **Icon**: 48×48px SVG
- **Hover**: Lift effect with shadow
- **Border Radius**: 12px

### Structure
```tsx
// src/components/tools/tool-card.tsx
interface ToolCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  category: string;
  badge?: string;
}

export function ToolCard({
  icon,
  title,
  description,
  href,
  category,
  badge
}: ToolCardProps) {
  return (
    <Card className="group hover:shadow-lg transition-all duration-240">
      <Link href={href}>
        <CardContent className="p-6">
          <div className="flex flex-col items-center text-center gap-4">
            {/* Icon */}
            <div className="w-12 h-12 flex items-center justify-center">
              {icon}
            </div>

            {/* Title */}
            <h3 className="font-medium text-base">
              {title}
              {badge && (
                <span className="ml-2 text-xs bg-primary text-white px-2 py-1 rounded">
                  {badge}
                </span>
              )}
            </h3>

            {/* Description */}
            <p className="text-sm text-muted-foreground line-clamp-2">
              {description}
            </p>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
```

### Grid Layout
```tsx
// src/components/tools/tools-grid.tsx
export function ToolsGrid({ tools, filter }: ToolsGridProps) {
  const filteredTools = filter === "all"
    ? tools
    : tools.filter(tool => tool.category === filter);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
      {filteredTools.map((tool) => (
        <ToolCard key={tool.id} {...tool} />
      ))}
    </div>
  );
}
```

---

## 5. Feature Section Components

### Business Feature Card
```tsx
// src/components/features/feature-card.tsx
interface FeatureCardProps {
  image: string;
  title: string;
  description: string;
  link: string;
}

export function FeatureCard({ image, title, description, link }: FeatureCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-video relative">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover"
        />
      </div>
      <CardContent className="p-6">
        <h3 className="text-xl font-medium mb-2">{title}</h3>
        <p className="text-muted-foreground mb-4">{description}</p>
        <Button variant="link" asChild className="p-0">
          <Link href={link}>
            자세히 보기 →
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
```

### Premium Section
```tsx
// src/components/features/premium-section.tsx
export function PremiumSection() {
  return (
    <section className="bg-[#FFFAEB] py-20">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-6">
              프리미엄으로 더 많은 혜택 제공
            </h2>
            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-primary flex-shrink-0" />
                <span>LovePDF를 제한 없이 마음껏 사용하고 프리미엄 도구들을 사용하세요</span>
              </li>
              {/* More features */}
            </ul>
            <Button size="lg" className="bg-[#FFD54F] text-black hover:bg-[#FFC107]">
              프리미엄 보기
            </Button>
          </div>
          <div>
            <Image
              src="/images/premium-features.png"
              alt="Premium features"
              width={600}
              height={400}
              className="rounded-lg"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
```

---

## 6. Footer Component

### Specifications
- **Background**: Dark (#2D2D2D)
- **Text Color**: Light gray (#A0A0A0)
- **Link Hover**: White

### Structure
```tsx
// src/components/footer/footer.tsx
export function Footer() {
  return (
    <footer className="bg-[#2D2D2D] text-gray-400 py-12">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <FooterColumn title="제품">
            <FooterLink href="/ko/business">비즈니스</FooterLink>
            <FooterLink href="/ko/desktop">데스크톱</FooterLink>
            <FooterLink href="/ko/mobile">모바일</FooterLink>
            <FooterLink href="/ko/features">기능</FooterLink>
          </FooterColumn>

          <FooterColumn title="회사">
            <FooterLink href="/ko/help/about">회사 소개</FooterLink>
            <FooterLink href="/ko/pricing">가격</FooterLink>
            <FooterLink href="/ko/help/security">보안</FooterLink>
          </FooterColumn>

          <FooterColumn title="도움">
            <FooterLink href="/ko/help/faq">자주 묻는 질문</FooterLink>
            <FooterLink href="/ko/help/documentation">도구</FooterLink>
            <FooterLink href="/ko/contact">문의</FooterLink>
          </FooterColumn>

          <div>
            <h4 className="font-medium text-white mb-4">앱 다운로드</h4>
            <div className="flex flex-col gap-3">
              <AppStoreButton platform="ios" />
              <AppStoreButton platform="android" />
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-8 text-sm text-center">
          <p>© iLovePDF 2025 - PDF 파일 처리를 위한 온라인 툴</p>
        </div>
      </div>
    </footer>
  );
}
```

---

## 7. Shared Components

### Button Variants
```tsx
// component variants (configured in shadcn/ui)
const buttonVariants = {
  default: "bg-primary text-white hover:bg-primary/90",
  secondary: "bg-surface text-foreground hover:bg-gray-200",
  outline: "border-2 border-border hover:bg-surface",
  ghost: "hover:bg-surface",
  link: "text-primary underline-offset-4 hover:underline",
};

const buttonSizes = {
  sm: "h-10 px-4 text-sm",
  md: "h-12 px-6",
  lg: "h-14 px-8 text-lg",
};
```

### Card Component
```tsx
// Standard card styling
<Card className="overflow-hidden hover:shadow-lg transition-shadow">
  <CardContent className="p-6">
    {/* Content */}
  </CardContent>
</Card>
```

---

## Component Checklist

### Header
- [ ] Logo component
- [ ] Navigation menu with dropdowns
- [ ] Mobile hamburger menu
- [ ] Auth buttons (login/register)
- [ ] Language selector
- [ ] Sticky header behavior

### Hero
- [ ] Title and subtitle
- [ ] Pattern background
- [ ] Responsive text sizing

### Tools Section
- [ ] Filter tabs (7 categories)
- [ ] Tool cards grid (72 tools)
- [ ] Tool icons (SVG)
- [ ] Category filtering logic
- [ ] Hover states

### Features
- [ ] Exclusive features cards
- [ ] Business features section
- [ ] Premium promotion banner
- [ ] iLoveIMG integration card
- [ ] App download section

### Footer
- [ ] Footer links grid
- [ ] Product links
- [ ] Company links
- [ ] Help links
- [ ] App store buttons
- [ ] Social media links
- [ ] Copyright notice

---

## Accessibility Requirements

### Keyboard Navigation
- Tab order follows visual hierarchy
- Skip to main content link
- Focus visible on all interactive elements

### ARIA Attributes
```tsx
// Navigation menu
<nav aria-label="Main navigation">
  <button aria-expanded={isOpen} aria-haspopup="true">
    메뉴
  </button>
</nav>

// Tool cards
<article aria-labelledby="tool-title">
  <h3 id="tool-title">PDF 합치기</h3>
</article>
```

### Screen Reader Support
- Semantic HTML (header, nav, main, section, footer)
- Alt text for all images
- Descriptive link text
- Form labels

---

**Reference**: `output/extracted-data.json`, `output/implementation-guide.md`
**Status**: Component specifications complete
**Last Updated**: 2025-11-08
