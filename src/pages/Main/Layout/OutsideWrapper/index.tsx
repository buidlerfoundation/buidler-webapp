import React, { useEffect, useRef } from "react";
import { Outlet } from "react-router-dom";
import useAppDispatch from "hooks/useAppDispatch";
import useChannelId from "hooks/useChannelId";
import { validateUUID } from "helpers/ChannelHelper";
import { getMessages } from "reducers/MessageReducers";
import { channelChanged } from "reducers/actions";
import useCurrentCommunity from "hooks/useCurrentCommunity";
import { getAnalytic } from "reducers/AnalyticReducers";

const OutsideWrapper = () => {
  const dispatch = useAppDispatch();
  const getMessageActionRef = useRef<any>();
  const matchChannelId = useChannelId();
  const community = useCurrentCommunity();

  useEffect(() => {
    if (matchChannelId && validateUUID(matchChannelId)) {
      dispatch(channelChanged());
      if (getMessageActionRef.current) {
        getMessageActionRef.current.abort();
      }
      getMessageActionRef.current = dispatch(
        getMessages({ channelId: matchChannelId })
      );
    }
  }, [dispatch, matchChannelId]);
  useEffect(() => {
    if (community.community_url) {
      dispatch(getAnalytic({ communityUrl: community.community_url }));
    }
  }, [community.community_url, dispatch]);
  return <Outlet />;
};

export default OutsideWrapper;
