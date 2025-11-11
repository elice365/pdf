# Development Workflow & Best Practices

## Overview
This document outlines the recommended workflow for implementing the iLovePDF clone, including development practices, quality gates, and deployment procedures.

---

## Development Phases

### Phase 1: Foundation Setup (Days 1-2)
**Goal**: Establish development environment and design system

#### Tasks
1. ✅ Project context loaded
2. 🔄 Install and configure shadcn/ui
3. 🔄 Customize design tokens
4. 🔄 Set up component directories
5. 🔄 Create utility functions

#### Deliverables
- Working development server
- Custom theme configured
- Component structure in place
- Type-safe utilities

#### Validation
```bash
npm run dev        # No errors
npm run lint       # Passes
npx tsc --noEmit   # No type errors
```

---

### Phase 2: Core Components (Days 3-5)
**Goal**: Implement header, hero, and basic layout

#### Implementation Order
1. **Header Component** (Day 3)
   - Logo
   - Navigation menu
   - Auth buttons
   - Mobile menu
   - Language selector

2. **Hero Section** (Day 3)
   - Title and subtitle
   - Pattern background
   - Responsive layout

3. **Layout Shell** (Day 4)
   - Header integration
   - Main content wrapper
   - Footer placeholder

4. **Basic Styling** (Day 5)
   - Global styles
   - Component variants
   - Responsive utilities

#### Quality Gates
- [ ] Header is fixed and responsive
- [ ] Navigation dropdowns work
- [ ] Mobile menu functions
- [ ] Hero text is centered
- [ ] TypeScript types are correct
- [ ] Accessibility: keyboard navigation works

---

### Phase 3: Tools Section (Days 6-8)
**Goal**: Implement tool cards grid and filtering system

#### Implementation Order
1. **Filter Tabs** (Day 6)
   - Tab component
   - Active state styling
   - Filter logic
   - Mobile scroll

2. **Tool Card** (Day 7)
   - Card layout
   - Icon integration
   - Hover effects
   - Link functionality

3. **Tools Grid** (Day 7-8)
   - Responsive grid layout
   - Filter integration
   - All 72 tool cards
   - Category mapping

4. **Tool Data** (Day 8)
   - Extract from `extracted-data.json`
   - Create TypeScript types
   - Map icons to tools
   - Verify all links

#### Quality Gates
- [ ] All 72 tools display
- [ ] Filtering works correctly
- [ ] Grid is responsive (1-6 columns)
- [ ] Hover effects smooth
- [ ] Icons render properly
- [ ] Links are accessible

---

### Phase 4: Feature Sections (Days 9-10)
**Goal**: Add marketing and promotional sections

#### Components
1. **Business Features** (Day 9)
   - Feature cards
   - Images
   - Links
   - Layout

2. **Premium Banner** (Day 9)
   - Yellow background section
   - Checkmarks
   - CTA button
   - Feature list

3. **iLoveIMG Integration** (Day 10)
   - Product card
   - Link to iLoveIMG
   - Image display

4. **App Downloads** (Day 10)
   - Desktop app section
   - Mobile app section
   - Store badges

#### Quality Gates
- [ ] All images optimized
- [ ] Sections responsive
- [ ] CTAs prominent
- [ ] Links work correctly
- [ ] Images have alt text

---

### Phase 5: Footer & Polish (Days 11-12)
**Goal**: Complete footer and final refinements

#### Tasks
1. **Footer Component** (Day 11)
   - Footer links
   - Company info
   - Social links
   - App store buttons
   - Language selector

2. **Final Polish** (Day 12)
   - Spacing adjustments
   - Color refinements
   - Animation tweaks
   - Loading states

#### Quality Gates
- [ ] Footer matches design
- [ ] All links functional
- [ ] Spacing consistent
- [ ] Colors accurate
- [ ] Animations smooth

---

### Phase 6: Testing & Optimization (Days 13-14)
**Goal**: Ensure quality, accessibility, and performance

#### Testing Checklist
1. **Visual Regression**
   - Compare with reference screenshot
   - Verify pixel accuracy
   - Check color fidelity
   - Validate spacing

