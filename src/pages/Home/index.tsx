import React, { memo, useCallback, useEffect, useRef } from "react";
import styles from "./index.module.scss";
import AppTitleBar from "pages/Main/Layout/AppTitleBar";
import useCommunityId from "hooks/useCommunityId";
import useChannelId from "hooks/useChannelId";
import useCommunities from "hooks/useCommunities";
import { getCookie, getLastChannelIdByCommunityId } from "common/Cookie";
import useAppDispatch from "hooks/useAppDispatch";
import { setUserCommunityData } from "reducers/UserReducers";
import { useHistory } from "react-router-dom";
import { AsyncKey } from "common/AppConfig";
import useChannels from "hooks/useChannels";
import { DragDropContext } from "react-beautiful-dnd";
import SideBar from "shared/SideBar";
import MessageChatBox from "shared/MessageChatBox";
import { useSocket } from "providers/SocketProvider";
import { validateUUID } from "helpers/ChannelHelper";
import { getMessages } from "reducers/MessageReducers";

const Home = () => {
  const socket = useSocket();
  const dispatch = useAppDispatch();
  const getMessageActionRef = useRef<any>();
  const history = useHistory();
  const matchCommunityId = useCommunityId();
  const matchChannelId = useChannelId();
  const communities = useCommunities();
  const channels = useChannels();
  const initialCommunityData = useCallback(async () => {
    const community = communities?.find(
      (el) => el.team_id === matchCommunityId
    );
    const initialCommunityId =
      community?.team_id ||
      (await getCookie(AsyncKey.lastTeamId)) ||
      communities?.[1]?.team_id ||
      communities?.[0]?.team_id;
    if (initialCommunityId) {
      let initialChannelId = "";
      if (!channels) {
        const { channelId, resChannel } = await dispatch(
          setUserCommunityData(initialCommunityId)
        ).unwrap();
        const channel = resChannel.data?.find(
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
        history.replace(`/channels/${initialCommunityId}/${initialChannelId}`);
      }
    }
  }, [
    channels,
    communities,
    dispatch,
    history,
    matchChannelId,
    matchCommunityId,
  ]);

  useEffect(() => {
    initialCommunityData();
  }, [initialCommunityData]);

  useEffect(() => {
    if (
      matchChannelId &&
      validateUUID(matchChannelId) &&
      socket.socketState === "connected"
    ) {
      if (getMessageActionRef.current) {
        getMessageActionRef.current.abort();
      }
      getMessageActionRef.current = dispatch(
        getMessages({ channelId: matchChannelId })
      );
    }
  }, [dispatch, matchChannelId, socket.socketState]);

  const onDragEnd = useCallback(() => {}, []);
  const handleOpenCreateChannel = useCallback(() => {}, []);
  const handleOpenCreateSpace = useCallback(() => {}, []);
  const handleOpenEditSpace = useCallback(() => {}, []);
  const handleOpenDeleteChannel = useCallback(() => {}, []);
  const handleRemoveTeamMember = useCallback(() => {}, []);
  const handleOpenEditChannelMember = useCallback(() => {}, []);
  const handleOpenEditChannelName = useCallback(() => {}, []);
  const handleOpenChannelNotification = useCallback(() => {}, []);
  const handleOpenInviteMember = useCallback(() => {}, []);
  const handleSpaceBadgeClick = useCallback(() => {}, []);
  const toggleOpenMembers = useCallback(() => {}, []);
  const onOpenChannelSetting = useCallback(() => {}, []);
  return (
    <div className={styles.container}>
      <AppTitleBar />
      <DragDropContext onDragEnd={onDragEnd}>
        <div className={styles.body}>
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
            onSpaceBadgeClick={handleSpaceBadgeClick}
            onViewMembers={toggleOpenMembers}
            onOpenChannelSetting={onOpenChannelSetting}
          />
          <div className={styles["content-side"]}></div>
          <div className={styles["chat-box__container"]}>
            <MessageChatBox />
          </div>
        </div>
      </DragDropContext>
    </div>
  );
};

export default memo(Home);
