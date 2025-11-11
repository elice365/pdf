import Link from "next/link";
import type { FooterLink } from "./footer-links";

interface FooterColumnProps {
  title: string;
  links: FooterLink[];
}

/**
 * Reusable footer column component
 * Displays a list of links with consistent styling
 *
 * @param title - Column heading text
 * @param links - Array of footer link objects
 */
export function FooterColumn({ title, links }: FooterColumnProps) {
  return (
    <div>
      <h3 className="text-base font-bold mb-4 text-primary-foreground">
        {title}
      </h3>
      <nav aria-label={`${title} 링크`}>
        <ul className="space-y-3">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-sm text-primary-foreground/70 hover:text-primary-foreground hover:text-primary transition-all duration-[240ms] ease-out inline-block"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
