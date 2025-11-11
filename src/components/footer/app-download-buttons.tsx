import { Apple, Smartphone } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const appStoreLinks = [
  {
    name: "App Store",
    href: "https://apps.apple.com/app/ilovepdf/id1207738318",
    icon: Apple,
    label: "App Store에서 다운로드",
  },
  {
    name: "Google Play",
    href: "https://play.google.com/store/apps/details?id=com.ilovepdf.www",
    icon: Smartphone,
    label: "Google Play에서 다운로드",
  },
] as const;

/**
 * App download buttons component
 * iOS App Store and Google Play Store links
 */
export function AppDownloadButtons() {
  return (
    <div className="mt-8">
      <h3 className="text-base font-bold mb-4 text-primary-foreground">
        모바일 앱
      </h3>
      <div className="flex flex-col gap-3">
        {appStoreLinks.map((store) => {
          const Icon = store.icon;
          return (
            <Button
              key={store.name}
              asChild
              variant="outline"
              className="w-full justify-start gap-2 bg-transparent border-white/20 text-primary-foreground hover:bg-white/10 hover:border-white/40 hover:text-primary-foreground transition-all duration-[240ms]"
            >
              <Link
                href={store.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={store.label}
              >
                <Icon className="w-5 h-5" aria-hidden="true" />
                <span className="text-sm">{store.label}</span>
              </Link>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