2. **Accessibility Audit**
   - Keyboard navigation
   - Screen reader testing
   - Contrast ratios
   - ARIA attributes
   - Focus indicators

3. **Responsive Testing**
   - Mobile (360px, 480px)
   - Tablet (768px)
   - Desktop (1024px, 1280px, 1536px)
   - Touch targets (44px min)

4. **Performance Testing**
   - Lighthouse score
   - Bundle size analysis
   - Image optimization
   - Load time on 3G

5. **Cross-browser Testing**
   - Chrome
   - Safari
   - Firefox
   - Edge

#### Optimization Tasks
- [ ] Optimize images (WebP format)
- [ ] Implement lazy loading
- [ ] Code splitting
- [ ] Remove unused CSS
- [ ] Minimize JavaScript bundle

---

## Code Quality Standards

### TypeScript
```typescript
// ✅ Good: Explicit types
interface ToolCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  category: string;
}

// ❌ Bad: Implicit any
function ToolCard(props) {
  return <div>{props.title}</div>;
}
```

### Component Structure
```typescript
// ✅ Good: Clear structure
export function ToolCard({
  icon,
  title,
  description,
  href,
  category
}: ToolCardProps) {
  return (
    <Card>
      <CardContent>
        {/* Component content */}
      </CardContent>
    </Card>
  );
}

// ❌ Bad: Unclear structure
export default (p) => <div className="card">{p.children}</div>;
```

### Styling
```typescript
// ✅ Good: Tailwind with custom tokens
<Button className="bg-primary hover:bg-primary/90">
  클릭하기
</Button>

// ❌ Bad: Inline styles
<button style={{ backgroundColor: '#E5322D' }}>
  클릭하기
</button>
```

### Accessibility
```typescript
// ✅ Good: Semantic and accessible
<nav aria-label="Main navigation">
  <ul>
    <li>
      <Link href="/ko/merge_pdf">
        PDF 합치기
      </Link>
    </li>
  </ul>
</nav>

// ❌ Bad: Divs without semantics
<div className="nav">
  <div onClick={() => router.push('/merge')}>
    PDF 합치기
  </div>
</div>
```

---

## Git Workflow

### Branch Strategy
```bash
# Main branch
main → production-ready code

# Feature branches
feature/header
feature/tools-grid
feature/footer
```

### Commit Messages
```bash
# ✅ Good: Clear and descriptive
git commit -m "feat: implement header navigation with dropdown menus"
git commit -m "fix: correct tool card hover animation timing"
git commit -m "style: adjust spacing in hero section"
git commit -m "refactor: extract filter logic to custom hook"

# ❌ Bad: Vague
git commit -m "update"
git commit -m "fix stuff"
```

### Commit Frequency
- Commit after completing each component
- Commit before major refactoring
- Commit when tests pass
- Create meaningful commit messages

---

## Development Commands Reference

### Daily Development
```bash
# Start dev server
npm run dev

# Type check while developing
npx tsc --noEmit --watch

# Format on save (configure in VS Code)
# Or run manually:
npm run format
```

### Before Committing
```bash
# Run all checks
npm run lint       # Biome linting
npx tsc --noEmit   # Type checking
npm run format     # Auto-format

# Optional: Visual check
npm run build      # Ensure production build works
```

### Testing
```bash
# Manual testing checklist
- [ ] Desktop view (1280px)
- [ ] Tablet view (768px)
- [ ] Mobile view (375px)
- [ ] Keyboard navigation
- [ ] Screen reader (VoiceOver/NVDA)
```

---

## Component Development Workflow

### 1. Plan Component
```bash
# Read specifications
cat docs/COMPONENT_GUIDE.md

# Check design tokens
cat docs/DESIGN_TOKENS.md

# Review reference
open output/screenshots/full-page.jpg
```

### 2. Create Component Files
```bash
# Example: Header component
touch src/components/header/header.tsx
touch src/components/header/logo.tsx
touch src/components/header/navigation-menu.tsx
```

### 3. Implement Component
```typescript
// 1. Import dependencies
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// 2. Define types
interface HeaderProps {
  className?: string;
}

// 3. Implement component
export function Header({ className }: HeaderProps) {
  return (
    <header className={cn("fixed top-0", className)}>
      {/* Implementation */}
    </header>
  );
}
```

