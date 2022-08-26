import { useCallback, useEffect, useMemo, useState } from "react";
import { TaskData } from "renderer/models";
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
  const fetchPost = useCallback(async () => {
    setData({ data: null, fetchingPost: true, errorPost: "" });
    // TODO API get post by id
    // const post = await api.getPost
    setData({ data: posts[0], fetchingPost: false, errorPost: "" });
  }, [posts]);
  useEffect(() => {
    const post = posts.find((el) => el.task_id === postId);
    if (!!post) {
      setData({ data: post, fetchingPost: false, errorPost: "" });
    } else {
      fetchPost();
    }
  }, [fetchPost, postId, posts]);
  return useMemo(() => data, [data]);
};

export default usePostData;
