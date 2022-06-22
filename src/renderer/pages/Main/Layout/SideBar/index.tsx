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
import { Droppable, Draggable } from "react-beautiful-dnd";
import ModalConfirmDelete from "renderer/shared/ModalConfirmDelete";
import { Space, UserData } from "renderer/models";
import PopoverButton from "renderer/shared/PopoverButton";
import {
  channelMenu,
  memberMenu,
  privateChannelMenu,
  spaceChannelMenu,
} from "renderer/utils/Menu";
import SpaceItem from "renderer/shared/SpaceItem";
import MemberSpace from "renderer/shared/MemberSpace";

type SideBarProps = {
  onEditGroupChannel: (group: any) => void;
  onEditChannelName: (channel: any) => void;
  onDeleteChannel: (channel: any) => void;
  onEditChannelMember: (channel: any) => void;
  onInviteMember: () => void;
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
      onDeleteChannel,
      onEditChannelMember,
      onInviteMember,
      onEditGroupChannel,
      onRemoveTeamMember,
      onSpaceBadgeClick,
    }: SideBarProps,
    ref
  ) => {
    const {
      userData,
      spaceChannel,
      channel,
      currentChannel,
      team,
      teamUserData,
    } = useAppSelector((state) => state.user);
    const [isOpenConfirmRemoveMember, setOpenConfirmRemoveMember] =
      useState(false);
    const [selectedMenuChannel, setSelectedMenuChannel] = useState<any>(null);
    const [selectedMenuMember, setSelectedMenuMember] = useState<any>(null);
    const [selectedMenuSpaceChannel, setSelectedMenuSpaceChannel] =
      useState<any>(null);
    const bottomBodyRef = useRef<any>();
    const menuPrivateChannelRef = useRef<any>();
    const menuChannelRef = useRef<any>();
    const menuSpaceChannelRef = useRef<any>();
    const menuMemberRef = useRef<any>();
    const isOwner = useMemo(() => {
      const role = teamUserData?.find?.(
        (el) => el.user_id === userData?.user_id
      )?.role;
      return role === "Owner";
    }, [teamUserData, userData?.user_id]);
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
    const handleContextMenuMemberSpace = useCallback(
      (e: React.MouseEvent<HTMLDivElement, MouseEvent>, u: UserData) => {
        setSelectedMenuMember(u);
        menuMemberRef.current?.show(e.currentTarget, {
          x: e.pageX,
          y: e.pageY,
        });
      },
      []
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
          case "Delete channel": {
            onDeleteChannel(selectedMenuChannel);
            break;
          }
          case "Remove member": {
            setOpenConfirmRemoveMember(true);
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
        selectedMenuChannel,
        selectedMenuSpaceChannel,
      ]
    );
    const renderSpaceItem = useCallback(
      (space: Space, idx: number) => {
        return (
          <Draggable
            key={space.space_id}
            draggableId={space.space_id}
            index={idx}
            isDragDisabled
          >
            {(dragProvided) => (
              <div
                ref={dragProvided.innerRef}
                {...dragProvided.draggableProps}
                {...dragProvided.dragHandleProps}
              >
                <SpaceItem
                  isOwner={isOwner}
                  space={space}
                  onContextSpaceChannel={handleContextMenuSpace}
                  onContextChannel={handleContextMenuChannel}
                  onSpaceBadgeClick={onSpaceBadgeClick}
                  channels={space.channels}
                />
              </div>
            )}
          </Draggable>
        );
      },
      [
        handleContextMenuChannel,
        handleContextMenuSpace,
        isOwner,
        onSpaceBadgeClick,
      ]
    );
    return (
      <div id="sidebar">
        {team && team?.length > 0 ? (
          <div className="sidebar-body">
            <Droppable droppableId="group-channel-container" isDropDisabled>
              {(provided) => {
                return (
                  <div ref={provided.innerRef} {...provided.droppableProps}>
                    {spaceChannel.map(renderSpaceItem)}
                    {provided.placeholder}
                  </div>
                );
              }}
            </Droppable>
            <div ref={bottomBodyRef} />
            <MemberSpace
              channel={channel}
              currentChannel={currentChannel}
              onContextMenu={handleContextMenuMemberSpace}
              onInviteMember={onInviteMember}
            />
          </div>
        ) : (
          <div className="sidebar-body" />
        )}
        <PopoverButton
          popupOnly
          ref={menuSpaceChannelRef}
          data={spaceChannelMenu}
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
