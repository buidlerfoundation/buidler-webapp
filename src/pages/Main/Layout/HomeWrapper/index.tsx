import React, { useCallback, useEffect, useRef } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import SideBar from "shared/SideBar";
import useAppDispatch from "hooks/useAppDispatch";
import useCommunityId from "hooks/useCommunityId";
import useChannelId from "hooks/useChannelId";
import useChannels from "hooks/useChannels";
import {
  clearLastChannelId,
  getCookie,
  getLastChannelIdByCommunityId,
  setLastChannelIdByCommunityId,
} from "common/Cookie";
import { validateUUID } from "helpers/ChannelHelper";
import { getMessages } from "reducers/MessageReducers";
import { AsyncKey } from "common/AppConfig";
import {
  getExternalCommunityByChannelId,
  setUserCommunityData,
} from "reducers/UserActions";
import usePinnedCommunities from "hooks/usePinnedCommunities";
import { channelChanged } from "reducers/actions";
import { Channel } from "models/Community";
import api from "api";
import { USER_ACTIONS } from "reducers/UserReducers";

const HomeWrapper = () => {
  const dispatch = useAppDispatch();
  const getMessageActionRef = useRef<any>();
  const navigate = useNavigate();
  const matchCommunityId = useCommunityId();
  const matchChannelId = useChannelId();
  const pinnedCommunities = usePinnedCommunities();
  const channels = useChannels();
  const initialCommunityData = useCallback(async () => {
    if (pinnedCommunities?.length === 0) {
      navigate("/communities", { replace: true });
      return;
    }
    const community = pinnedCommunities?.find(
      (el) => el.community_id === matchCommunityId
    );
    const initialCommunityId =
      community?.community_id ||
      (await getCookie(AsyncKey.lastTeamId)) ||
      pinnedCommunities?.[1]?.community_id ||
      pinnedCommunities?.[0]?.community_id;
    if (initialCommunityId && !community?.fromExternal) {
      let initialChannelId = "";
      if (!channels) {
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
        const channel =
          channels?.find((el) => el.channel_id === matchChannelId) ||
          channels?.find((el) => el.channel_id === lastChannelIdByCommunityId);
        initialChannelId =
          channel?.channel_id || channels?.[0]?.channel_id || "";
      }
      if (
        !matchCommunityId ||
        !community ||
        !matchChannelId ||
        matchChannelId !== initialChannelId
      ) {
        if (matchCommunityId && matchChannelId) {
          const res = await dispatch(
            getExternalCommunityByChannelId({ channelId: matchChannelId })
          ).unwrap();
          if (res.success) return;
        }
        navigate(`/channels/${initialCommunityId}/${initialChannelId}`, {
          replace: true,
        });
      }
    }
  }, [
    channels,
    pinnedCommunities,
    dispatch,
    navigate,
    matchChannelId,
    matchCommunityId,
  ]);

  useEffect(() => {
    initialCommunityData();
  }, [initialCommunityData]);

  useEffect(() => {
    if (
      matchChannelId &&
      matchCommunityId &&
      validateUUID(matchChannelId) &&
      validateUUID(matchCommunityId)
    ) {
      setLastChannelIdByCommunityId(matchCommunityId, matchChannelId);
    }
  }, [matchChannelId, matchCommunityId]);

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
  const onLeaveChannel = useCallback(
    async (channel: Channel) => {
      const res = await api.leaveChannel(channel.channel_id);
      if (res.success) {
        const lastChannelId = await getLastChannelIdByCommunityId(
          matchCommunityId
        );
        if (lastChannelId === channel.channel_id) {
          clearLastChannelId(matchCommunityId);
        }
        dispatch(
          USER_ACTIONS.updateChannel({
            channelId: channel.channel_id,
            spaceId: channel.space_id,
            communityId: matchCommunityId,
            data: {
              is_channel_member: false,
              total_channel_members: (channel?.total_channel_members || 1) - 1,
            },
          })
        );
        navigate(`/channels/${matchCommunityId}`, { replace: true });
      }
    },
    [dispatch, matchCommunityId, navigate]
  );
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
        onLeaveChannel={onLeaveChannel}
      />
      <Outlet />
    </>
  );
};

export default HomeWrapper;
