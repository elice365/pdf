# Setup & Installation Guide

## Prerequisites

### System Requirements
- **Node.js**: 18.x or higher
- **npm**: 9.x or higher (or pnpm/yarn)
- **Git**: For version control
- **Code Editor**: VS Code recommended with extensions:
  - Tailwind CSS IntelliSense
  - TypeScript and JavaScript Language Features
  - Biome (formatting & linting)

### Verify Installation
```bash
node --version   # Should show v18.x or higher
npm --version    # Should show v9.x or higher
```

---

## Initial Project Setup

The project is already initialized with Next.js 16.0.1, React 19.2.0, and Tailwind CSS 4.0.

### Current Project Structure
```
/Users/elice-mac/Code/pdf/
├── src/
│   └── app/
│       ├── layout.tsx
│       ├── page.tsx
│       └── globals.css
├── output/              # Reference materials
├── docs/                # Documentation (new)
├── package.json
├── tsconfig.json
├── next.config.ts
└── biome.json
```

---

## Step 1: Install shadcn/ui

shadcn/ui is required but not yet installed. This is the **first critical step**.

### Initialize shadcn/ui
```bash
npx shadcn@latest init
```

### Configuration Prompts
When prompted, use these settings:

```
? Which style would you like to use? › Default
? Which color would you like to use as base color? › Neutral
? Would you like to use CSS variables for colors? › Yes
? Where is your global CSS file? › src/app/globals.css
? Would you like to use TypeScript (recommended)? › Yes
? Where is your tailwind.config.js located? › tailwind.config.ts
? Configure the import alias for components: › @/components
? Configure the import alias for utils: › @/lib/utils
? Are you using React Server Components? › Yes
```

### Install Required Components
```bash
# Core UI components
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add navigation-menu
npx shadcn@latest add dropdown-menu
npx shadcn@latest add separator

# Form components (if needed later)
npx shadcn@latest add input
npx shadcn@latest add label
npx shadcn@latest add select
```

---

## Step 2: Configure Design Tokens

### 2.1 Update Tailwind Config

Replace the generated `tailwind.config.ts`:

```typescript
// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand colors
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

        // Tool categories
        tools: {
          organize: "#E5322D",
          optimize: "#98D8C8",
          convert: "#F6BD60",
          edit: "#F7B801",
          security: "#AE7FA7",
        },

        // Semantic colors
        destructive: {
          DEFAULT: "#DC2626",
          foreground: "#FFFFFF",
        },
        success: "#16A34A",
        warning: "#EAB308",
        info: "#3B82F6",
      },
      fontFamily: {
        sans: ["var(--font-noto-sans-kr)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },
      fontSize: {
        h1: ["2.5rem", { lineHeight: "1.25" }],
        h2: ["2rem", { lineHeight: "1.25" }],
        h3: ["1.5rem", { lineHeight: "1.25" }],
        h4: ["1.25rem", { lineHeight: "1.5" }],
      },
      spacing: {
        header: "60px",
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.25rem",
      },
      boxShadow: {
        sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      },
    },
  },
  plugins: [],
};

export default config;
```

### 2.2 Update Global CSS

Update `src/app/globals.css`:

```css
@import "tailwindcss";

/* CSS Variables */
:root {
  --background: #ffffff;
  --foreground: #171717;
  --muted-foreground: #47474f;
  --primary: #ee6c4d;
  --primary-foreground: #ffffff;
  --surface: #f5f5f5;
  --border: rgba(0, 0, 0, 0.08);
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);
  --font-sans: var(--font-noto-sans-kr);
  --font-mono: var(--font-geist-mono);
}

/* Dark mode (future) */
@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --foreground: #ededed;
    --surface: #1a1a1a;
    --border: rgba(255, 255, 255, 0.145);
  }
}

/* Base styles */
body {
  background: var(--background);
  color: var(--foreground);
  font-family: var(--font-sans);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Pattern background utility */
.pattern-bg {
  background-image:
    linear-gradient(135deg, #f5f5f5 25%, transparent 25%),
    linear-gradient(225deg, #f5f5f5 25%, transparent 25%),
    linear-gradient(45deg, #f5f5f5 25%, transparent 25%),
    linear-gradient(315deg, #f5f5f5 25%, transparent 25%);
  background-size: 40px 40px;
  background-position: 0 0, 20px 0, 20px -20px, 0 20px;
}

/* Accessibility - reduced motion */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Focus visible */
*:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}
```

### 2.3 Configure Fonts

Update `src/app/layout.tsx`:

```typescript
import type { Metadata } from "next";
import { Noto_Sans_KR, Geist_Mono } from "next/font/google";
import "./globals.css";

const notoSansKR = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-noto-sans-kr",
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "iLovePDF | PDF를 즐겨 쓰시는 분들을 위한 온라인 PDF 툴",
  description: "iLovePDF는 PDF 파일 작업을 위한 온라인 서비스로 완전히 무료이며 사용하기 쉽습니다.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${notoSansKR.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
```

