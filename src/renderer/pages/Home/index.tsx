import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  memo,
} from "react";
import { DragDropContext } from "react-beautiful-dnd";
import moment from "moment";
import PageWrapper from "renderer/shared/PageWrapper";
import { useHistory, useRouteMatch } from "react-router-dom";
import {
  createMemberChannelData,
  validateUUID,
} from "renderer/helpers/ChannelHelper";
import { getCookie, removeCookie } from "renderer/common/Cookie";
import { AsyncKey, SpaceBadge } from "renderer/common/AppConfig";
import ModalOTP from "renderer/shared/ModalOTP";
import ModalCreateSpace from "renderer/shared/ModalCreateSpace";
import toast from "react-hot-toast";
import { uniqBy } from "lodash";
import { CreateSpaceData, MessageData, Space, TaskData } from "renderer/models";
import ModalSpaceSetting from "renderer/shared/ModalSpaceSetting";
import ModalSpaceDetail from "renderer/shared/ModalSpaceDetail";
import { getSpaceBackgroundColor } from "renderer/helpers/SpaceHelper";
import ImageHelper from "renderer/common/ImageHelper";
import useAppSelector from "renderer/hooks/useAppSelector";
import {
  clearLastChannel,
  createNewChannel,
  createSpaceChannel,
  deleteChannel,
  deleteSpaceChannel,
  dragChannel,
  getSpaceMembers,
  removeTeamMember,
  setCurrentChannel,
} from "renderer/actions/UserActions";
import {
  createTask,
  deleteTask,
  dropTask,
  getTaskFromUser,
  getTasks,
  updateTask,
} from "renderer/actions/TaskActions";
import { getMessages } from "renderer/actions/MessageActions";
import ModalCreateTask from "../../shared/ModalCreateTask";
import SideBar from "../Main/Layout/SideBar";
import ChannelView from "./container/ChannelView";
import TaskListView from "./container/TaskListView";
import "./index.scss";
import ModalCreateChannel from "../../shared/ModalCreateChannel";
import {
  createLoadingSelector,
  createLoadMoreSelector,
} from "../../reducers/selectors";
import actionTypes from "../../actions/ActionTypes";
import { PopoverItem } from "../../shared/PopoverButton";
import ModalTaskView from "../../shared/ModalTaskView";
import { groupTaskByFiltered } from "../../helpers/TaskHelper";
import ModalConversation from "../../shared/ModalConversation";
import GlobalVariable from "../../services/GlobalVariable";
import ModalConfirmDeleteGroupChannel from "../../shared/ModalConfirmDeleteGroupChannel";
import ModalConfirmDeleteChannel from "../../shared/ModalConfirmDeleteChannel";
import ModalInviteMember from "../../shared/ModalInviteMember";
import useAppDispatch from "renderer/hooks/useAppDispatch";
import MetamaskUtils from "renderer/services/connectors/MetamaskUtils";
import ModalUserProfile from "renderer/shared/ModalUserProfile";
import GoogleAnalytics from "renderer/services/analytics/GoogleAnalytics";
import ModalAllMembers from "renderer/shared/ModalAllMembers";
import { getTransactions } from "renderer/actions/TransactionActions";
import useChannel from "renderer/hooks/useChannel";
import useSpaceChannel from "renderer/hooks/useSpaceChannel";
import useTeamUserData from "renderer/hooks/useTeamUserData";
import useMatchChannelId from "renderer/hooks/useMatchChannelId";
import AppTitleBar from "renderer/shared/AppTitleBar";
import useMatchCommunityId from "renderer/hooks/useMatchCommunityId";
import HomeLoading from "renderer/shared/HomeLoading";
import useCurrentChannel from "renderer/hooks/useCurrentChannel";
import useCurrentCommunity from "renderer/hooks/useCurrentCommunity";
import PinPostList from "renderer/shared/PinPostList";
import ModalCreatePinPost from "renderer/shared/ModalCreatePinPost";

const loadMoreMessageSelector = createLoadMoreSelector([
  actionTypes.MESSAGE_PREFIX,
]);

