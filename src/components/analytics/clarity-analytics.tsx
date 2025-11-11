"use client";

import clarity from "@microsoft/clarity";
import { useEffect } from "react";

/**
 * Microsoft Clarity Analytics Component
 *
 * 프로젝트 ID: u2jdlygihy
 * 사용자 행동 분석, 히트맵, 세션 리플레이 제공
 */

const CLARITY_PROJECT_ID = "u2m6puspgu";

export function ClarityAnalytics() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      clarity.init(CLARITY_PROJECT_ID);
    }
  }, []);

  return null;
}