---

## Step 3: Create Directory Structure

```bash
# Create component directories
mkdir -p src/components/header
mkdir -p src/components/hero
mkdir -p src/components/tools
mkdir -p src/components/features
mkdir -p src/components/footer
mkdir -p src/components/ui  # shadcn components go here

# Create lib directory for utilities
mkdir -p src/lib

# Create public directories for assets
mkdir -p public/images
mkdir -p public/icons
```

### Expected Structure After Setup
```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── ui/              # shadcn/ui components
│   ├── header/
│   ├── hero/
│   ├── tools/
│   ├── features/
│   └── footer/
└── lib/
    └── utils.ts         # Utility functions
```

---

## Step 4: Verify Installation

### Run Development Server
```bash
npm run dev
```

Server should start at `http://localhost:3000`

### Test shadcn/ui Components

Create a test page to verify shadcn/ui installation:

```tsx
// src/app/test/page.tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function TestPage() {
  return (
    <div className="p-8 space-y-4">
      <h1 className="text-h1 font-bold">Design System Test</h1>

      <div className="space-x-4">
        <Button>Primary Button</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <p>Test card with primary color accent</p>
        </CardContent>
      </Card>

      <div className="w-32 h-32 bg-primary" />
      <p className="text-muted-foreground">Muted text</p>
    </div>
  );
}
```

Visit `http://localhost:3000/test` to verify:
- ✅ Buttons render with correct styling
- ✅ Primary color is red (#E5322D)
- ✅ Noto Sans KR font loads
- ✅ Card component works

---

## Step 5: TypeScript Configuration

Verify `tsconfig.json` has correct path aliases:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

This allows imports like:
```typescript
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
```

---

## Step 6: Code Quality Tools

### Biome Configuration
Biome is already configured in `biome.json`. Verify:

```bash
# Run linter
npm run lint

# Format code
npm run format
```

### TypeScript Type Checking
```bash
# Check types without emitting files
npx tsc --noEmit
```

---

## Step 7: Prepare Assets

### Copy Reference Assets

1. **Logo**: Extract from `output/page.html` or use SVG from reference
2. **Tool Icons**: 72 SVG icons for different tools
3. **Feature Images**: Screenshots for feature sections
4. **App Store Badges**: iOS and Android download buttons

### Asset Organization
```
public/
├── images/
│   ├── premium-features.png
│   ├── business-feature.png
│   └── mobile-apps.png
├── icons/
│   ├── merge-pdf.svg
│   ├── split-pdf.svg
│   ├── compress-pdf.svg
│   └── [70 more tool icons]
└── logo/
    └── ilovepdf.svg
```

---

## Step 8: Environment Variables (Optional)

If API integration is needed:

```bash
# Create .env.local
NEXT_PUBLIC_API_URL=https://api.ilovepdf.com
```

Add to `.gitignore`:
```
.env*.local
```

---

## Common Issues & Troubleshooting

### Issue: shadcn/ui components not found
**Solution**: Ensure `components.json` was created and paths are correct
```bash
cat components.json  # Verify configuration
```

### Issue: Fonts not loading
**Solution**: Check Next.js font import and CSS variable declaration
```bash
# Verify font files are downloading in Network tab
```

### Issue: Tailwind classes not applying
**Solution**: Check `content` paths in `tailwind.config.ts`
```typescript
content: [
  "./src/**/*.{js,ts,jsx,tsx,mdx}",  // Include all src files
]
```

### Issue: TypeScript path alias errors
**Solution**: Restart TypeScript server in VS Code
```
Cmd/Ctrl + Shift + P → TypeScript: Restart TS Server
```

---

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Format code
npm run format

# Type check
npx tsc --noEmit
```

---

## Next Steps After Setup

1. ✅ shadcn/ui installed and configured
2. ✅ Design tokens customized
3. ✅ Fonts loaded (Noto Sans KR)
4. ✅ Component directories created
5. ⏳ Begin component implementation (see COMPONENT_GUIDE.md)

---

## Validation Checklist

- [ ] `npm run dev` starts without errors
- [ ] `http://localhost:3000` loads successfully
- [ ] shadcn/ui Button component renders
- [ ] Primary color is #E5322D (red)
- [ ] Noto Sans KR font displays
- [ ] TypeScript has no errors (`npx tsc --noEmit`)
- [ ] Biome linting passes (`npm run lint`)
- [ ] Test page displays correctly
- [ ] Component directories exist
- [ ] Assets directory created

---

**Status**: Setup guide complete
**Next**: Begin implementing components from COMPONENT_GUIDE.md
**Reference**: DESIGN_TOKENS.md for styling specifications
**Last Updated**: 2025-11-08
