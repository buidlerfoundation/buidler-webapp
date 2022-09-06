import { useCallback, useEffect, useMemo, useState } from "react";
import { getPinPostDetail } from "renderer/actions/TaskActions";
import { TaskData } from "renderer/models";
import useAppDispatch from "./useAppDispatch";
import useAppSelector from "./useAppSelector";
import useArchivedPinPosts from "./useArchivedPinPosts";
import useMatchPostId from "./useMatchPostId";
import usePinPosts from "./usePinPosts";

const usePostData = () => {
  const [data, setData] = useState<{
    data?: TaskData | null;
    fetchingPost: boolean;
    errorPost?: string;
  }>({ data: null, fetchingPost: false, errorPost: "" });
  const dispatch = useAppDispatch();
  const postId = useMatchPostId();
  const posts = usePinPosts();
  const archivedPosts = useArchivedPinPosts();
  const pinPostDetail = useAppSelector((state) => state.task.pinPostDetail);
  const fetchPost = useCallback(async () => {
    if (!postId) return;
    setData({ data: null, fetchingPost: true, errorPost: "" });
    const postRes: any = await dispatch(getPinPostDetail(postId));
    if (postRes.success) {
      setData({ data: postRes.data, fetchingPost: false, errorPost: "" });
    } else {
      setData({ data: null, fetchingPost: false, errorPost: postRes.message });
    }
  }, [dispatch, postId]);
  useEffect(() => {
    if (!postId) return;
    const post =
      posts.find((el) => el.task_id === postId) ||
      archivedPosts.find((el) => el.task_id === postId);
    if (!!post) {
      setData({ data: post, fetchingPost: false, errorPost: "" });
    } else if (postId === pinPostDetail?.task_id) {
      setData({ data: pinPostDetail, fetchingPost: false, errorPost: "" });
    } else {
      fetchPost();
    }
  }, [fetchPost, postId, posts, archivedPosts, pinPostDetail]);
  return useMemo(() => data, [data]);
};

export default usePostData;
