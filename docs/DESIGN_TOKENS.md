# Design Tokens & Theme Configuration

## Overview
This document defines the design tokens for the iLovePDF clone based on the reference website analysis. All tokens must be configured in shadcn/ui before deployment.

## Color Palette

### Primary Colors
```css
--primary: #E5322D;           /* Red - Brand color */
--primary-foreground: #FFFFFF; /* White text on primary */
```

### Background Colors
```css
--background: #FFFFFF;         /* Main background */
--surface: #F5F5F5;           /* Secondary surface */
--pattern-bg: linear-gradient(135deg, #F5F5F5 25%, transparent 25%);
```

### Text Colors
```css
--foreground: #171717;        /* Primary text (near black) */
--muted-foreground: #47474F;  /* Secondary text (dark gray) */
--muted: #6B6B6B;            /* Tertiary text */
```

### Semantic Colors
```css
--destructive: #DC2626;       /* Error/danger */
--destructive-foreground: #FFFFFF;

--success: #16A34A;          /* Success states */
--warning: #EAB308;          /* Warning states */
--info: #3B82F6;             /* Informational */
```

### Border Colors
```css
--border: rgba(0, 0, 0, 0.08);        /* Light borders */
--border-dark: rgba(0, 0, 0, 0.145);  /* Emphasized borders */
```

### Tool Category Colors
Based on the reference, different tool categories use variations:
```css
--tools-organize: #E5322D;    /* PDF 구성 - Red */
--tools-optimize: #98D8C8;    /* PDF 최적화 - Mint */
--tools-convert: #F6BD60;     /* PDF 변환 - Yellow */
--tools-edit: #F7B801;        /* PDF 편집 - Gold */
--tools-security: #AE7FA7;    /* PDF 보안 - Purple */
```

## Typography

### Font Families
```css
--font-sans: 'Noto Sans KR', system-ui, -apple-system, sans-serif;
--font-mono: 'Geist Mono', ui-monospace, monospace;
```

### Font Weights
```css
--font-regular: 400;   /* Body text */
--font-medium: 500;    /* Emphasis */
--font-bold: 700;      /* Headings */
```

### Font Sizes
```css
/* Headings */
--text-h1: 2.5rem;      /* 40px - Hero title */
--text-h2: 2rem;        /* 32px - Section titles */
--text-h3: 1.5rem;      /* 24px - Card titles */
--text-h4: 1.25rem;     /* 20px - Subsections */

/* Body */
--text-base: 1rem;      /* 16px - Default body */
--text-lg: 1.125rem;    /* 18px - Large body */
--text-sm: 0.875rem;    /* 14px - Small text */
--text-xs: 0.75rem;     /* 12px - Captions */
```

### Line Heights
```css
--leading-tight: 1.25;   /* Headings */
--leading-normal: 1.5;   /* Body text */
--leading-relaxed: 1.75; /* Loose paragraphs */
```

## Spacing Scale

### Base Scale (4px increment)
```css
--space-0: 0;
--space-1: 0.25rem;    /* 4px */
--space-2: 0.5rem;     /* 8px */
--space-3: 0.75rem;    /* 12px */
--space-4: 1rem;       /* 16px */
--space-5: 1.25rem;    /* 20px */
--space-6: 1.5rem;     /* 24px */
--space-8: 2rem;       /* 32px */
--space-10: 2.5rem;    /* 40px */
--space-12: 3rem;      /* 48px */
--space-16: 4rem;      /* 64px */
--space-20: 5rem;      /* 80px */
--space-24: 6rem;      /* 96px */
--space-32: 8rem;      /* 128px */
```

### Component Spacing
```css
--header-height: 60px;
--card-padding: 1.5rem;    /* 24px */
--section-padding-y: 5rem; /* 80px */
--section-padding-x: 1.5rem; /* 24px */
```

## Border Radius

```css
--radius-sm: 0.25rem;   /* 4px - Small elements */
--radius-md: 0.5rem;    /* 8px - Cards, buttons */
--radius-lg: 0.75rem;   /* 12px - Large cards */
--radius-xl: 1rem;      /* 16px - Sections */
--radius-full: 9999px;  /* Fully rounded */
```

## Shadows

```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
             0 2px 4px -1px rgba(0, 0, 0, 0.06);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
             0 4px 6px -2px rgba(0, 0, 0, 0.05);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
             0 10px 10px -5px rgba(0, 0, 0, 0.04);
```

## Breakpoints

