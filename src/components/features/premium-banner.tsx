import { Button } from "@/components/ui/button";

export function PremiumBanner() {
  return (
    <section
      className="w-full rounded-xl bg-[#F6E5B8] dark:bg-gradient-to-r dark:from-[#3a2f1f] dark:to-[#2d2416] py-10 md:py-12 dark:border dark:border-border"
      aria-labelledby="premium-title"
    >
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left Content */}
          <div className="flex-1">
            <h2
              id="premium-title"
              className="mb-4 text-2xl md:text-3xl font-bold text-foreground dark:text-[#F6E5B8]"
            >
              프리미엄으로 더 많은 혜택 제공
            </h2>
            <ul className="space-y-2 text-sm md:text-base text-foreground/80 dark:text-[#F6E5B8]/90">
              <li className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-green-600 dark:text-green-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  role="img"
                  aria-label="체크"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                무제한으로 모든 PDF 도구를 이용하세요
              </li>
              <li className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-green-600 dark:text-green-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  role="img"
                  aria-label="체크"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                PDF를 동시에 대량으로 처리하세요
              </li>
              <li className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-green-600 dark:text-green-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  role="img"
                  aria-label="체크"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                더 큰 크기의 PDF를 빠르게 변환하세요
              </li>
            </ul>
          </div>

          {/* Right Button */}
          <div>
            <Button
              size="lg"
              className="bg-primary text-white hover:bg-primary/90 px-8"
            >
              프리미엄 보기
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
