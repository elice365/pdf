import { Heart } from "lucide-react";
import Link from "next/link";
import { AppDownloadButtons } from "./app-download-buttons";
import { FooterColumn } from "./footer-column";
import { footerSections } from "./footer-links";
import { SocialLinks } from "./social-links";

/**
 * Main Footer component
 * Comprehensive footer with logo, description, navigation, social media, and app downloads
 *
 * Layout:
 * - Desktop (≥1024px): 5-column grid
 * - Tablet (768-1023px): 3-column grid
 * - Mobile (<768px): Single column stack
 *
 * WCAG 2.1 AA compliant:
 * - Semantic HTML (footer, nav, section, ul/li)
 * - ARIA labels for navigation sections
 * - Color contrast 16.1:1 (white on #171717)
 * - Keyboard navigable links with focus visible
 */
export function Footer() {
  return (
    <footer className="bg-foreground dark:bg-[#0a0a0a] text-primary-foreground dark:text-foreground">
      <div className="container mx-auto px-4 py-12 md:py-16">
        {/* Main Footer Content - Multi-column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8 md:gap-12">
          {/* Column 1: Logo & Description */}
          <div className="md:col-span-1">
            <Link
              href="/"
              className="flex items-center gap-1 text-primary-foreground hover:opacity-80 transition-opacity mb-4"
              aria-label="iLovePDF 홈으로 이동"
            >
              <span className="text-2xl font-bold">i</span>
              <Heart className="w-5 h-5 fill-primary" aria-hidden="true" />
              <span className="text-2xl font-bold">PDF</span>
            </Link>
            <p className="text-sm text-primary-foreground/70 leading-relaxed">
              PDF 작업을 위한 가장 쉽고 빠른 온라인 도구
            </p>
          </div>

          {/* Column 2: Product Links */}
          <FooterColumn
            title={footerSections[0].title}
            links={footerSections[0].links}
          />

          {/* Column 3: Company Links */}
          <FooterColumn
            title={footerSections[1].title}
            links={footerSections[1].links}
          />

          {/* Column 4: Help & Resources Links */}
          <FooterColumn
            title={footerSections[2].title}
            links={footerSections[2].links}
          />

          {/* Column 5: Social Media & App Downloads */}
          <div className="md:col-span-3 lg:col-span-1">
            <SocialLinks />
            <AppDownloadButtons />
          </div>
        </div>

        {/* Bottom Bar - Copyright */}
        <div className="border-t border-white/10 mt-12 pt-8">
          <p className="text-xs text-center text-primary-foreground/60">
            © 2025 iLovePDF. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
