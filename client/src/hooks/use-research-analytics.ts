// hooks/useResearchAnalytics.ts
import { useCallback } from "react";

export function useResearchAnalytics() {
  const trackView = useCallback(async (researchId: string) => {
    try {
      await fetch(`/api/research/${researchId}/view`, {
        method: "POST",
      });
    } catch (error) {
      console.error("Failed to track view:", error);
    }
  }, []);

  const trackDownload = useCallback(async (researchId: string) => {
    try {
      await fetch(`/api/research/${researchId}/download`, {
        method: "POST",
      });
    } catch (error) {
      console.error("Failed to track download:", error);
    }
  }, []);

  return { trackView, trackDownload };
}