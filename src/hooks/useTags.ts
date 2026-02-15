import { useState, useCallback } from "react";
import { useConfigStore } from "../stores/configStore";
import { invokeCommand } from "../utils/api";

export function useTags() {
  const { config, assignTag, unassignTag, getTagAssignments } =
    useConfigStore();
  const [cardData, setCardData] = useState<Record<string, string> | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateCard = useCallback(async (mediaPath: string) => {
    setIsGenerating(true);
    try {
      const data = await invokeCommand<Record<string, string>>(
        "generate_card_data",
        { mediaPath }
      );
      setCardData(data);
      return data;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return {
    tags: config?.tags ?? {},
    assign: assignTag,
    unassign: unassignTag,
    getAssignments: getTagAssignments,
    generateCard,
    cardData,
    isGenerating,
  };
}
