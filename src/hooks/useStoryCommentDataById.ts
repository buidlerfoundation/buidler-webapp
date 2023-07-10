import { useMemo } from "react";
import useAppSelector from "./useAppSelector";

function useStoryCommentDataById(id?: string | null) {
  const storyCommentData = useAppSelector(
    (state) => state.story.storyCommentData
  );
  return useMemo(
    () => (id ? storyCommentData?.[id] : null),
    [id, storyCommentData]
  );
}

export default useStoryCommentDataById;
