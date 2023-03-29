import React, {
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
  useCallback,
  useMemo,
  memo,
} from "react";
import useAppSelector from "renderer/hooks/useAppSelector";
import "./index.scss";
import ModalConfirmDelete from "renderer/shared/ModalConfirmDelete";
import { Space } from "renderer/models";
import PopoverButton from "renderer/shared/PopoverButton";
import {
  channelMenu,
  memberMenu,
  privateChannelMenu,
  spaceChannelMenu,
  spaceExclusiveChannelMenu,
} from "renderer/utils/Menu";
import SpaceItem from "renderer/shared/SpaceItem";
import images from "renderer/common/images";
import useMatchCommunityId from "renderer/hooks/useMatchCommunityId";
import useSpaceChannel from "renderer/hooks/useSpaceChannel";
import useCurrentCommunity from "renderer/hooks/useCurrentCommunity";
import CommunityHeader from "renderer/shared/CommunityHeader";

type SideBarProps = {
  onEditGroupChannel: (group: any) => void;
  onEditChannelName: (channel: any) => void;
  onOpenChannelSetting: (channel: any) => void;
  onUpdateNotification: (channel: any) => void;
  onDeleteChannel: (channel: any) => void;
  onEditChannelMember: (channel: any) => void;
  onInviteMember: () => void;
  onViewMembers: () => void;
  onRemoveTeamMember: (user: any) => void;
  onCreateChannel: (initSpace?: any) => void;
  onCreateGroupChannel: () => void;
  onSpaceBadgeClick: (space: Space) => void;
};

