"use client";

import { Facebook, Instagram, Twitter, Youtube } from "lucide-react";
import Link from "next/link";

const socialMediaLinks = [
  {
    name: "Facebook",
    href: "https://facebook.com/ilovepdf",
    icon: Facebook,
    label: "Facebook에서 iLovePDF 팔로우하기",
  },
  {
    name: "Twitter",
    href: "https://twitter.com/ilovepdf",
    icon: Twitter,
    label: "Twitter에서 iLovePDF 팔로우하기",
  },
  {
    name: "Instagram",
    href: "https://instagram.com/ilovepdf",
    icon: Instagram,
    label: "Instagram에서 iLovePDF 팔로우하기",
  },
  {
    name: "Youtube",
    href: "https://youtube.com/ilovepdf",
    icon: Youtube,
    label: "Youtube에서 iLovePDF 구독하기",
  },
] as const;

/**
 * Social media icons component
 * Client component for interactive hover effects
 */
export function SocialLinks() {
  return (
    <div>
      <h3 className="text-base font-bold mb-4 text-primary-foreground">
        소셜 미디어
      </h3>
      <div className="flex gap-4">
        {socialMediaLinks.map((social) => {
          const Icon = social.icon;
          return (
            <Link
              key={social.name}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={social.label}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-primary-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-[240ms] ease-out"
            >
              <Icon className="w-5 h-5" aria-hidden="true" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