### 4. Test Component
```typescript
// Create test page
// src/app/test/header/page.tsx
import { Header } from "@/components/header/header";

export default function HeaderTest() {
  return <Header />;
}
```

### 5. Refine & Polish
- Adjust spacing
- Verify colors
- Test responsiveness
- Check accessibility
- Optimize performance

### 6. Document Component
```typescript
/**
 * Header component with navigation and authentication
 *
 * @example
 * ```tsx
 * <Header />
 * ```
 */
export function Header() {
  // ...
}
```

---

## Quality Assurance Checklist

### Before Each Commit
- [ ] TypeScript compiles (`npx tsc --noEmit`)
- [ ] Biome linting passes (`npm run lint`)
- [ ] Code is formatted (`npm run format`)
- [ ] Component renders correctly
- [ ] No console errors

### Before Each PR/Milestone
- [ ] All components implemented
- [ ] Visual matches reference
- [ ] Responsive on all breakpoints
- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Performance acceptable (Lighthouse >90)
- [ ] Images optimized
- [ ] TypeScript strict mode passes

### Before Production
- [ ] Full accessibility audit
- [ ] Cross-browser testing
- [ ] Performance optimization
- [ ] SEO meta tags
- [ ] Error handling
- [ ] Loading states
- [ ] Analytics integration (if required)

---

## Performance Optimization

### Image Optimization
```typescript
// ✅ Good: Next.js Image with optimization
import Image from "next/image";

<Image
  src="/images/feature.png"
  alt="Feature description"
  width={600}
  height={400}
  loading="lazy"
  quality={85}
/>

// ❌ Bad: Regular img tag
<img src="/images/feature.png" alt="Feature" />
```

### Code Splitting
```typescript
// ✅ Good: Dynamic imports for heavy components
import dynamic from "next/dynamic";

const HeavyComponent = dynamic(
  () => import("@/components/heavy-component"),
  { loading: () => <div>Loading...</div> }
);
```

### Bundle Analysis
```bash
# Analyze bundle size
npm run build
npx @next/bundle-analyzer
```

---

## Troubleshooting Guide

### Component Not Rendering
1. Check TypeScript errors
2. Verify import paths
3. Check component export
4. Inspect browser console

### Styles Not Applying
1. Verify Tailwind config
2. Check className syntax
3. Inspect computed styles
4. Clear Next.js cache (`rm -rf .next`)

### Type Errors
1. Check TypeScript config
2. Verify import statements
3. Add explicit types
4. Restart TS server

### Build Errors
1. Check dependencies
2. Verify Next.js config
3. Clear cache and rebuild
4. Check node version

---

## Deployment Preparation

### Pre-deployment Checklist
- [ ] All tests pass
- [ ] No TypeScript errors
- [ ] No linting errors
- [ ] Build succeeds (`npm run build`)
- [ ] Environment variables configured
- [ ] Meta tags updated
- [ ] Favicon added
- [ ] Robots.txt configured
- [ ] Sitemap generated

### Build Command
```bash
npm run build
npm start  # Test production build locally
```

### Environment Variables
```bash
# .env.production
NEXT_PUBLIC_SITE_URL=https://ilovepdf-clone.vercel.app
```

---

## Success Metrics

### Technical Metrics
- **TypeScript**: 0 errors in strict mode
- **Lighthouse Performance**: >90
- **Lighthouse Accessibility**: 100
- **Bundle Size**: <500KB initial load
- **Load Time**: <3s on 3G

### Visual Metrics
- **Color Accuracy**: Exact match (#E5322D)
- **Spacing**: Consistent 4px grid
- **Typography**: Noto Sans KR renders correctly
- **Responsive**: Works on all breakpoints

### Functional Metrics
- **Components**: 72 tool cards rendered
- **Navigation**: All links functional
- **Filters**: All 7 categories work
- **Accessibility**: WCAG 2.1 AA compliant

---

**Status**: Workflow documentation complete
**Next**: Begin Phase 1 - Foundation Setup
**Reference**: SETUP_GUIDE.md for installation steps
**Last Updated**: 2025-11-08
