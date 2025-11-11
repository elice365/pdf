# iLovePDF Clone - Project Overview

## Project Purpose
Clone the iLovePDF Korean homepage (https://www.ilovepdf.com/ko) using Next.js 16, React 19, and shadcn/ui with Tailwind CSS 4.0. The goal is pixel-perfect UI/UX replication with accessibility and performance optimization.

## Tech Stack

### Core Framework
- **Next.js**: 16.0.1 (App Router)
- **React**: 19.2.0 (with React Compiler)
- **TypeScript**: 5.x
- **Tailwind CSS**: 4.0

### UI Components
- **shadcn/ui**: Not yet installed (required)
- **Design System**: Custom tokens based on iLovePDF brand

### Build Tools
- **Biome**: 2.2.0 (linting & formatting)
- **PostCSS**: Tailwind integration
- **Babel**: React Compiler plugin

## Project Structure

```
/Users/elice-mac/Code/pdf/
├── src/
│   └── app/
│       ├── layout.tsx          # Root layout
│       ├── page.tsx            # Homepage
│       └── globals.css         # Global styles
├── output/                     # Reference materials
│   ├── screenshots/
│   │   └── full-page.jpg      # Design reference
│   ├── extracted-data.json    # Component data (3.2MB)
│   ├── implementation-guide.md # Implementation guide
│   ├── page.html              # HTML structure
│   └── styles.css             # CSS reference
├── docs/                       # Documentation (this directory)
├── CLAUDE.md                   # Project instructions
├── package.json
└── [config files]
```

## Design System

### Brand Colors
- **Primary**: `#E5322D` (red)
- **Background**: `#FFFFFF` (white), `#F5F5F5` (light gray)
- **Text**: `#47474F` (dark gray), `#171717` (near black)
- **Border**: Light grays for subtle separation

### Typography
- **Font Family**: Noto Sans KR (Google Fonts)
- **Weights**:
  - 400 (Regular) - body text
  - 500 (Medium) - emphasis
  - 700 (Bold) - headings
- **Language**: Korean (ko) support required

### Layout Breakpoints
- **Mobile**: 360-480px (sm)
- **Tablet**: 768px (md)
- **Desktop**: 1024px (lg), 1280px (xl), 1536px (2xl)

### Component Inventory
Based on extracted data analysis:
- 72 total components
- 13 images
- 39 DIV containers
- 9 Navigation elements
- 7 Card components
- 5 Image components
- 3 Banner components
- 2 Header components

## Key Requirements

### Design Compliance
✅ Must customize shadcn/ui tokens (default theme forbidden)
✅ Avoid purple/indigo/blue unless brand requires
✅ Match red (#E5322D) brand color
✅ Use Noto Sans KR for Korean text

### Accessibility Standards
✅ 4.5:1 minimum contrast ratio
✅ Semantic HTML5 structure
✅ Keyboard navigation support
✅ ARIA attributes for interactive elements
✅ Screen reader compatibility

### Performance Targets
✅ Mobile-first responsive design
✅ Image optimization and lazy loading
✅ Bundle splitting
✅ < 3s load time on 3G

### Responsive Design
✅ Mobile: 360-480px
✅ Tablet: 768px
✅ Desktop: 1024px+
✅ Touch targets: 44px minimum

## Page Sections

### 1. Header (Fixed, 60px)
- Logo (left)
- Navigation menu (center)
- Login/Register buttons (right)
- Dropdown menus for tools
- Language selector

### 2. Hero Section
- Title: "PDF 애호가들을 위한 온라인 툴"
- Subtitle: Feature description
- Background pattern

### 3. Tools Grid
- Filter tabs (모두, PDF 구성, PDF 최적화, etc.)
- Tool cards (6 columns responsive)
- Each card: icon, title, description
- Hover states

### 4. Feature Sections
- Business features
- Desktop/Mobile apps
- iLoveIMG integration

### 5. Footer
- Product links
- Company info
- Legal links
- App download buttons

## Development Workflow

### 1. Initial Setup
```bash
# Install shadcn/ui
npx shadcn@latest init

# Install required components
npx shadcn@latest add button card navigation-menu
```

### 2. Theme Configuration
- Configure design tokens in `tailwind.config.ts`
- Set up Noto Sans KR font loading
- Define color palette
- Configure spacing scale

### 3. Component Development
- Build header navigation
- Implement hero section
- Create tool card grid
- Add filter system
- Build feature sections
- Implement footer

### 4. Quality Assurance
- TypeScript type checking
- Biome linting
- Accessibility testing
- Responsive testing
- Performance optimization

## Reference Materials

### Design References
- **Screenshot**: `output/screenshots/full-page.jpg`
- **HTML Structure**: `output/page.html`
- **CSS Styles**: `output/styles.css`
- **Component Data**: `output/extracted-data.json`

### Implementation Guide
- **Guide**: `output/implementation-guide.md`
- **Instructions**: `CLAUDE.md`

## Next Steps

1. ✅ Project context loaded
2. 🔄 Install shadcn/ui
3. ⏳ Configure design tokens
4. ⏳ Implement header component
5. ⏳ Implement hero section
6. ⏳ Create tool cards grid
7. ⏳ Build filter system
8. ⏳ Add feature sections
9. ⏳ Implement footer
10. ⏳ Responsive optimization
11. ⏳ Accessibility audit
12. ⏳ Performance testing

## Constraints & Guidelines

### Prohibited
❌ Default shadcn/ui theme deployment
❌ Purple/indigo/blue color scheme (unless brand requires)
❌ Hover-only interactions
❌ Emojis in web application
❌ Login flows (mockup only)
❌ **PDF processing features** (merge, split, compress, etc. - UI clone only)
❌ **API endpoints** (/api/pdf/* - static page only)
❌ **File upload functionality** (drag & drop, file input - links only)
❌ **State management** (Redux, Zustand - not needed for static page)

### Required
✅ Custom theme tokens
✅ Brand color palette (#E5322D)
✅ Korean language (Noto Sans KR)
✅ Mobile-first approach
✅ Accessibility compliance
✅ Performance optimization

## Success Criteria

### Visual Accuracy
- Pixel-perfect match with reference screenshot
- Correct brand colors and typography
- Proper spacing and layout

### Technical Quality
- TypeScript strict mode passes
- Biome linting passes
- No accessibility violations
- Performance budget met

### Functional Requirements
- Responsive across all breakpoints
- Keyboard navigation works
- Screen readers compatible
- Images optimized and lazy loaded

---

**Project Status**: Context Loaded ✅
**Next Action**: Install shadcn/ui and configure design tokens
**Documentation Updated**: 2025-11-08
