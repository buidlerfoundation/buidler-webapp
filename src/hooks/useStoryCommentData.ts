import { useMemo } from "react";
import useAppSelector from "./useAppSelector";

function useStoryCommentData(id?: string | number | null) {
  const storyCommentData = useAppSelector(
    (state) => state.pinPost.storyCommentData
  );
  return useMemo(
    () => (id ? storyCommentData?.[id] : null),
    [id, storyCommentData]
  );
}

export default useStoryCommentData;
