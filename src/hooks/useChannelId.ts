import { getURLObject } from "helpers/LinkHelper";
import React, { useMemo } from "react";
import { useParams } from "react-router-dom";
import useChannels from "./useChannels";
import useWebsiteUrl from "./useWebsiteUrl";

function useChannelId() {
  const websiteUrl = useWebsiteUrl();
  const params = useParams<{
    channel_id?: string;
  }>();
  const channels = useChannels();
  const channel_id = useMemo(() => {
    if (params?.channel_id) {
      return params?.channel_id;
    }
    if (websiteUrl) {
      const obj = getURLObject(websiteUrl);
      return (
        channels?.find((el) => el.channel_url === obj.channel_url)
          ?.channel_id || ""
      );
    }
    return "";
  }, [channels, params?.channel_id, websiteUrl]);

  return React.useMemo(() => channel_id || "", [channel_id]);
}

export default useChannelId;
