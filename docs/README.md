# Project Documentation Index

## Overview
Complete documentation for the iLovePDF Korean homepage clone project. This documentation suite provides everything needed to understand, set up, develop, and deploy the application.

---

## Documentation Structure

### 📋 [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md)
**Purpose**: High-level project introduction and context
- Project goals and requirements
- Technology stack overview
- Design system summary
- Component inventory
- Success criteria
- Next steps

**When to read**: Start here for project understanding

---

### 🎨 [DESIGN_TOKENS.md](./DESIGN_TOKENS.md)
**Purpose**: Complete design system specification
- Color palette (primary, semantic, tool categories)
- Typography (fonts, sizes, weights)
- Spacing scale (4px grid system)
- Border radius and shadows
- Animation timing and easing
- Responsive breakpoints
- Accessibility standards
- Tailwind CSS 4.0 configuration

**When to read**: Before implementing any UI component

---

### 🧩 [COMPONENT_GUIDE.md](./COMPONENT_GUIDE.md)
**Purpose**: Detailed component implementation specifications
- Component hierarchy
- Header (logo, navigation, auth buttons)
- Hero section
- Filter tabs
- Tool cards (×72)
- Feature sections
- Footer
- Shared components (buttons, cards)
- Accessibility requirements

**When to read**: During component development

---

### ⚙️ [SETUP_GUIDE.md](./SETUP_GUIDE.md)
**Purpose**: Step-by-step installation and configuration
- Prerequisites and system requirements
- shadcn/ui installation
- Design token configuration
- Font setup (Noto Sans KR)
- Directory structure
- TypeScript configuration
- Asset preparation
- Common troubleshooting

**When to read**: First-time setup and onboarding

---

### 🔄 [WORKFLOW.md](./WORKFLOW.md)
**Purpose**: Development process and best practices
- Development phases (6 phases, 14 days)
- Implementation order
- Quality gates and validation
- Code quality standards
- Git workflow and commit messages
- Testing procedures
- Performance optimization
- Deployment preparation

**When to read**: Daily development and before commits

---

## Quick Start

### For New Developers
1. Read **PROJECT_OVERVIEW.md** (10 min) - Understand project goals
2. Follow **SETUP_GUIDE.md** (30-60 min) - Set up environment
3. Review **DESIGN_TOKENS.md** (15 min) - Familiarize with design system
4. Check **WORKFLOW.md** (20 min) - Understand development process
5. Use **COMPONENT_GUIDE.md** (ongoing) - Implementation reference

### For Designers
1. **PROJECT_OVERVIEW.md** - Project context
2. **DESIGN_TOKENS.md** - Complete design specifications
3. Reference: `output/screenshots/full-page.jpg` - Visual reference

### For QA/Testing
1. **PROJECT_OVERVIEW.md** - Success criteria
2. **COMPONENT_GUIDE.md** - Component specifications
3. **WORKFLOW.md** - Testing procedures

---

## Reference Materials

### Design References
Located in `output/` directory:
- **screenshots/full-page.jpg** - Full page visual reference
- **page.html** - HTML structure
- **styles.css** - CSS reference
- **extracted-data.json** - Component data (3.2MB)
- **implementation-guide.md** - Original implementation guide

### External References
- **Next.js 16 Docs**: https://nextjs.org/docs
- **shadcn/ui Docs**: https://ui.shadcn.com
- **Tailwind CSS 4 Docs**: https://tailwindcss.com/docs
- **React 19 Docs**: https://react.dev
- **WCAG 2.1 Guidelines**: https://www.w3.org/WAI/WCAG21/quickref/

---

## Development Phases Quick Reference

| Phase | Duration | Focus | Key Deliverables |
|-------|----------|-------|------------------|
| **Phase 1** | Days 1-2 | Foundation Setup | Theme configured, dev environment ready |
| **Phase 2** | Days 3-5 | Core Components | Header, hero, layout shell |
| **Phase 3** | Days 6-8 | Tools Section | Filter tabs, 72 tool cards, grid |
| **Phase 4** | Days 9-10 | Feature Sections | Business features, premium banner |
| **Phase 5** | Days 11-12 | Footer & Polish | Footer complete, final refinements |
| **Phase 6** | Days 13-14 | Testing & Optimization | QA, accessibility, performance |

---

## Key Constraints & Requirements

### ✅ Must Have
- Custom shadcn/ui theme (default forbidden)
- Noto Sans KR font for Korean text
- Primary color: #E5322D (red)
- Mobile-first responsive design
- WCAG 2.1 AA accessibility compliance
- Performance: <3s load on 3G

