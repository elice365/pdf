"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useAppSelector } from "@/store/hooks";

interface ProcessingProgressProps {
  className?: string;
}

export function ProcessingProgress({ className }: ProcessingProgressProps) {
  const { isProcessing, progress, error, operation } = useAppSelector(
    (state) => state.pdf,
  );

  const shouldShow = isProcessing || error || progress === 100;

  const getStatusIcon = () => {
    if (error) {
      return (
        <XCircle className="w-6 h-6 text-destructive" aria-hidden="true" />
      );
    }
    if (progress === 100 && !isProcessing) {
      return (
        <CheckCircle2 className="w-6 h-6 text-success" aria-hidden="true" />
      );
    }
    return (
      <Loader2
        className="w-6 h-6 text-primary animate-spin"
        aria-hidden="true"
      />
    );
  };

  const getStatusText = () => {
    if (error) {
      return "처리 중 오류가 발생했습니다";
    }
    if (progress === 100 && !isProcessing) {
      return "처리가 완료되었습니다";
    }
    return operation ? `${operation} 중...` : "처리 중...";
  };

  const getStatusColor = () => {
    if (error) return "text-destructive";
    if (progress === 100 && !isProcessing) return "text-success";
    return "text-foreground";
  };

  return (
    <AnimatePresence mode="wait">
      {shouldShow && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] as const }}
        >
          <Card className={cn("p-6", className)}>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                {getStatusIcon()}
                <div className="flex-1">
                  <p className={cn("text-sm font-medium", getStatusColor())}>
                    {getStatusText()}
                  </p>
                  {error && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {error}
                    </p>
                  )}
                </div>
              </div>

              {!error && (
                <div className="space-y-2">
                  <div className="w-full bg-surface rounded-full h-2 overflow-hidden">
                    <motion.div
                      className={cn(
                        "h-full",
                        progress === 100 ? "bg-success" : "bg-primary",
                      )}
                      initial={{ width: "0%" }}
                      animate={{ width: `${progress}%` }}
                      transition={{
                        duration: 0.5,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                      role="progressbar"
                      aria-valuenow={progress}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label="처리 진행률"
                    />
                  </div>
                  <motion.p
                    className="text-xs text-muted-foreground text-right"
                    key={progress}
                    initial={{ opacity: 0.5 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    {progress}%
                  </motion.p>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
