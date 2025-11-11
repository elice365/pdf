import { ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ILoveImgCard() {
  return (
    <section
      className="w-full rounded-2xl bg-surface dark:bg-surface/30 p-8 md:p-12"
      aria-labelledby="iloveimg-title"
    >
      <div className="container mx-auto flex flex-col items-center justify-center text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white dark:bg-surface shadow-md dark:shadow-lg">
          <ImageIcon className="h-10 w-10 text-primary" aria-hidden="true" />
        </div>
        <h2
          id="iloveimg-title"
          className="mb-3 text-2xl font-bold text-foreground dark:text-foreground md:text-3xl"
        >
          이미지도 편집이 필요하신가요?
        </h2>
        <p className="mb-8 max-w-2xl text-lg text-muted-foreground dark:text-muted-foreground">
          iLoveIMG로 이미지를 쉽게 편집하세요
        </p>
        <Button
          size="lg"
          variant="outline"
          className="border-primary text-primary dark:border-primary dark:text-primary transition-all duration-[240ms] hover:bg-primary hover:text-white dark:hover:bg-primary dark:hover:text-white"
        >
          iLoveIMG 바로가기
        </Button>
      </div>
    </section>
  );
}
