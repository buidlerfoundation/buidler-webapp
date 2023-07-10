import { useMemo } from "react";
import useAppSelector from "./useAppSelector";

function useStoryId() {
  const storyId = useAppSelector((state) => state.pinPost.selectedStoryId);
  return useMemo(() => storyId, [storyId]);
}

export default useStoryId;
