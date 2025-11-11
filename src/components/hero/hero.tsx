"use client";

import { motion } from "framer-motion";

export function Hero() {
  return (
    <section
      className="bg-[#F7FAFC] dark:bg-[#1A202C] py-12 md:py-16"
      aria-label="Hero section"
    >
      <div className="container mx-auto px-4 text-center max-w-4xl">
        <motion.h1
          className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#1A202C] dark:text-white mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.6,
            ease: [0.16, 1, 0.3, 1] as const,
          }}
        >
          PDF 애호가들을 위한 온라인 툴
        </motion.h1>
        <motion.p
          className="text-base md:text-lg text-[#4A5568] dark:text-gray-300 leading-relaxed max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.6,
            delay: 0.2,
            ease: [0.16, 1, 0.3, 1] as const,
          }}
        >
          PDF 병합, PDF 나누기, PDF 압축, 오피스 파일에서 PDF로, PDF에서 JPG로
          변환 등!
        </motion.p>
      </div>
    </section>
  );
}