### ❌ Must Not Have
- Default shadcn/ui theme
- Purple/indigo/blue color scheme (unless brand)
- Hover-only interactions
- Emojis in application
- Login flows (mockup only)

---

## Component Checklist

### Header Components
- [ ] Logo
- [ ] Navigation menu with dropdowns
- [ ] Mobile hamburger menu
- [ ] Auth buttons (login/register)
- [ ] Language selector

### Main Content
- [ ] Hero section with pattern background
- [ ] Filter tabs (7 categories)
- [ ] Tool cards grid (72 tools)
- [ ] Business features section
- [ ] Premium promotion banner
- [ ] iLoveIMG integration
- [ ] App download sections

### Footer
- [ ] Product links
- [ ] Company links
- [ ] Help links
- [ ] App store buttons
- [ ] Social media links
- [ ] Copyright notice

---

## Quality Gates

### Before Each Commit
```bash
npm run lint       # Biome linting passes
npx tsc --noEmit   # No TypeScript errors
npm run format     # Code formatted
```

### Before Each Milestone
- [ ] Visual matches reference screenshot
- [ ] Responsive on all breakpoints (360px - 1536px)
- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] No console errors or warnings

### Before Production
- [ ] Lighthouse Performance >90
- [ ] Lighthouse Accessibility 100
- [ ] All 72 tools render correctly
- [ ] Cross-browser testing complete
- [ ] Bundle size optimized

---

## Tech Stack Summary

| Category | Technology | Version |
|----------|-----------|---------|
| **Framework** | Next.js | 16.0.1 |
| **React** | React | 19.2.0 |
| **Language** | TypeScript | 5.x |
| **Styling** | Tailwind CSS | 4.0 |
| **UI Library** | shadcn/ui | Latest |
| **Linting** | Biome | 2.2.0 |
| **Fonts** | Noto Sans KR | Google Fonts |

---

## Color Palette Quick Reference

```css
Primary:    #E5322D  /* Red - Brand */
Background: #FFFFFF  /* White */
Surface:    #F5F5F5  /* Light gray */
Text:       #171717  /* Near black */
Muted:      #47474F  /* Dark gray */
```

**Tool Categories**:
- Organize: #E5322D (Red)
- Optimize: #98D8C8 (Mint)
- Convert: #F6BD60 (Yellow)
- Edit: #F7B801 (Gold)
- Security: #AE7FA7 (Purple)

---

## Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Production build
npm start                # Start production server

# Code Quality
npm run lint             # Run Biome linting
npm run format           # Auto-format with Biome
npx tsc --noEmit         # Type check

# Testing
open http://localhost:3000        # View in browser
npx @next/bundle-analyzer         # Analyze bundle

# Setup
npx shadcn@latest init            # Initialize shadcn/ui
npx shadcn@latest add button      # Add component
```

---

## Contact & Support

### Project Information
- **Project Name**: iLovePDF Korean Homepage Clone
- **Target URL**: https://www.ilovepdf.com/ko
- **Repository**: Local development
- **Documentation Version**: 1.0.0
- **Last Updated**: 2025-11-08

### Getting Help
1. Check relevant documentation section
2. Review reference materials in `output/`
3. Search Next.js/shadcn/ui documentation
4. Check browser console for errors

---

## Documentation Maintenance

### When to Update
- New component added → Update COMPONENT_GUIDE.md
- Design token changed → Update DESIGN_TOKENS.md
- Setup process changed → Update SETUP_GUIDE.md
- Workflow improved → Update WORKFLOW.md

### Version History
- **v1.0.0** (2025-11-08) - Initial documentation
  - PROJECT_OVERVIEW.md
  - DESIGN_TOKENS.md
  - COMPONENT_GUIDE.md
  - SETUP_GUIDE.md
  - WORKFLOW.md
  - README.md (this file)

---

## Next Steps

### Immediate Actions
1. ✅ Documentation complete
2. 🔄 Install shadcn/ui (see SETUP_GUIDE.md)
3. 🔄 Configure design tokens
4. 🔄 Create component directories
5. ⏳ Begin component implementation

### Development Path
Follow **WORKFLOW.md** Phase 1-6 for structured development approach.

---

**Status**: Documentation Suite Complete ✅
**Total Documents**: 6 comprehensive guides
**Ready for**: Development kickoff
**First Step**: Follow SETUP_GUIDE.md for environment setup
