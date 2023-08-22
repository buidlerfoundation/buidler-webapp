import React, {
  useState,
  useRef,
  useCallback,
  memo,
  useMemo,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import IconPlus from "shared/SVG/IconPlus";
import styles from "./index.module.scss";
import useCurrentCommunity from "hooks/useCurrentCommunity";
import images from "common/images";
import useUser from "hooks/useUser";
import IconNotification from "shared/SVG/IconNotification";
import AvatarView from "shared/AvatarView";
import TeamItem from "./TeamItem";
import { Community } from "models/Community";
import useAppDispatch from "hooks/useAppDispatch";
import useCommunityId from "hooks/useCommunityId";
import ModalUserSetting from "shared/ModalUserSetting";
import { useAuth } from "providers/AuthProvider";
import ModalTeam from "shared/ModalTeam";
import PopoverButton from "shared/PopoverButton";
import PopupNotification from "shared/PopupNotification";
import ModalConfirmDelete from "shared/ModalConfirmDelete";
import ModalConfirmDeleteTeam from "shared/ModalConfirmDeleteTeam";
import ModalTeamSetting from "shared/ModalTeamSetting";
import ModalTransactionDetail from "shared/ModalTransactionDetail";
import api from "api";
import GoogleAnalytics from "services/analytics/GoogleAnalytics";
import MyCommunityItem from "shared/MyCommunityItem";
import usePinnedCommunities from "hooks/usePinnedCommunities";
import { unPinCommunity } from "reducers/UserActions";
import { getLastChannelIdByCommunityId } from "common/Cookie";
import TeamItemLoading from "./TeamItemLoading";
import useAppSelector from "hooks/useAppSelector";
import useWebsiteUrl from "hooks/useWebsiteUrl";

type AppTitleBarProps = {
  onJumpToMessage?: (messageId: string) => void;
};

const AppTitleBar = forwardRef(({ onJumpToMessage }: AppTitleBarProps, ref) => {
  // const toastData = useAppSelector((state) => state.transaction.toastData);
  const dispatch = useAppDispatch();
  const location = useLocation();
  const websiteUrl = useWebsiteUrl();
  const openingNewTab = useAppSelector((state) => state.user.openingNewTab);
  const userData = useUser();
  const auth = useAuth();
  const pinnedCommunities = usePinnedCommunities();
  const notificationRef = useRef<any>();
  const communityId = useCommunityId();
  const currentCommunity = useCurrentCommunity();
  const navigate = useNavigate();
  const [openTxDetail, setOpenTxDetail] = useState(false);
  const [selectedHash, setSelectedHash] = useState<string | null>(null);
  const [openTeamSetting, setOpenTeamSetting] = useState(false);
  const viewTxDetail = useCallback(() => setOpenTxDetail(true), []);
  const closeTxDetail = useCallback(() => setOpenTxDetail(false), []);
  const onViewTxDetail = useCallback(
    (hash: string) => {
      setSelectedHash(hash);
      viewTxDetail();
    },
    [viewTxDetail]
  );
  // const renderAction = useCallback(
  //   (hash: string) => () => {
  //     return (
  //       <div className="action-container">
  //         <NormalButton
  //           title="Copy Tx Hash"
  //           onPress={async () => {
  //             await navigator.clipboard.writeText(
  //               `${AppConfig.etherscanUrl}/tx/${hash}`
  //             );
  //             toast.success("Copied!");
  //           }}
  //           type="normal"
  //         />
  //         <div style={{ width: 15 }} />
  //         <NormalButton
  //           title="View Tx detail"
  //           onPress={() => onViewTxDetail(hash)}
  //           type="primary"
  //         />
  //       </div>
  //     );
  //   },
  //   [onViewTxDetail]
  // );
  // useEffect(() => {
  //   if (toastData?.hash) {
  //     const duration = 4000;
  //     const toastOption: any = {
  //       className: toastData?.title,
  //       duration,
  //       renderAction: renderAction(toastData?.hash),
  //     };
  //     if (toastData?.type === "success") {
  //       toast.success(toastData?.message, toastOption);
  //     }
  //     if (toastData?.type === "error") {
  //       toast.error(toastData?.message, toastOption);
  //     }
  //     dispatch({ type: actionTypes.UPDATE_TRANSACTION_TOAST, payload: null });
  //   }
  // }, [
  //   dispatch,
  //   renderAction,
  //   toastData?.hash,
  //   toastData?.message,
  //   toastData?.title,
  //   toastData?.type,
  // ]);
  const teamMenuOwner = useMemo(() => {
    return [
      {
        label: "Community setting",
        value: "Community setting",
        icon: images.icCommunitySetting,
      },
      {
        label: "Leave community",
        value: "Leave community",
        icon: images.icLeaveTeam,
      },
    ];
  }, []);
  const teamMenu = useMemo(() => {
    return [
      {
        label: "Leave community",
        value: "Leave community",
        icon: images.icLeaveTeam,
      },
    ];
  }, []);
  const menuTeamRef = useRef<any>();
  const popupNotificationRef = useRef<any>();
  const [isOpenConfirmLeave, setOpenConfirmLeave] = useState(false);
  const [isOpenConfirmDeleteTeam, setOpenConfirmDeleteTeam] = useState(false);
  const [isOpenModalTeam, setOpenModalTeam] = useState(false);
  const [isOpenModalUser, setOpenModalUser] = useState(false);
  const [isOpenTransaction, setOpenTransaction] = useState(false);
  const [isOpenUpdateUser, setOpenUpdateUser] = useState(false);
  const [selectedMenuTeam, setSelectedMenuTeam] = useState<Community | null>(
    null
  );
  const highlightCreateCommunityButton = useMemo(() => {
    return !pinnedCommunities || pinnedCommunities?.length <= 1;
  }, [pinnedCommunities]);
  const setTeam = useCallback(
    async (t?: Community) => {
      if (websiteUrl && t?.default_channel?.dapp_integration_url) {
        navigate(`/url/${t?.default_channel?.dapp_integration_url}`, {
          replace: true,
        });
      } else if (t?.community_id) {
        const lastChannelIdByCommunityId = await getLastChannelIdByCommunityId(
          t?.community_id
        );
        navigate(
          `/channels/${t?.community_id}/${lastChannelIdByCommunityId || ""}`,
          {
            replace: true,
          }
        );
      }
    },
    [navigate, websiteUrl]
  );
  const handleCloseTeamSetting = useCallback(() => {
    setSelectedMenuTeam(null);
    setOpenTeamSetting(false);
  }, []);
  const onDeleteClick = useCallback(() => {
    setOpenConfirmDeleteTeam(true);
  }, []);
  const handleCloseDeleteTeam = useCallback(
    () => setOpenConfirmDeleteTeam(false),
    []
  );
  const onDeleteTeam = useCallback(async () => {}, []);
  const handleCloseModalConfirmDelete = useCallback(() => {
    setSelectedMenuTeam(null);
    setOpenConfirmLeave(false);
  }, []);
  const onLeaveTeam = useCallback(async () => {}, []);
  const handleCommunityContextMenu = useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>, t: Community) => {
      setSelectedMenuTeam(t);
      menuTeamRef.current?.show(e.currentTarget, {
        x: e.pageX,
        y: e.pageY,
      });
    },
    []
  );
  const handleOpenModalTeam = useCallback(() => setOpenModalTeam(true), []);
  const handleOpenModalUser = useCallback(() => {
    setOpenTransaction(false);
    setOpenModalUser(true);
  }, []);
  const handleCloseModalTeam = useCallback(() => setOpenModalTeam(false), []);
  const handleCreateTeam = useCallback(
    async (body: any) => {
      const res = await api.createCommunity({
        community_name: body.name,
        community_description: body.description,
      });
      if (res.success) {
        GoogleAnalytics.tracking("Create Community Successful", {
          category: "Add Community",
        });
        setTeam(res.data);
        setOpenModalTeam(false);
      }
    },
    [setTeam]
  );
  const handleAcceptTeam = useCallback(async (teamId: string) => {}, []);
  const handleCloseModalUserSetting = useCallback(
    () => setOpenModalUser(false),
    []
  );
  const handleLogout = useCallback(async () => {
    auth.logout();
    setOpenModalUser(false);
  }, [auth]);
  const onSelectedMenu = useCallback(async (menu: any) => {
    switch (menu.value) {
      case "Leave community": {
        setOpenConfirmLeave(true);
        break;
      }
      case "Community setting": {
        setOpenTeamSetting(true);
        break;
      }
      case "Create community": {
        setOpenModalTeam(true);
        break;
      }
      default:
        break;
    }
  }, []);

  const onUnPin = useCallback(
    (community: Community) => {
      api.unPinCommunity(community.community_id);
      dispatch(unPinCommunity(community.community_id));
      if (communityId === community.community_id) {
        const currentIndex =
          pinnedCommunities?.findIndex(
            (el) => el.community_id === community.community_id
          ) || 0;
        const prevCommunity = pinnedCommunities?.[currentIndex - 1];
        const path = prevCommunity
          ? `/channels/${prevCommunity.community_id}`
          : "/communities";
        navigate(path, { replace: true });
      }
    },
    [communityId, dispatch, navigate, pinnedCommunities]
  );

  const renderTeam = useCallback(
    (el: Community) => {
      return (
        <TeamItem
          key={el.community_id}
          isSelected={
            el.community_id === communityId &&
            openingNewTab?.entityType !== "community"
          }
          t={el}
          onChangeTeam={setTeam}
          onContextMenu={handleCommunityContextMenu}
          onRemove={onUnPin}
        />
      );
    },
    [communityId, handleCommunityContextMenu, onUnPin, openingNewTab, setTeam]
  );

  const openPopupNotification = useCallback(() => {
    popupNotificationRef.current.show(notificationRef.current);
  }, []);

  const onClosePopupNotification = useCallback(() => {
    popupNotificationRef.current.hide();
  }, []);

  const unReadCount = useMemo(
    () => userData?.total_unread_notifications || 0,
    [userData?.total_unread_notifications]
  );

  const openCommunitySetting = useCallback(() => {
    setSelectedMenuTeam(currentCommunity);
    setOpenTeamSetting(true);
  }, [currentCommunity]);
  const openTransaction = useCallback(() => {
    setOpenTransaction(true);
    setOpenModalUser(true);
  }, []);
  useImperativeHandle(ref, () => {
    return {
      openTransaction,
      openCommunitySetting,
    };
  });

  useEffect(() => {
    if (location.hash === "#update-profile") {
      setOpenUpdateUser(true);
      setOpenModalUser(true);
      window.history.replaceState(
        null,
        "",
        window.location.href.replace("#update-profile", "")
      );
    }
  }, [location.hash]);

  return (
    <div id="title-bar">
      <div className={`${styles["list-team"]} hide-scroll-bar`}>
        {!!userData.user_id && <MyCommunityItem />}
        {pinnedCommunities?.map?.(renderTeam)}
        {openingNewTab?.entityType === "community" && openingNewTab.url && (
          <TeamItemLoading url={openingNewTab.url} />
        )}
        {highlightCreateCommunityButton ? (
          <div
            className={`${styles["team-item"]} ${styles["btn-create-community"]}`}
            onClick={handleOpenModalTeam}
            style={{ display: "none" }}
          >
            <IconPlus />
            <span className={styles["team-name"]} style={{ marginLeft: 11 }}>
              New community
            </span>
          </div>
        ) : (
          <div
            className={`normal-button ${styles["create-team-button"]}`}
            onClick={handleOpenModalTeam}
            style={{ display: "none" }}
          >
            <img alt="" src={images.icPlus} />
          </div>
        )}
      </div>
      {!!userData.user_id && (
        <div className={styles["action-right"]}>
          <div
            className={styles["icon-notification__wrap"]}
            onClick={openPopupNotification}
            ref={notificationRef}
          >
            <IconNotification />
            {unReadCount > 0 && <div className={styles["badge-unread"]} />}
          </div>
          <div
            className={styles["user-setting__wrap"]}
            onClick={handleOpenModalUser}
          >
            <span className={`${styles["user-name"]} text-ellipsis hide-xs`}>
              {userData.user_name}
            </span>
            <AvatarView user={userData} withoutStatus />
          </div>
        </div>
      )}
      <ModalTeam
        open={isOpenModalTeam}
        handleClose={handleCloseModalTeam}
        onCreateTeam={handleCreateTeam}
        onAcceptTeam={handleAcceptTeam}
      />
      <ModalUserSetting
        open={isOpenModalUser}
        handleClose={handleCloseModalUserSetting}
        user={userData}
        onLogout={handleLogout}
        onViewTxDetail={onViewTxDetail}
        isOpenTransaction={isOpenTransaction}
        isOpenUpdateUser={isOpenUpdateUser}
      />
      <PopoverButton
        popupOnly
        ref={menuTeamRef}
        data={selectedMenuTeam?.role === "Owner" ? teamMenuOwner : teamMenu}
        onSelected={onSelectedMenu}
      />
      <PopoverButton
        ref={popupNotificationRef}
        popupOnly
        style={{ top: 10 }}
        componentPopup={
          <PopupNotification
            onClose={onClosePopupNotification}
            onJumpToMessage={onJumpToMessage}
          />
        }
      />
      <ModalConfirmDelete
        open={isOpenConfirmLeave}
        handleClose={handleCloseModalConfirmDelete}
        title="Leave community"
        description="Are you sure you want to leave?"
        contentName={selectedMenuTeam?.community_name || ""}
        contentDelete="Leave"
        onDelete={onLeaveTeam}
      />
      <ModalConfirmDeleteTeam
        open={isOpenConfirmDeleteTeam}
        handleClose={handleCloseDeleteTeam}
        teamName={selectedMenuTeam?.community_name || ""}
        onDelete={onDeleteTeam}
      />
      <ModalTeamSetting
        open={openTeamSetting}
        handleClose={handleCloseTeamSetting}
        team={selectedMenuTeam}
        onDeleteClick={onDeleteClick}
      />
      <ModalTransactionDetail
        open={openTxDetail}
        handleClose={closeTxDetail}
        txHash={selectedHash}
      />
    </div>
  );
});

export default memo(AppTitleBar);