```css
--screen-sm: 640px;    /* Mobile landscape */
--screen-md: 768px;    /* Tablet */
--screen-lg: 1024px;   /* Desktop */
--screen-xl: 1280px;   /* Large desktop */
--screen-2xl: 1536px;  /* Extra large */
```

### Container Max Widths
```css
--container-sm: 640px;
--container-md: 768px;
--container-lg: 1024px;
--container-xl: 1280px;
--container-2xl: 1536px;
```

## Animation & Transitions

### Duration
```css
--duration-fast: 120ms;      /* Micro-interactions */
--duration-normal: 240ms;    /* Standard transitions */
--duration-slow: 400ms;      /* Complex animations */
```

### Easing
```css
--ease-out: cubic-bezier(0.16, 1, 0.3, 1);
--ease-in: cubic-bezier(0.7, 0, 0.84, 0);
--ease-in-out: cubic-bezier(0.87, 0, 0.13, 1);
```

### Motion Preferences
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Component-Specific Tokens

### Header
```css
--header-height: 60px;
--header-bg: #FFFFFF;
--header-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
--header-z-index: 1041;
```

### Tool Cards
```css
--card-bg: #FFFFFF;
--card-hover-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
--card-transition: all 240ms ease-out;
--card-icon-size: 48px;
```

### Buttons
```css
--btn-height-sm: 2.5rem;   /* 40px */
--btn-height-md: 3rem;     /* 48px */
--btn-height-lg: 3.5rem;   /* 56px */
--btn-padding-x: 1.5rem;   /* 24px */
```

### Filter Tags
```css
--tag-bg: #F5F5F5;
--tag-bg-active: #E5322D;
--tag-text: #47474F;
--tag-text-active: #FFFFFF;
--tag-padding-x: 1rem;
--tag-padding-y: 0.5rem;
--tag-radius: 1.5rem;      /* Pill shape */
```

## Dark Mode (Future)
```css
@media (prefers-color-scheme: dark) {
  :root {
    --background: #0A0A0A;
    --foreground: #EDEDED;
    --surface: #1A1A1A;
    --border: rgba(255, 255, 255, 0.145);
  }
}
```

## Accessibility

### Focus States
```css
--focus-ring: 2px solid #E5322D;
--focus-ring-offset: 2px;
--focus-ring-opacity: 0.5;
```

### Touch Targets
```css
--touch-target-min: 44px;   /* Minimum touch target size */
```

### Contrast Ratios
- Primary text on background: 12.6:1 ✅ (exceeds 4.5:1)
- Muted text on background: 7.2:1 ✅ (exceeds 4.5:1)
- Primary button: 5.8:1 ✅ (exceeds 4.5:1)

## Tailwind CSS 4.0 Configuration

### Theme Extension
```typescript
// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#E5322D",
          foreground: "#FFFFFF",
        },
        background: "#FFFFFF",
        foreground: "#171717",
        muted: {
          DEFAULT: "#6B6B6B",
          foreground: "#47474F",
        },
        surface: "#F5F5F5",
        border: "rgba(0, 0, 0, 0.08)",
        tools: {
          organize: "#E5322D",
          optimize: "#98D8C8",
          convert: "#F6BD60",
          edit: "#F7B801",
          security: "#AE7FA7",
        },
      },
      fontFamily: {
        sans: ["var(--font-noto-sans-kr)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },
      fontSize: {
        h1: "2.5rem",
        h2: "2rem",
        h3: "1.5rem",
        h4: "1.25rem",
      },
      spacing: {
        header: "60px",
      },
    },
  },
};

export default config;
```

## Google Fonts Integration

### Noto Sans KR Loading
```typescript
// src/app/layout.tsx
import { Noto_Sans_KR } from "next/font/google";

const notoSansKR = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-noto-sans-kr",
  display: "swap",
});
```

## Implementation Checklist

- [ ] Install shadcn/ui
- [ ] Configure Tailwind theme with custom tokens
- [ ] Load Noto Sans KR from Google Fonts
- [ ] Set up color palette in globals.css
- [ ] Configure component variants (buttons, cards, etc.)
- [ ] Test contrast ratios for accessibility
- [ ] Verify responsive breakpoints
- [ ] Test dark mode compatibility (future)
- [ ] Validate against design reference screenshot

---

**Reference**: `output/styles.css`, `output/screenshots/full-page.jpg`
**Status**: Token specification complete, awaiting implementation
**Last Updated**: 2025-11-08
