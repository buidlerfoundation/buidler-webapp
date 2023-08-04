import { useMemo } from "react";
import useAppSelector from "./useAppSelector";

function useCommentData(parentId?: string | null) {
  const commentData = useAppSelector((state) => state.pinPost.commentData);
  return useMemo(() => {
    if (!parentId) return null;
    return commentData[parentId];
  }, [commentData, parentId]);
}

export default useCommentData;
