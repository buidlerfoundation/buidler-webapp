import { useCallback, useEffect, useMemo, useState } from "react";
import useTopicData from "./useTopicData";
import { IHNStory } from "models/Community";
import api from "api";
import useChannel from "./useChannel";

function useStoryDataById(id?: string | null) {
  const [storyData, setStoryData] = useState<{
    data?: IHNStory | null;
    loading: boolean;
  }>({
    data: null,
    loading: false,
  });
  const channel = useChannel();
  const topicData = useTopicData(channel?.dapp_integration_url);
  const getStory = useCallback(async () => {
    if (id) {
      setStoryData({ data: null, loading: true });
      const res = await api.getStoryById(id);
      if (res.success) {
        setStoryData({ data: res.data, loading: false });
      } else {
        setStoryData({ data: null, loading: false });
      }
    }
  }, [id]);
  useEffect(() => {
    if (id) {
      const story = topicData?.stories?.find((el) => el.id === id);
      if (story) {
        setStoryData({ data: story, loading: false });
      } else {
        getStory();
      }
    }
  }, [getStory, id, topicData?.stories]);
  return useMemo(() => storyData, [storyData]);
}

export default useStoryDataById;
