import { useCallback, useEffect, useMemo, useState } from "react";
import api from "renderer/api";
import { TaskData } from "renderer/models";
import useArchivedPinPosts from "./useArchivedPinPosts";
import useMatchPostId from "./useMatchPostId";
import usePinPosts from "./usePinPosts";

const usePostData = () => {
  const [data, setData] = useState<{
    data?: TaskData | null;
    fetchingPost: boolean;
    errorPost?: string;
  }>({ data: null, fetchingPost: false, errorPost: "" });
  const postId = useMatchPostId();
  const posts = usePinPosts();
  const archivedPosts = useArchivedPinPosts();
  const fetchPost = useCallback(async () => {
    if (!postId) return;
    setData({ data: null, fetchingPost: true, errorPost: "" });
    const postRes = await api.getPostById(postId);
    if (postRes.success) {
      setData({ data: postRes.data, fetchingPost: false, errorPost: "" });
    } else {
      setData({ data: null, fetchingPost: false, errorPost: postRes.message });
    }
  }, [postId]);
  useEffect(() => {
    if (!postId || postId === data.data?.task_id) return;
    const post =
      posts.find((el) => el.task_id === postId) ||
      archivedPosts.find((el) => el.task_id === postId);
    if (!!post) {
      setData({ data: post, fetchingPost: false, errorPost: "" });
    } else {
      fetchPost();
    }
  }, [fetchPost, postId, posts, archivedPosts, data.data?.task_id]);
  return useMemo(() => data, [data]);
};

export default usePostData;