const loadingSelector = createLoadingSelector([
  actionTypes.CURRENT_TEAM_PREFIX,
]);

const filterTask: Array<PopoverItem> = [
  {
    label: "Status",
    value: "Status",
  },
  { label: "Due Date", value: "Due Date" },
  { label: "Channel", value: "Channel" },
  { label: "Assignee", value: "Assignee" },
];

const Home = () => {
  const match = useRouteMatch<{
    match_channel_id?: string;
    match_community_id?: string;
  }>();
  const { match_channel_id, match_community_id } = useMemo(
    () => match.params,
    [match.params]
  );
  const dispatch = useAppDispatch();
  const loadMoreMessage = useAppSelector((state) =>
    loadMoreMessageSelector(state)
  );
  const loading = useAppSelector((state) => loadingSelector(state));
  const [currentUserId, setCurrentUserId] = useState("");
  const community = useAppSelector((state) => state.user.team);
  const storeChannelId = useAppSelector((state) => state.user.currentChannelId);
  const { userData } = useAppSelector((state) => state.user);
  const currentTeam = useCurrentCommunity();
  const channels = useChannel();
  const spaceChannel = useSpaceChannel();
  const currentChannel = useCurrentChannel();
  const currentChannelId = useMemo(
    () => currentChannel?.channel_id || currentChannel?.user?.user_id || "",
    [currentChannel?.channel_id, currentChannel?.user?.user_id]
  );
  const { messageData, conversationData } = useAppSelector(
    (state) => state.message
  );
  const teamUserData = useTeamUserData();
  const communityId = useMatchCommunityId();
  const channelId = useMatchChannelId();
  const { taskData } = useAppSelector((state) => state.task);
  const { activityData } = useAppSelector((state) => state.activity);
  const { privateKey } = useAppSelector((state) => state.configs);
  const history = useHistory();
  const inputRef = useRef<any>();
  const channelViewRef = useRef<any>();
  const sideBarRef = useRef<any>();
  const [replyTask, setReplyTask] = useState<any>(null);
  const [initialSpace, setInitialSpace] = useState(null);
  const [isOpenSpaceDetail, setOpenSpaceDetail] = useState(false);
  const [selectedSpace, setSelectedSpace] = useState<Space | null>(null);
  const [channelDelete, setChannelDelete] = useState<any>(null);
  const [isOpenInvite, setOpenInvite] = useState(false);
  const [isOpenMembers, setOpeMembers] = useState(false);
  const [isOpenConfirmDeleteSpace, setOpenConfirmDeleteSpace] = useState(false);
  const [isOpenConfirmDeleteChannel, setOpenConfirmDeleteChannel] =
    useState(false);
  const [filter, setFilter] = useState(filterTask[0]);
  const [openCreateTask, setOpenCreateTask] = useState(false);
  const [currentTitle, setCurrentTitle] = useState<string | null>(null);
  const [openCreateChannel, setOpenCreateChannel] = useState(false);
  const [openCreateSpace, setOpenCreateSpace] = useState(false);
  const [openEditSpaceChannel, setOpenEditSpaceChannel] = useState(false);
  const [currentTask, setCurrentTask] = useState<TaskData | null>(null);
  const [openTaskView, setOpenTask] = useState(false);
  const [currentMessageId, setCurrentMessageId] = useState<string | null>(null);
  const [openConversation, setOpenConversation] = useState(false);
  const [openCreatePinPost, setOpenCreatePinPost] = useState(false);
  const toggleCreatePinPost = useCallback(
    () => setOpenCreatePinPost((current) => !current),
    []
  );
  const toggleOpenMembers = useCallback(
    () => setOpeMembers((current) => !current),
    []
  );
  const handleDragChannel = useCallback(
    (result: any) => {
      const { draggableId, source, destination } = result;
      const groupId = destination.droppableId.split("group-channel-")[1];
      const sourceGroupId = source.droppableId.split("group-channel-")[1];
      if (groupId === sourceGroupId) return;
      dispatch(dragChannel(draggableId, groupId));
    },
    [dispatch]
  );
  const handleDragTaskToChannel = useCallback(
    (result: any, task: any) => {
      const { draggableId, destination } = result;
      const groupId = destination.droppableId.split("group-channel-")[1];
      const channel = channels.filter((c) => c.group_channel_id === groupId)?.[
        destination.index - 1
      ];
      if (
        !channel ||
        !!task.channel.find((c: any) => c.channel_id === channel.channel_id)
      ) {
        return;
      }
      dispatch(
        updateTask(draggableId, currentChannel?.channel_id, {
          channel: [...task.channel, channel],
          team_id: currentTeam.team_id,
        })
      );
    },
    [channels, currentChannel?.channel_id, currentTeam?.team_id, dispatch]
  );
  const onDragEnd = useCallback(
    (result: any) => {
      if (!currentChannel?.channel_id || !result) return;
      const { draggableId, source, destination } = result;
      if (!destination) return;
      const tasks = taskData?.[currentChannelId]?.tasks || [];
      const task = tasks.find((t) => t.task_id === draggableId);
      if (destination.droppableId.includes("group-channel")) {
        if (source.droppableId.includes("group-channel")) {
          handleDragChannel(result);
        } else {
          handleDragTaskToChannel(result, task);
        }
        return;
      }
      let currentVote = task?.up_votes || 0;
      if (destination.droppableId !== "archived") {
        const taskGrouped = groupTaskByFiltered(filter.value, tasks);
        if (source.droppableId === destination.droppableId) {
          if (source.index !== destination.index) {
            const sourceList = taskGrouped[source.droppableId];
            if (source.index < destination.index) {
              currentVote = sourceList[destination.index].up_votes - 1;
            } else {
              currentVote = sourceList[destination.index].up_votes + 1;
            }
          }
        } else {
          const destinationList = taskGrouped[destination.droppableId];
          if (destinationList.length === destination.index) {
            if (destinationList.length > 0) {
              currentVote =
                destinationList[destinationList.length - 1].up_votes - 1;
            }
          } else {
            currentVote = destinationList[destination.index].up_votes + 1;
          }
        }
      }
      dispatch(
        dropTask(
          result,
          currentChannel.channel_id,
          currentVote,
          currentTeam.team_id
        )
      );
    },
    [
      currentChannel?.channel_id,
      currentChannelId,
      currentTeam?.team_id,
      dispatch,
      filter.value,
      handleDragChannel,
      handleDragTaskToChannel,
      taskData,
    ]
  );
  const handleOpenCreateChannel = useCallback((initSpace) => {
    setInitialSpace(initSpace);
    setOpenCreateChannel(true);
  }, []);
  const handleOpenCreateSpace = useCallback(() => {
    setOpenCreateSpace(true);
  }, []);
  const handleOpenEditSpace = useCallback((g) => {
    setSelectedSpace(g);
    setOpenEditSpaceChannel(true);
  }, []);
  const handleOpenDeleteSpace = useCallback(() => {
    setOpenConfirmDeleteSpace(true);
  }, []);
  const handleOpenDeleteChannel = useCallback((channel) => {
    setChannelDelete(channel);
    setOpenConfirmDeleteChannel(true);
  }, []);
  const handleRemoveTeamMember = useCallback(
    async (u) => {
      const success = await dispatch(
        removeTeamMember(currentTeam.team_id, u.user_id)
      );
      if (!!success) {
        toast.success("User has been removed!");
      }
    },
    [dispatch, currentTeam?.team_id]
  );
  const handleOpenEditChannelMember = useCallback(
    (channel) => {
      dispatch(setCurrentChannel?.(channel));
      channelViewRef.current.showSetting("edit-member");
    },
    [dispatch]
  );
  const handleOpenEditChannelName = useCallback(
    (channel) => {
      history.replace(`/channels/${currentTeam.team_id}/${channel.channel_id}`);
      channelViewRef.current.showSetting("edit-name");
    },
    [currentTeam?.team_id, history]
  );
  const handleOpenInviteMember = useCallback(() => setOpenInvite(true), []);
  const handleSpaceBadgeClick = useCallback((s: Space) => {
    setSelectedSpace(s);
    setOpenSpaceDetail(true);
  }, []);
  const handleOpenConversation = useCallback((message: MessageData) => {
    setCurrentMessageId(message.message_id);
    setOpenConversation(true);
  }, []);
  const onMoreMessage = useCallback(
    (createdAt?: string) => {
      if (!createdAt) return;

      dispatch(getMessages(channelId, "Public", createdAt));
    },
    [channelId, dispatch]
  );
  const onDeleteTask = useCallback(
    (task: any) => {
      if (!currentChannel?.channel_id) return;
      dispatch(deleteTask(task.task_id, currentChannel?.channel_id));
    },
    [dispatch, currentChannel?.channel_id]
  );
  const onUpdateStatus = useCallback(
    (task: any, status: string) => {
      if (!currentChannel?.channel_id) return;
      dispatch(
        updateTask(task.task_id, currentChannel?.channel_id, {
          status,
          team_id: currentTeam.team_id,
        })
      );
    },
    [currentChannel?.channel_id, dispatch, currentTeam?.team_id]
  );
  const handleTaskUpdateFilter = useCallback((st) => setFilter(st), []);
  const openTaskDetail = useCallback((task: any) => {
    setOpenTask(true);
    setCurrentTask(task);
  }, []);
  const onReplyTask = useCallback((task: any) => {
    setReplyTask(task);
  }, []);
  const handleAddTask = useCallback((title) => {
    setCurrentTitle(title);
    setOpenCreateTask(true);
  }, []);
  const handleCloseModalSpaceDetail = useCallback(() => {
    setOpenSpaceDetail(false);
    setSelectedSpace(null);
  }, []);
  const handleCloseModalConversation = useCallback(() => {
    setOpenConversation(false);
    setCurrentMessageId(null);
  }, []);
  const handleCloseModalTaskView = useCallback(() => {
    setOpenTask(false);
    setCurrentTask(null);
  }, []);
  const onCreateTask = useCallback(
    (taskCreateData: any, id: string) => {
      const loadingAttachment = taskCreateData.attachments.find(
        (att: any) => att.loading
      );
      if (loadingAttachment != null) {
        return;
      }
      const channel_ids = taskCreateData.channels
        .filter((c: any) => c.channel_id !== currentChannel.channel_id)
        .map((c: any) => c.channel_id);
      if (
        currentChannel.channel_type !== "Direct" &&
        currentChannel?.channel_id
      ) {
        channel_ids.unshift(currentChannel?.channel_id);
      }
      if (channel_ids.length === 0) {
        toast.error("Channels cannot be empty");
        return;
      }
      if (!taskCreateData?.title) {
        toast.error("Title cannot be empty");
        return;
      }
      const body: any = {
        title: taskCreateData?.title,
        notes: taskCreateData?.notes,
        status: taskCreateData?.currentStatus?.id,
        due_date: taskCreateData?.dueDate
          ? moment(taskCreateData?.dueDate || new Date()).format(
              "YYYY-MM-DD HH:mm:ss.SSSZ"
            )
          : null,
        channel_ids,
        assignee_id: taskCreateData?.assignee?.user_id,
        attachments: taskCreateData.attachments.map((att: any) => att.url),
        team_id: currentTeam.team_id,
      };
      if (id !== "") {
        body.task_id = id;
      }
      dispatch(createTask(currentChannel?.channel_id, body));
      setOpenCreateTask(false);
    },
    [
      dispatch,
      currentChannel?.channel_id,
      currentChannel?.channel_type,
      currentTeam?.team_id,
    ]
  );
  const handleCloseModalCreateTask = useCallback(() => {
    setCurrentTitle(null);
    setOpenCreateTask(false);
  }, []);
  const handleCloseModalCreateSpace = useCallback(
    () => setOpenCreateSpace(false),
    []
  );
  const onCreateSpace = useCallback(
    async (spaceData: CreateSpaceData) => {
      let error = "";
      let body: any = {
        space_name: spaceData.name,
        space_type: spaceData.spaceType === "Exclusive" ? "Private" : "Public",
        space_id: spaceData.spaceId,
        space_emoji: spaceData.emoji,
        space_image_url: spaceData.url,
      };
      if (spaceData.url) {
        const url = ImageHelper.normalizeImage(
          spaceData.url,
          currentTeam.team_id
        );
        const colorAverage = await getSpaceBackgroundColor(url);
        body.space_background_color = colorAverage;
      }
      if (spaceData.spaceType === "Exclusive") {
        if (!spaceData.spaceBadgeId) {
          error = "Badge cannot be empty";
        } else if (!spaceData.condition) {
          error = "Condition cannot be empty";
        } else if (
          !spaceData.condition.amount &&
          !spaceData.condition.amountInput
        ) {
          error = "Amount cannot be empty";
        }
        if (error) {
          toast.error(error);
          return null;
        }
        const badge = SpaceBadge.find((el) => el.id === spaceData.spaceBadgeId);
        body = {
          ...body,
          space_conditions: [
            {
              network: spaceData.condition?.network,
              contract_address: spaceData.condition?.address,
              amount:
                spaceData.condition?.amount || spaceData.condition?.amountInput,
              token_type: spaceData.condition?.token_type,
            },
          ],
          space_description: spaceData.description,
          icon_color: badge?.color,
          icon_sub_color: badge?.backgroundColor,
        };
      }
      GoogleAnalytics.tracking("Create Space Submitted", {
        category: "Add Space",
        space_type: spaceData.spaceType === "Exclusive" ? "Private" : "Public",
        contract_address: spaceData.condition?.address || "",
      });
      const success = await dispatch(
        createSpaceChannel(currentTeam.team_id, body)
      );
      if (!!success) {
        GoogleAnalytics.tracking("Create Space Successful", {
          category: "Add Space",
          space_type:
            spaceData.spaceType === "Exclusive" ? "Private" : "Public",
          contract_address: spaceData.condition?.address || "",
        });
        setOpenCreateSpace(false);
        sideBarRef.current?.scrollToBottom?.();
      }
      return null;
    },
    [dispatch, currentTeam?.team_id]
  );
  const handleCloseModalEditSpace = useCallback(
    () => setOpenEditSpaceChannel(false),
    []
  );
  const onCreateChannel = useCallback(
    async (channelData: any, spaceType: string) => {
      GoogleAnalytics.tracking("Create Channel Submitted", {
        category: "Add Channel",
        space_type: spaceType,
      });
      const body: any = {
        channel_name: channelData.name,
        space_id: channelData.space?.space_id,
        channel_type: channelData.isPrivate ? "Private" : "Public",
      };
      if (channelData.isPrivate) {
        const { res } = await createMemberChannelData(channelData.members);
        body.channel_member_data = res;
      }
      const res: any = await dispatch(
        createNewChannel(
          currentTeam.team_id,
          body,
          channelData.space?.space_name
        )
      );
      if (res?.channel_id) {
        GoogleAnalytics.tracking("Create Channel Successful", {
          category: "Add Channel",
          space_type: spaceType,
        });
        history.replace(`/channels/${currentTeam.team_id}/${res.channel_id}`);
        setOpenCreateChannel(false);
      }
    },
    [currentTeam?.team_id, dispatch, history]
  );
  const handleCloseModalCreateChannel = useCallback(
    () => setOpenCreateChannel(false),
    []
  );
  const handleCloseModalInviteMember = useCallback(
    () => setOpenInvite(false),
    []
  );
  const handleCloseModalDeleteChannel = useCallback(
    () => setOpenConfirmDeleteChannel(false),
    []
  );
  const nextChannelIdWhenDeleteSpace = useMemo(() => {
    const currentIdx = channels.findIndex(
      (el) => el.channel_id === currentChannel.channel_id
    );
    const newChannels = channels.filter(
      (el) => el.space_id !== currentChannel.space_id
    );
    return (
      newChannels?.[currentIdx]?.channel_id ||
      newChannels?.[0]?.channel_id ||
      ""
    );
  }, [channels, currentChannel?.channel_id, currentChannel?.space_id]);
  const nextChannelId = useMemo(() => {
    const currentIdx = channels.findIndex(
      (el) => el.channel_id === currentChannel.channel_id
    );
    const newChannels = channels.filter(
      (el) => el.channel_id !== currentChannel.channel_id
    );
    return (
      newChannels?.[currentIdx]?.channel_id ||
      newChannels?.[0]?.channel_id ||
      ""
    );
  }, [channels, currentChannel?.channel_id]);
  const handleDeleteChannel = useCallback(async () => {
    if (!channelDelete?.channel_id) return;
    const success = await dispatch(
      deleteChannel(channelDelete?.channel_id, currentTeam.team_id)
    );
    if (!!success) {
      if (currentChannel?.channel_id === channelDelete?.channel_id) {
        history.replace(`/channels/${currentTeam.team_id}/${nextChannelId}`);
      }
      setChannelDelete(null);
      setOpenConfirmDeleteChannel(false);
    }
  }, [
    channelDelete?.channel_id,
    currentChannel?.channel_id,
    currentTeam.team_id,
    dispatch,
    history,
    nextChannelId,
  ]);
  const handleCloseModalConfirmDeleteSpace = useCallback(() => {
    setOpenConfirmDeleteSpace(false);
  }, []);
  const handleCloseModalUserProfile = useCallback(async () => {
    const lastChannelId = await getCookie(AsyncKey.lastChannelId);
    history.replace(`/channels/${currentTeam.team_id}/${lastChannelId}`);
  }, [currentTeam?.team_id, history]);
  const handleDeleteSpace = useCallback(async () => {
    if (!selectedSpace?.space_id) return;
    const success = await dispatch(deleteSpaceChannel(selectedSpace?.space_id));
    if (!!success) {
      GoogleAnalytics.tracking("Delete Space Successful", {
        category: "Space",
      });
      if (currentChannel?.space_id === selectedSpace?.space_id) {
        history.replace(
          `/channels/${currentTeam.team_id}/${nextChannelIdWhenDeleteSpace}`
        );
      }
      setSelectedSpace(null);
      setOpenConfirmDeleteSpace(false);
      setOpenEditSpaceChannel(false);
    }
  }, [
    currentTeam?.team_id,
    dispatch,
    history,
    nextChannelIdWhenDeleteSpace,
    selectedSpace?.space_id,
    currentChannel?.space_id,
  ]);
  useEffect(() => {
    if (currentChannel.channel_id) channelViewRef.current?.clearText?.();
  }, [currentChannel.channel_id]);
  useEffect(() => {
    if (match_community_id === "user" && match_channel_id) {
      setCurrentUserId(match_channel_id);
    } else {
      setCurrentUserId("");
    }
  }, [match_community_id, match_channel_id]);
  useEffect(() => {
    handleCloseModalSpaceDetail();
    if (match_channel_id && !!community) {
      if (match_community_id !== "user") {
        const matchCommunity = community?.find(
          (c) => c.team_id === match_community_id
        );
        if (!matchCommunity) {
          removeCookie(AsyncKey.lastTeamId);
          removeCookie(AsyncKey.lastChannelId);
          history.replace("/channels");
        } else {
          const matchChannel = channels.find(
            (c) => c.channel_id === match_channel_id
          );
          if (matchChannel) {
            if (matchChannel.channel_id !== storeChannelId) {
              dispatch(setCurrentChannel?.(matchChannel, match_community_id));
            }
          } else {
            dispatch(clearLastChannel(match_community_id));
            history.replace(`/channels/${match_community_id}`);
          }
        }
      }
    }
  }, [
    history,
    community,
    channels,
    storeChannelId,
    dispatch,
    match_channel_id,
    match_community_id,
    handleCloseModalSpaceDetail,
  ]);
  useEffect(() => {
    if (currentChannel?.user) {
      dispatch(
        getTaskFromUser(
          currentChannel.user.user_id,
          currentChannel.channel_id || currentChannel.user.user_id,
          currentTeam?.team_id
        )
      );
    }
  }, [
    currentChannel.channel_id,
    currentChannel.user,
    currentTeam?.team_id,
    dispatch,
  ]);
  useEffect(() => {
    if (channelId && validateUUID(channelId) && !!userData.user_id) {
      dispatch(getTasks(channelId));
    }
  }, [channelId, dispatch, userData.user_id]);
  useEffect(() => {
    setOpenConversation(false);
    inputRef.current?.focus();
    if (channelId && validateUUID(channelId)) {
      setOpenTask(false);
      if (privateKey) {
        dispatch(getMessages(channelId, "Public", undefined, true));
      }
    }
  }, [channelId, dispatch, privateKey]);

  useEffect(() => {
    if (!!userData.user_id) {
      dispatch(getTransactions(1));
    }
  }, [dispatch, userData.user_id]);

  useEffect(() => {
    if (currentChannel?.space_id) {
      dispatch(getSpaceMembers(currentChannel?.space_id));
    }
  }, [currentChannel?.space_id, dispatch]);

  useEffect(() => {
    const keyDownListener = (e: any) => {
      if (e.key === "Escape") {
        setOpenCreateTask(false);
        setOpenCreateChannel(false);
      } else if (e.metaKey && e.key === "t") {
        setOpenCreateTask(true);
      } else {
        const taskElement = document.getElementById("task-list");
        const taskHoverElement = taskElement?.querySelector(
          ".task-item__wrap:hover"
        );
        const tasks = taskData?.[currentChannelId]?.tasks || [];
        const archivedTasks = taskData?.[currentChannelId]?.archivedTasks || [];
        const hoverTask = [...tasks, ...archivedTasks].find(
          (t) => t.task_id === taskHoverElement?.id
        );
        if (
          GlobalVariable.isInputFocus ||
          !currentChannel?.channel_id ||
          !hoverTask
        )
          return;
        const body: any = {
          team_id: currentTeam.team_id,
        };
        if (e.key === "a") {
          body.status = hoverTask?.status === "archived" ? "todo" : "archived";
        } else if (e.key === "d") {
          body.status = hoverTask?.status === "doing" ? "done" : "doing";
        }
        if (body.status) {
          dispatch(
            updateTask(hoverTask.task_id, currentChannel?.channel_id, body)
          );
        }
      }
    };
    window.addEventListener("keydown", keyDownListener);
    return () => {
      window.removeEventListener("keydown", keyDownListener);
    };
  }, [
    history,
    currentTeam?.team_id,
    currentChannel?.channel_id,
    dispatch,
    taskData,
    currentChannelId,
  ]);

  if (loading && channels.length === 0) {
    return (
      <PageWrapper>
        <AppTitleBar />
        <HomeLoading />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <AppTitleBar />
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="home-container">
          <SideBar
            ref={sideBarRef}
            onCreateChannel={handleOpenCreateChannel}
            onCreateGroupChannel={handleOpenCreateSpace}
            onEditGroupChannel={handleOpenEditSpace}
            onDeleteChannel={handleOpenDeleteChannel}
            onRemoveTeamMember={handleRemoveTeamMember}
            onEditChannelMember={handleOpenEditChannelMember}
            onEditChannelName={handleOpenEditChannelName}
            onInviteMember={handleOpenInviteMember}
            onSpaceBadgeClick={handleSpaceBadgeClick}
            onViewMembers={toggleOpenMembers}
          />

          <div className="home-body">
            <ChannelView
              ref={channelViewRef}
              inputRef={inputRef}
              currentChannel={currentChannel}
              messages={uniqBy(
                messageData[channelId]?.data || [],
                "message_id"
              )}
              currentTeam={currentTeam}
              openConversation={handleOpenConversation}
              onMoreMessage={onMoreMessage}
              loadMoreMessage={loadMoreMessage}
              messageCanMore={messageData?.[channelId]?.canMore}
              scrollData={messageData?.[channelId]?.scrollData}
              replyTask={replyTask}
              setReplyTask={setReplyTask}
              openTaskView={openTaskView}
              onSelectTask={openTaskDetail}
              isOpenConversation={openConversation}
              teamUserData={teamUserData}
            />
            {currentChannel.channel_type !== "Direct" && (
              <PinPostList onCreate={toggleCreatePinPost} />
              // <TaskListView
              //   channelId={channelId}
              //   archivedCount={taskData?.[channelId]?.archivedCount}
              //   teamId={communityId}
              //   tasks={taskData?.[channelId]?.tasks || []}
              //   archivedTasks={taskData?.[channelId]?.archivedTasks || []}
              //   onAddTask={handleAddTask}
              //   onUpdateStatus={onUpdateStatus}
              //   filter={filter}
              //   filterData={filterTask}
              //   onUpdateFilter={handleTaskUpdateFilter}
              //   onDeleteTask={onDeleteTask}
              //   onSelectTask={openTaskDetail}
              //   onReplyTask={onReplyTask}
              //   directUserId={currentChannel?.user?.user_id}
              // />
            )}
          </div>
          <ModalSpaceDetail
            space={selectedSpace}
            open={isOpenSpaceDetail}
            handleClose={handleCloseModalSpaceDetail}
          />
          <ModalConversation
            open={openConversation}
            handleClose={handleCloseModalConversation}
            conversations={
              messageData?.[currentChannelId]?.data?.find(
                (el) => el.message_id === currentMessageId
              )?.conversation_data || []
            }
          />
          <ModalTaskView
            task={currentTask}
            conversations={
              currentTask?.task_id
                ? conversationData?.[currentTask?.task_id] || []
                : []
            }
            open={openTaskView}
            handleClose={handleCloseModalTaskView}
            teamId={currentTeam?.team_id}
            channelId={currentChannel?.channel_id}
            activities={
              currentTask?.task_id
                ? activityData?.[currentTask?.task_id]?.data || []
                : []
            }
            onDeleteTask={onDeleteTask}
          />
          <ModalCreateTask
            onCreateTask={onCreateTask}
            open={openCreateTask}
            handleClose={handleCloseModalCreateTask}
            currentTitle={currentTitle}
            currentTeam={currentTeam}
            currentChannel={currentChannel}
            channels={channels}
          />
          <ModalCreateSpace
            open={openCreateSpace}
            handleClose={handleCloseModalCreateSpace}
            onCreateSpace={onCreateSpace}
          />
          <ModalSpaceSetting
            open={openEditSpaceChannel}
            handleClose={handleCloseModalEditSpace}
            onDeleteClick={handleOpenDeleteSpace}
            space={selectedSpace}
          />
          <ModalCreateChannel
            space={spaceChannel}
            onCreateChannel={onCreateChannel}
            open={openCreateChannel}
            handleClose={handleCloseModalCreateChannel}
            initialSpace={initialSpace}
          />
          <ModalInviteMember
            open={isOpenInvite}
            handleClose={handleCloseModalInviteMember}
          />
          <ModalConfirmDeleteChannel
            open={isOpenConfirmDeleteChannel}
            handleClose={handleCloseModalDeleteChannel}
            channelName={channelDelete?.channel_name}
            onDelete={handleDeleteChannel}
          />
          <ModalConfirmDeleteGroupChannel
            open={isOpenConfirmDeleteSpace}
            spaceName={selectedSpace?.space_name || ""}
            handleClose={handleCloseModalConfirmDeleteSpace}
            onDelete={handleDeleteSpace}
          />
          <ModalAllMembers
            open={isOpenMembers}
            handleClose={toggleOpenMembers}
          />
          <ModalUserProfile
            open={!!currentUserId}
            handleClose={handleCloseModalUserProfile}
            userId={currentUserId}
          />
          <ModalCreatePinPost
            open={openCreatePinPost}
            handleClose={toggleCreatePinPost}
          />
        </div>
      </DragDropContext>
      <ModalOTP metamaskConnected={MetamaskUtils.connected} />
    </PageWrapper>
  );
};

export default memo(Home);
