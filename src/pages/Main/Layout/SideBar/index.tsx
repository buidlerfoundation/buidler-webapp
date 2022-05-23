import React, {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import "./index.scss";
import { connect } from "react-redux";
import PopupMenuActions from "./components/PopupMenuActions";
import Popover from "@material-ui/core/Popover";
import { createErrorMessageSelector } from "../../../../reducers/selectors";
import actionTypes from "../../../../actions/ActionTypes";
import { Droppable, Draggable } from "react-beautiful-dnd";
import PopoverButton from "../../../../components/PopoverButton";
import {
  channelMenu,
  memberMenu,
  privateChannelMenu,
  spaceChannelMenu,
} from "../../../../utils/Menu";
import SpaceItem from "./components/SpaceItem";
import MemberSpace from "./components/MemberSpace";
import ModalConfirmDelete from "components/ModalConfirmDelete";

type SideBarProps = {
  team?: any;
  channel?: any;
  spaceChannel?: any;
  currentChannel?: any;
  logout?: any;
  errorTeam?: any;
  userData?: any;
  teamUserData?: Array<any>;
  currentTeam?: any;
  onEditGroupChannel: (group: any) => void;
  onDeleteGroupChannel: (group: any) => void;
  onEditChannelName: (channel: any) => void;
  onDeleteChannel: (channel: any) => void;
  onEditChannelMember: (channel: any) => void;
  onInviteMember: () => void;
  onRemoveTeamMember: (user: any) => void;
  updateTeam?: (teamId: string, body: any) => any;
  deleteTeam?: (teamId: string) => any;
  findUser?: () => any;
  findTeamAndChannel?: () => any;
  onCreateChannel: (initSpace?: any) => void;
  onCreateGroupChannel: () => void;
  updateSpaceChannel?: (spaceId: string, body: any) => any;
  uploadSpaceAvatar?: (teamId: string, spaceId: string, file: any) => any;
  updateChannel?: (channelId: string, body: any) => any;
  uploadChannelAvatar?: (teamId: string, channelId: string, file: any) => any;
};

const SideBar = forwardRef(
  (
    {
      team,
      channel,
      findTeamAndChannel,
      teamUserData,
      onCreateChannel,
      spaceChannel,
      currentChannel,
      errorTeam,
      findUser,
      userData,
      logout,
      currentTeam,
      onCreateGroupChannel,
      onDeleteGroupChannel,
      onEditChannelName,
      onDeleteChannel,
      onEditChannelMember,
      onInviteMember,
      onEditGroupChannel,
      onRemoveTeamMember,
      updateTeam,
      deleteTeam,
      updateSpaceChannel,
      uploadSpaceAvatar,
      updateChannel,
      uploadChannelAvatar,
    }: SideBarProps,
    ref
  ) => {
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
    const [anchorPopupActions, setPopupActions] = useState(null);
    const openActions = Boolean(anchorPopupActions);
    const idPopupActions = openActions ? "action-popover" : undefined;
    const role = teamUserData?.find?.(
      (el) => el.user_id === userData?.user_id
    )?.role;
    useEffect(() => {
      if (team == null && errorTeam === "") {
        findTeamAndChannel?.();
      }
    }, [team, errorTeam, findTeamAndChannel]);
    useEffect(() => {
      if (!userData) {
        findUser?.();
      }
    }, [userData, findUser]);
    useImperativeHandle(ref, () => {
      return {
        scrollToBottom: () => {
          bottomBodyRef.current?.scrollIntoView?.({ behavior: "smooth" });
        },
      };
    });
    const onRemoveMember = async () => {
      await onRemoveTeamMember(selectedMenuMember);
      setSelectedMenuMember(null);
      setOpenConfirmRemoveMember(false);
    };
    const onSelectedMenu = (menu: any) => {
      switch (menu.value) {
        case "Create channel": {
          onCreateChannel(selectedMenuSpaceChannel);
          break;
        }
        case "Create space": {
          onCreateGroupChannel();
          break;
        }
        case "Edit space name": {
          onEditGroupChannel(selectedMenuSpaceChannel);
          break;
        }
        case "Delete space": {
          onDeleteGroupChannel(selectedMenuSpaceChannel);
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
    };
    const isOwner = role === "Owner";
    return (
      <div id="sidebar">
        {team?.length > 0 ? (
          <div className="sidebar-body">
            <Droppable droppableId="group-channel-container" isDropDisabled>
              {(provided) => {
                return (
                  <div ref={provided.innerRef} {...provided.droppableProps}>
                    {spaceChannel.map((space: any, idx: number) => {
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
                                channel={channel}
                                currentChannel={currentChannel}
                                onCreateChannel={onCreateChannel}
                                onContextSpaceChannel={(e) => {
                                  if (!isOwner) return;
                                  setSelectedMenuSpaceChannel(space);
                                  menuSpaceChannelRef.current?.show(
                                    e.currentTarget,
                                    {
                                      x: e.pageX,
                                      y: e.pageY,
                                    }
                                  );
                                }}
                                onContextChannel={(e, c) => {
                                  if (!isOwner) return;
                                  setSelectedMenuChannel(c);
                                  if (c.channel_type === "Public") {
                                    menuChannelRef.current?.show(
                                      e.currentTarget,
                                      {
                                        x: e.pageX,
                                        y: e.pageY,
                                      }
                                    );
                                  } else {
                                    menuPrivateChannelRef.current?.show(
                                      e.currentTarget,
                                      {
                                        x: e.pageX,
                                        y: e.pageY,
                                      }
                                    );
                                  }
                                }}
                                updateSpaceChannel={updateSpaceChannel}
                                uploadSpaceAvatar={uploadSpaceAvatar}
                                updateChannel={updateChannel}
                                uploadChannelAvatar={uploadChannelAvatar}
                              />
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </div>
                );
              }}
            </Droppable>
            <div ref={bottomBodyRef} />
            <MemberSpace
              userData={userData}
              teamUserData={teamUserData}
              channel={channel}
              currentChannel={currentChannel}
              onContextMenu={(u) => (e) => {
                setSelectedMenuMember(u);
                menuMemberRef.current?.show(e.currentTarget, {
                  x: e.pageX,
                  y: e.pageY,
                });
              }}
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
          onClose={() => {}}
        />
        <PopoverButton
          popupOnly
          ref={menuMemberRef}
          data={memberMenu}
          onSelected={onSelectedMenu}
          onClose={() => {}}
        />
        <PopoverButton
          popupOnly
          ref={menuChannelRef}
          data={channelMenu}
          onSelected={onSelectedMenu}
          onClose={() => {}}
        />
        <PopoverButton
          popupOnly
          ref={menuPrivateChannelRef}
          data={privateChannelMenu}
          onSelected={onSelectedMenu}
          onClose={() => {}}
        />
        <Popover
          elevation={0}
          id={idPopupActions}
          open={openActions}
          anchorEl={anchorPopupActions}
          onClose={() => setPopupActions(null)}
          anchorOrigin={{
            vertical: "top",
            horizontal: "left",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "left",
          }}
        >
          <PopupMenuActions
            onCreateChannel={() => {
              setPopupActions(null);
              onCreateChannel();
            }}
            onLogout={() => logout?.()}
          />
        </Popover>
        <ModalConfirmDelete
          open={isOpenConfirmRemoveMember}
          handleClose={() => setOpenConfirmRemoveMember(false)}
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

const errorSelector = createErrorMessageSelector([actionTypes.TEAM_PREFIX]);

const mapStateToProps = (state: any) => {
  return {
    team: state.user.team,
    teamUserData: state.user.teamUserData,
    channel: state.user.channel,
    currentChannel: state.user.currentChannel,
    spaceChannel: state.user.spaceChannel,
    errorTeam: errorSelector(state),
    userData: state.user.userData,
    currentTeam: state.user.currentTeam,
  };
};

export default connect(mapStateToProps, undefined, null, {
  forwardRef: true,
})(SideBar);