const SideBar = forwardRef(
  (
    {
      onCreateChannel,
      onCreateGroupChannel,
      onEditChannelName,
      onOpenChannelSetting,
      onUpdateNotification,
      onDeleteChannel,
      onEditChannelMember,
      onInviteMember,
      onEditGroupChannel,
      onRemoveTeamMember,
      onSpaceBadgeClick,
      onViewMembers,
    }: SideBarProps,
    ref
  ) => {
    const { team } = useAppSelector((state) => state.user);
    const currentTeam = useCurrentCommunity();
    const communityId = useMatchCommunityId();
    const spaceChannel = useSpaceChannel();
    const spaceToggle = useAppSelector((state) => state.sideBar.spaceToggle);
    const [isOpenConfirmRemoveMember, setOpenConfirmRemoveMember] =
      useState(false);
    const [selectedMenuChannel, setSelectedMenuChannel] = useState<any>(null);
    const [selectedMenuMember, setSelectedMenuMember] = useState<any>(null);
    const [selectedMenuSpaceChannel, setSelectedMenuSpaceChannel] =
      useState<Space | null>(null);
    const bottomBodyRef = useRef<any>();
    const menuPrivateChannelRef = useRef<any>();
    const menuChannelRef = useRef<any>();
    const menuSpaceChannelRef = useRef<any>();
    const menuMemberRef = useRef<any>();
    const isOwner = useMemo(() => {
      const role =
        team?.find((el) => el.team_id === communityId)?.role ||
        currentTeam.role;
      return role === "Owner" || role === "Admin";
    }, [communityId, currentTeam.role, team]);
    useImperativeHandle(ref, () => {
      return {
        scrollToBottom: () => {
          bottomBodyRef.current?.scrollIntoView?.({ behavior: "smooth" });
        },
      };
    });
    const handleCloseModalConfirmDelete = useCallback(
      () => setOpenConfirmRemoveMember(false),
      []
    );
    const onRemoveMember = useCallback(async () => {
      await onRemoveTeamMember(selectedMenuMember);
      setSelectedMenuMember(null);
      setOpenConfirmRemoveMember(false);
    }, [onRemoveTeamMember, selectedMenuMember]);
    const spaceChannelMenuData = useMemo(() => {
      if (selectedMenuSpaceChannel?.space_type === "Private")
        return spaceExclusiveChannelMenu;
      return spaceChannelMenu;
    }, [selectedMenuSpaceChannel?.space_type]);
    const handleContextMenuSpace = useCallback(
      (e, space) => {
        if (!isOwner) return;
        setSelectedMenuSpaceChannel(space);
        menuSpaceChannelRef.current?.show(e.currentTarget, {
          x: e.pageX,
          y: e.pageY,
        });
      },
      [isOwner]
    );
    const handleContextMenuChannel = useCallback(
      (e, c) => {
        if (!isOwner) return;
        setSelectedMenuChannel(c);
        if (c.channel_type === "Public") {
          menuChannelRef.current?.show(e.currentTarget, {
            x: e.pageX,
            y: e.pageY,
          });
        } else {
          menuPrivateChannelRef.current?.show(e.currentTarget, {
            x: e.pageX,
            y: e.pageY,
          });
        }
      },
      [isOwner]
    );
    const onSelectedMenu = useCallback(
      (menu: any) => {
        switch (menu.value) {
          case "Create channel": {
            onCreateChannel(selectedMenuSpaceChannel);
            break;
          }
          case "Create space": {
            onCreateGroupChannel();
            break;
          }
          case "Space setting": {
            onEditGroupChannel(selectedMenuSpaceChannel);
            break;
          }
          case "Edit member": {
            onEditChannelMember(selectedMenuChannel);
            break;
          }
          case "Edit channel name": {
            onEditChannelName(selectedMenuChannel);
            break;
          }
          case "Channel setting": {
            onOpenChannelSetting(selectedMenuChannel);
            break;
          }
          case "Notification": {
            onUpdateNotification(selectedMenuChannel);
            break;
          }
          case "Delete channel": {
            onDeleteChannel(selectedMenuChannel);
            break;
          }
          case "Remove member": {
            setOpenConfirmRemoveMember(true);
            break;
          }
          case "View entry requirement": {
            if (!!selectedMenuSpaceChannel)
              onSpaceBadgeClick(selectedMenuSpaceChannel);
            break;
          }
          default:
            break;
        }
        setSelectedMenuSpaceChannel(null);
        setSelectedMenuChannel(null);
      },
      [
        onCreateChannel,
        onCreateGroupChannel,
        onDeleteChannel,
        onEditChannelMember,
        onEditChannelName,
        onEditGroupChannel,
        onOpenChannelSetting,
        onSpaceBadgeClick,
        onUpdateNotification,
        selectedMenuChannel,
        selectedMenuSpaceChannel,
      ]
    );
    const renderSpaceItem = useCallback(
      (space: Space) => {
        return (
          <SpaceItem
            key={space.space_id}
            isOwner={isOwner}
            space={space}
            onContextSpaceChannel={handleContextMenuSpace}
            onContextChannel={handleContextMenuChannel}
            onSpaceBadgeClick={onSpaceBadgeClick}
            onCreateChannelClick={onCreateChannel}
            channel_ids={space.channel_ids}
            isCollapsed={
              spaceToggle[space.space_id] === undefined
                ? false
                : !spaceToggle[space.space_id]
            }
          />
        );
      },
      [
        handleContextMenuChannel,
        handleContextMenuSpace,
        isOwner,
        onCreateChannel,
        onSpaceBadgeClick,
        spaceToggle,
      ]
    );
    return (
      <div id="sidebar">
        {team && team?.length > 0 ? (
          <div className="sidebar-body">
            <CommunityHeader
              onInvitePress={onInviteMember}
              onViewAllMembers={onViewMembers}
            />
            {spaceChannel.map(renderSpaceItem)}
            <div ref={bottomBodyRef} style={!isOwner ? { minHeight: 10 } : {}} />
            {isOwner && (
              <div className="btn-create-space" onClick={onCreateGroupChannel}>
                <img src={images.icPlus} alt="" className="ic-plus" />
                <span className="create-space-text">New space</span>
              </div>
            )}
          </div>
        ) : (
          <div className="sidebar-body" />
        )}
        <PopoverButton
          popupOnly
          ref={menuSpaceChannelRef}
          data={spaceChannelMenuData}
          onSelected={onSelectedMenu}
        />
        <PopoverButton
          popupOnly
          ref={menuMemberRef}
          data={memberMenu}
          onSelected={onSelectedMenu}
        />
        <PopoverButton
          popupOnly
          ref={menuChannelRef}
          data={channelMenu}
          onSelected={onSelectedMenu}
        />
        <PopoverButton
          popupOnly
          ref={menuPrivateChannelRef}
          data={privateChannelMenu}
          onSelected={onSelectedMenu}
        />
        <ModalConfirmDelete
          open={isOpenConfirmRemoveMember}
          handleClose={handleCloseModalConfirmDelete}
          title="Remove member"
          description="Are you sure you want to remove?"
          contentName={selectedMenuMember?.user_name}
          contentDelete="Remove"
          onDelete={onRemoveMember}
        />
      </div>
    );
  }
);

export default memo(SideBar);
