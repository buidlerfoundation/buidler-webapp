import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import SideBar from "shared/SideBar";
import useAppDispatch from "hooks/useAppDispatch";
import useCommunityId from "hooks/useCommunityId";
import useChannelId from "hooks/useChannelId";
import useCommunities from "hooks/useCommunities";
import useChannels from "hooks/useChannels";
import { getCookie, getLastChannelIdByCommunityId } from "common/Cookie";
import { validateUUID } from "helpers/ChannelHelper";
import { getMessages } from "reducers/MessageReducers";
import { AsyncKey } from "common/AppConfig";
import { setUserCommunityData } from "reducers/UserReducers";
import { getPinPosts } from "reducers/PinPostReducers";

const HomeWrapper = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const getMessageActionRef = useRef<any>();
  const getPostActionRef = useRef<any>();
  const navigate = useNavigate();
  const matchCommunityId = useCommunityId();
  const matchChannelId = useChannelId();
  const communities = useCommunities();
  const channels = useChannels();
  const hideLayoutElement = useMemo(
    () =>
      location.pathname.includes("panel") ||
      location.pathname.includes("plugin"),
    [location.pathname]
  );
  const initialCommunityData = useCallback(async () => {
    const community = communities?.find(
      (el) => el.community_id === matchCommunityId
    );
    const initialCommunityId =
      community?.community_id ||
      (await getCookie(AsyncKey.lastTeamId)) ||
      communities?.[1]?.community_id ||
      communities?.[0]?.community_id;
    if (initialCommunityId) {
      let initialChannelId = "";
      if (!channels || channels.length === 0) {
        const { channelId, channels } = await dispatch(
          setUserCommunityData(initialCommunityId)
        ).unwrap();
        const channel = channels?.find(
          (el) => el.channel_id === matchChannelId
        );
        initialChannelId = channel?.channel_id || channelId || "";
      } else {
        const lastChannelIdByCommunityId = await getLastChannelIdByCommunityId(
          initialCommunityId
        );
        const channel = channels?.find(
          (el) => el.channel_id === matchChannelId
        );
        initialChannelId =
          channel?.channel_id ||
          lastChannelIdByCommunityId ||
          channels?.[0]?.channel_id ||
          "";
      }
      if (!matchCommunityId || !community || !matchChannelId) {
        navigate(`/channels/${initialCommunityId}/${initialChannelId}`, {
          replace: true,
        });
      }
    }
  }, [
    channels,
    communities,
    dispatch,
    navigate,
    matchChannelId,
    matchCommunityId,
  ]);

  useEffect(() => {
    initialCommunityData();
  }, [initialCommunityData]);

  useEffect(() => {
    if (matchChannelId && validateUUID(matchChannelId)) {
      if (getMessageActionRef.current) {
        getMessageActionRef.current.abort();
      }
      getMessageActionRef.current = dispatch(
        getMessages({ channelId: matchChannelId })
      );
    }
  }, [dispatch, matchChannelId]);
  useEffect(() => {
    if (matchChannelId && validateUUID(matchChannelId)) {
      if (getPostActionRef.current) {
        getPostActionRef.current.abort();
      }
      getPostActionRef.current = dispatch(
        getPinPosts({ channel_id: matchChannelId })
      );
    }
  }, [dispatch, matchChannelId]);
  const handleOpenCreateChannel = useCallback(() => {}, []);
  const handleOpenCreateSpace = useCallback(() => {}, []);
  const handleOpenEditSpace = useCallback(() => {}, []);
  const handleOpenDeleteChannel = useCallback(() => {}, []);
  const handleRemoveTeamMember = useCallback(() => {}, []);
  const handleOpenEditChannelMember = useCallback(() => {}, []);
  const handleOpenEditChannelName = useCallback(() => {}, []);
  const handleOpenChannelNotification = useCallback(() => {}, []);
  const handleOpenInviteMember = useCallback(() => {}, []);
  const toggleOpenMembers = useCallback(() => {}, []);
  const onOpenChannelSetting = useCallback(() => {}, []);
  if (hideLayoutElement) {
    return <Outlet />;
  }
  return (
    <>
      <SideBar
        onCreateChannel={handleOpenCreateChannel}
        onCreateGroupChannel={handleOpenCreateSpace}
        onEditGroupChannel={handleOpenEditSpace}
        onDeleteChannel={handleOpenDeleteChannel}
        onRemoveTeamMember={handleRemoveTeamMember}
        onEditChannelMember={handleOpenEditChannelMember}
        onEditChannelName={handleOpenEditChannelName}
        onUpdateNotification={handleOpenChannelNotification}
        onInviteMember={handleOpenInviteMember}
        onViewMembers={toggleOpenMembers}
        onOpenChannelSetting={onOpenChannelSetting}
      />
      <Outlet />
    </>
  );
};

export default HomeWrapper;