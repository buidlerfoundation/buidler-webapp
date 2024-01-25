"use client";

import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import styles from "./index.module.scss";
import IconBuidlerLogo from "shared/SVG/IconBuidlerLogo";
import IconMenuHome from "shared/SVG/FC/IconMenuHome";
import makeBlockie from "ethereum-blockies-base64";
import { clearData, getCookie, removeCookie, setCookie } from "common/Cookie";
import {
  AsyncKey,
  signTypeDataLinkFC,
  signTypeDataMagicLink,
} from "common/AppConfig";
import useAppDispatch from "hooks/useAppDispatch";
import {
  FC_USER_ACTIONS,
  getCurrentFCUser,
  getFCChannels,
  loginWithMagicLink,
} from "reducers/FCUserReducers";
import { logoutAction } from "reducers/actions";
import useAppSelector from "hooks/useAppSelector";
import ImageView from "shared/ImageView";
import { ISignedKeyRequest, UserPermission } from "models/FC";
import api from "api";
import toast from "react-hot-toast";
import { HOME_FEED_ACTIONS, getFeedByUrl } from "reducers/HomeFeedReducers";
import ModalFCReply from "shared/ModalFCReply";
import PopoverButton from "shared/PopoverButton";
import PopupUserFCMenu from "shared/PopupUserFCMenu";
import useFeedFilters from "hooks/useFeedFilters";
import ComposeButton from "shared/ComposeButton";
import ModalCompose from "shared/ModalCompose";
import ModalReviewResult from "shared/ModalReviewResult";
import useQuery from "hooks/useQuery";
import IconMenuAnalytic from "shared/SVG/FC/IconMenuAnalytic";
import ModalBugsReport from "shared/ModalBugsReport";
import GoogleAnalytics from "services/analytics/GoogleAnalytics";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import useIsMobile from "hooks/useIsMobile";
import { IDataToken } from "models/User";
import { MagicUserMetadata } from "magic-sdk";
import { CircularProgress } from "@mui/material";
import { useMagic } from "providers/MagicProvider";
import { Route } from "next";
import ModalSubmitReport from "shared/ModalSubmitReport";
import IconDot from "shared/SVG/IconDot";
import {
  COMMUNITY_NOTE_ACTION,
  getReportCategories,
} from "reducers/CommunityNoteReducers";
import ModalSubmitNote from "shared/ModalSubmitNote";
import IconPlus from "shared/SVG/IconPlus";
import IconMenuReport from "shared/SVG/IconMenuReport";
import ModalRateNote from "shared/ModalRateNote";
import IconMenuUserRole from "shared/SVG/IconMenuUserRole";
import PopupSignIn from "shared/PopupSignIn";
import ModalJoinAsContributor from "shared/ModalJoinAsContributor";
import IconMenuExplore from "shared/SVG/FC/IconMenuExplore";
import NavbarMobile from "./NavbarMobile";
import ScrollRestoration from "../ScrollRestoration";

interface IMenuItem {
  active?: boolean;
  title: string;
  to?: Route;
  icon: React.ReactElement;
  onClick?: () => void;
}

const MenuItem = ({ active, title, to, icon, onClick }: IMenuItem) => {
  const onMenuClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
      onClick?.();
      if (active) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: "auto" });
      }
    },
    [active, onClick]
  );
  const renderBody = useCallback(
    () => (
      <>
        {icon}
        <span
          style={{
            marginLeft: 10,
            color: active
              ? "var(--color-primary-text)"
              : "var(--color-mute-text)",
            fontWeight: 600,
          }}
        >
          {title}
        </span>
      </>
    ),
    [active, icon, title]
  );
  if (!to) {
    return (
      <div className={styles["menu-item"]} onClick={onClick}>
        {renderBody()}
      </div>
    );
  }
  return (
    <Link className={styles["menu-item"]} href={to} onClick={onMenuClick}>
      {renderBody()}
    </Link>
  );
};

const MenuItemMemo = memo(MenuItem);

interface IFCWrapper {
  children: React.ReactNode;
  communityNote?: boolean;
}

const FCWrapper = ({ children, communityNote }: IFCWrapper) => {
  const dispatch = useAppDispatch();
  const { magic, magicProvider } = useMagic();
  const [openMenu, setOpenMenu] = useState(false);
  const popupMenuRef = useRef<any>();
  const popupLoginRef = useRef<any>();
  const btnLoginRef = useRef<any>();
  const [loading, setLoading] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const [openLinkWithFarcaster, setOpenLinkWithFarcaster] = useState(false);
  const [magicLoading, setMagicLoading] = useState(false);
  const [gettingMagicUserRedirect, setGettingMagicUserRedirect] =
    useState(true);
  const query = useQuery();
  const router = useRouter();
  const [polling, setPolling] = useState(false);
  const [initialShareUrl, setInitialShareUrl] = useState("");
  const [openReport, setOpenReport] = useState(false);
  const [openAddNote, setOpenAddNote] = useState(false);
  const [openDiscussion, setOpenDiscussion] = useState(false);
  const [openBugsReport, setOpenBugsReport] = useState(false);
  const initialTheme = useMemo(() => query?.get("theme"), [query]);
  const action = useMemo(() => query?.get("action"), [query]);
  const redirect = useMemo(() => query?.get("redirect"), [query]);
  const [theme, setTheme] = useState(initialTheme);
  const filters = useFeedFilters();
  const params = useParams<{ url: string; redirect_url: string }>();
  const exploreUrl = useMemo(() => params?.url, [params?.url]);
  const redirectUrl = useMemo(
    () => params?.redirect_url,
    [params?.redirect_url]
  );
  const [signedKeyRequest, setSignedKeyRequest] = useState<
    ISignedKeyRequest | undefined | null
  >(null);
  const fcUser = useAppSelector((state) => state.fcUser?.data);
  const rateNote = useAppSelector((state) => state.communityNote.openRateNote);
  const metadataCreateNote = useAppSelector(
    (state) => state.communityNote.openNoteMetadata
  );
  const metadataCreateReport = useAppSelector(
    (state) => state.communityNote.openReportMetadata
  );
  const userAvatar = useMemo(
    () =>
      fcUser?.pfp?.url ||
      (fcUser?.address ? makeBlockie(fcUser.address) : undefined),
    [fcUser?.address, fcUser?.pfp?.url]
  );
  const loginSource = useAppSelector((state) => state.fcUser.loginSource);
  const replyCast = useAppSelector((state) => state.homeFeed.replyCast);
  const pollingController = useRef(new AbortController());
  const pathname = usePathname();
  const activeColor = useMemo(() => "var(--color-primary-text)", []);
  const inactiveColor = useMemo(() => "var(--color-mute-text)", []);
  const [resultData, setResultData] = useState<any>(null);
  const isMobile = useIsMobile();
  const toggleReport = useCallback(() => {
    if (metadataCreateReport) {
      dispatch(COMMUNITY_NOTE_ACTION.updateModalReport());
      setOpenReport(false);
    } else {
      setOpenReport((current) => !current);
    }
  }, [dispatch, metadataCreateReport]);
  const toggleAddNote = useCallback(() => {
    if (metadataCreateNote) {
      dispatch(COMMUNITY_NOTE_ACTION.updateModalNote());
      setOpenAddNote(false);
    } else {
      setOpenAddNote((current) => !current);
    }
  }, [dispatch, metadataCreateNote]);
  const onCloseModalRateNote = useCallback(() => {
    dispatch(COMMUNITY_NOTE_ACTION.updateModalRateNote());
  }, [dispatch]);
  const toggleMenu = useCallback(() => setOpenMenu((current) => !current), []);
  const toggleBugsReport = useCallback(
    () => setOpenBugsReport((current) => !current),
    []
  );
  const toggleDiscussion = useCallback(
    () => setOpenDiscussion((current) => !current),
    []
  );
  const onOpenResult = useCallback((data: any) => {
    setResultData(data);
  }, []);
  const onCloseReviewResult = useCallback(() => {
    setResultData(null);
  }, []);
  const logout = useCallback(async () => {
    await magic?.user.logout();
    window.top?.postMessage(
      { type: "b-fc-plugin-logout" },
      { targetOrigin: "*" }
    );
    setSignedKeyRequest(null);
    clearData();
    dispatch(logoutAction());
    window.location.reload();
  }, [dispatch, magic?.user]);
  const onCloseReply = useCallback(() => {
    dispatch(HOME_FEED_ACTIONS.updateReplyCast());
  }, [dispatch]);
  const trackingLoginSuccess = useCallback(() => {
    GoogleAnalytics.tracking("Login Successful", {
      category: "Login",
      source: loginSource || "",
    });
  }, [loginSource]);
  const trackingLoginFailed = useCallback((message: string) => {
    GoogleAnalytics.tracking("Login Failed", {
      category: "Login",
      message,
      time: `${new Date().getTime()}`,
    });
  }, []);
  const saveTokenCookie = useCallback(async (data?: IDataToken) => {
    await setCookie(AsyncKey.accessTokenKey, data?.token);
    await setCookie(AsyncKey.tokenExpire, data?.token_expire_at);
    await setCookie(AsyncKey.refreshTokenKey, data?.refresh_token);
    await setCookie(AsyncKey.refreshTokenExpire, data?.refresh_token_expire_at);
  }, []);
  const linkWithFCAccount = useCallback(
    async (signerId: string, accessToken?: string) => {
      if (magicProvider && accessToken) {
        const signer = magicProvider.getSigner();
        const message = {
          signer_id: signerId,
        };
        const signature = await signer?._signTypedData(
          signTypeDataLinkFC.domain,
          signTypeDataLinkFC.types,
          message
        );
        const res = await api.linkWithFarcasterAccount(accessToken, {
          ...signTypeDataLinkFC,
          value: message,
          signature,
        });
        if (res.success) {
          trackingLoginSuccess();
          await removeCookie(AsyncKey.requestTokenKey);
          await dispatch(getCurrentFCUser());
          if (redirectUrl) {
            router.push(decodeURIComponent(redirectUrl) as Route);
          }
        } else {
          trackingLoginFailed(res.message || "");
        }
      }
      setGettingMagicUserRedirect(false);
    },
    [
      dispatch,
      magicProvider,
      redirectUrl,
      router,
      trackingLoginFailed,
      trackingLoginSuccess,
    ]
  );
  const handleRefresh = useCallback(async () => {
    const refreshToken = await getCookie(AsyncKey.refreshTokenKey);
    if (refreshToken) {
      const res = await api.refreshToken(refreshToken);
      if (res.success) {
        await saveTokenCookie(res.data);
      }
    }
  }, [saveTokenCookie]);
  const checkingAuth = useCallback(async () => {
    setLoading(true);
    await handleRefresh();
    const reqToken = await getCookie(AsyncKey.requestTokenKey);
    const accessToken = await getCookie(AsyncKey.accessTokenKey);
    if (accessToken) {
      let alreadyGetUser = false;
      if (reqToken) {
        const res = await api.checkRequestToken(reqToken);
        if (res.data?.state === "completed" && res.data?.signer_id) {
          await setCookie(AsyncKey.signerIdKey, res?.data?.signer_id);
          await linkWithFCAccount(res.data?.signer_id, accessToken);
          alreadyGetUser = true;
        }
      }
      if (!alreadyGetUser) {
        await dispatch(getCurrentFCUser());
      }
    }
    setLoading(false);
  }, [handleRefresh, linkWithFCAccount, dispatch]);
  useEffect(() => {
    if (communityNote) {
      dispatch(getReportCategories());
    }
  }, [communityNote, dispatch]);
  useEffect(() => {
    getCookie(AsyncKey.themeKey).then((res) => {
      if (res) {
        setTheme(res);
      }
    });
  }, []);
  useEffect(() => {
    if (theme) {
      document.getElementsByTagName("html")?.[0]?.setAttribute("class", theme);
    }
    // document.querySelector('link[rel="manifest"]')?.setAttribute('content', '#000000');
  }, [theme]);
  useEffect(() => {
    dispatch(getFCChannels());
  }, [dispatch]);
  useEffect(() => {
    if (exploreUrl) {
      dispatch(
        getFeedByUrl({
          text: decodeURIComponent(exploreUrl),
          page: 1,
          limit: 20,
        })
      );
    }
  }, [dispatch, exploreUrl]);
  const handleCloseLinkWithFarcaster = useCallback(() => {
    pollingController.current.abort();
    setOpenLinkWithFarcaster(false);
  }, []);

  const requestSignerId = useCallback(async () => {
    if (loginLoading) return;
    setLoginLoading(true);
    let _signedKeyRequest = signedKeyRequest;
    let errorMsg = "";
    if (!_signedKeyRequest) {
      const res = await api.requestSignedKey();
      errorMsg = res.message || "";
      _signedKeyRequest = res.data;
      setSignedKeyRequest(_signedKeyRequest);
    }
    setLoginLoading(false);
    if (_signedKeyRequest?.token) {
      if (isMobile && _signedKeyRequest?.deeplinkUrl) {
        router.push(_signedKeyRequest.deeplinkUrl as Route);
      }
      await setCookie(AsyncKey.requestTokenKey, _signedKeyRequest?.token);
      setPolling(true);
      pollingController.current = new AbortController();
      try {
        const resPolling = await api.pollingSignedKey(
          _signedKeyRequest?.token,
          pollingController.current
        );
        if (resPolling?.data?.signer_id) {
          const accessToken = await getCookie(AsyncKey.accessTokenKey);
          await setCookie(AsyncKey.signerIdKey, resPolling?.data?.signer_id);
          await linkWithFCAccount(resPolling?.data?.signer_id, accessToken);
        }
      } catch (error: any) {
        toast.error(error.message);
        trackingLoginFailed(error.message);
        setSignedKeyRequest(null);
        setOpenLinkWithFarcaster(false);
      }
      setPolling(false);
    } else {
      trackingLoginFailed(errorMsg);
    }
  }, [
    isMobile,
    linkWithFCAccount,
    loginLoading,
    router,
    signedKeyRequest,
    trackingLoginFailed,
  ]);
  const onCloseMenu = useCallback(() => {
    popupMenuRef.current?.hide();
  }, []);
  const onCloseMenuLogin = useCallback(() => {
    popupLoginRef.current?.hide();
  }, []);
  const onLinkWithFarcaster = useCallback(() => {
    setOpenLinkWithFarcaster(true);
    if (!fcUser?.fid) {
      requestSignerId();
    }
    onCloseMenu();
  }, [fcUser?.fid, onCloseMenu, requestSignerId]);
  const onGetMagicUserMetadata = useCallback(
    async (magicUserMetadata: MagicUserMetadata) => {
      if (magicProvider) {
        const signer = magicProvider.getSigner();
        const message = {
          address: magicUserMetadata.publicAddress,
          email: magicUserMetadata.email,
        };
        const signature = await signer?._signTypedData(
          signTypeDataMagicLink.domain,
          signTypeDataMagicLink.types,
          message
        );
        const res = await dispatch(
          loginWithMagicLink({
            ...signTypeDataMagicLink,
            value: message,
            signature,
          })
        ).unwrap();
        await saveTokenCookie(res.data);
        const linkedSignerId = res.data?.signer_id;
        if (linkedSignerId) {
          await setCookie(AsyncKey.signerIdKey, linkedSignerId);
          trackingLoginSuccess();
          await dispatch(getCurrentFCUser());
          await removeCookie(AsyncKey.requestTokenKey);
          if (redirectUrl) {
            router.push(decodeURIComponent(redirectUrl) as Route);
          }
        } else {
          const signerId = await getCookie(AsyncKey.signerIdKey);
          if (signerId) {
            await linkWithFCAccount(signerId, res.data?.token);
          } else {
            onLinkWithFarcaster();
          }
        }
      }
    },
    [
      dispatch,
      linkWithFCAccount,
      magicProvider,
      onLinkWithFarcaster,
      redirectUrl,
      router,
      saveTokenCookie,
      trackingLoginSuccess,
    ]
  );
  const onLoginClick = useCallback(async () => {
    // setOpenLogin(true);
    popupLoginRef.current.show(btnLoginRef.current);
  }, []);
  const finishSocialLogin = useCallback(async () => {
    if (magic) {
      setLoading(true);
      try {
        setGettingMagicUserRedirect(true);
        const result = await magic.oauth.getRedirectResult();
        const queryUrl = query.get("url");
        await onGetMagicUserMetadata(result.magic.userMetadata);
        if (
          window.location.pathname.includes("/community-notes/explore") &&
          queryUrl
        ) {
          router.replace(
            `${window.location.pathname}?url=${encodeURIComponent(
              queryUrl
            )}` as Route
          );
        }
      } catch (err) {
        console.error(err);
      }
      setGettingMagicUserRedirect(false);
      setLoading(false);
    }
  }, [magic, onGetMagicUserMetadata, query, router]);
  const onMenuClick = useCallback(
    async (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      e.stopPropagation();
      const target = e.currentTarget;
      popupMenuRef.current.show(target);
    },
    []
  );
  const renderRight = useCallback(() => {
    if (loading) return null;
    if (gettingMagicUserRedirect)
      return (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 65,
            height: 60,
          }}
        >
          {<CircularProgress color="inherit" size={20} />}
        </div>
      );
    if (fcUser) {
      return (
        <>
          <div className={styles["user-info"]} onClick={onMenuClick}>
            <span
              className="truncate"
              style={{ marginRight: 10, maxWidth: 170 }}
            >
              {fcUser.display_name}
            </span>
            <ImageView
              src={userAvatar}
              className={styles.avatar}
              alt="avatar"
            />
          </div>
          {!fcUser.fid && (
            <div
              id="btn-login"
              ref={btnLoginRef}
              className={styles["btn-login"]}
              onClick={onLinkWithFarcaster}
            />
          )}
        </>
      );
    }
    return (
      <div
        id="btn-login"
        ref={btnLoginRef}
        className={styles["btn-login"]}
        onClick={onLoginClick}
      >
        Login
      </div>
    );
  }, [
    fcUser,
    gettingMagicUserRedirect,
    loading,
    onLinkWithFarcaster,
    onLoginClick,
    onMenuClick,
    userAvatar,
  ]);
  const onCloseSideMenu = useCallback(() => setOpenMenu(false), []);
  const onLogoutClick = useCallback(() => {
    logout();
    onCloseMenu();
  }, [logout, onCloseMenu]);
  const activeHome = useMemo(
    () => !!filters.find((el) => el.path === pathname),
    [filters, pathname]
  );
  const activeAnalytic = useMemo(() => pathname === "/insights", [pathname]);
  const activeMyContributor = useMemo(
    () => pathname.includes("/community-notes/contribute"),
    [pathname]
  );
  const activeCommunityNoteHelpful = useMemo(
    () => pathname === "/community-notes/helpful",
    [pathname]
  );
  const activeCommunityNoteNMR = useMemo(
    () => pathname === "/community-notes/need-rating",
    [pathname]
  );
  const activeCommunityNoteNeedContext = useMemo(
    () => pathname === "/community-notes/need-context",
    [pathname]
  );
  const onOpenDiscussion = useCallback(() => {
    if (!fcUser) {
      dispatch(FC_USER_ACTIONS.updateLoginSource("Post Link"));
      onLoginClick();
      return;
    }
    setInitialShareUrl("");
    toggleDiscussion();
  }, [dispatch, fcUser, onLoginClick, toggleDiscussion]);
  const onOpenModalReport = useCallback(() => {
    if (!fcUser) {
      dispatch(FC_USER_ACTIONS.updateLoginSource("Post Link"));
      onLoginClick();
      return;
    }
    toggleReport();
  }, [dispatch, fcUser, onLoginClick, toggleReport]);
  const onOpenModalAddNote = useCallback(() => {
    if (fcUser?.permissions?.includes(UserPermission.Writer)) {
      toggleAddNote();
    } else {
      dispatch(FC_USER_ACTIONS.updateLoginSource("Post Link"));
      onLoginClick();
    }
  }, [dispatch, fcUser, onLoginClick, toggleAddNote]);
  const renderMenu = useCallback(
    (hideCommunityNoteFilter?: boolean) => (
      <div className={styles.menus}>
        {!communityNote ? (
          <>
            <MenuItemMemo
              title="Home"
              to="/home"
              icon={
                <IconMenuHome fill={activeHome ? activeColor : inactiveColor} />
              }
              active={activeHome}
              onClick={onCloseSideMenu}
            />
            <MenuItemMemo
              title="Insights"
              to="/insights"
              icon={
                <IconMenuAnalytic
                  fill={activeAnalytic ? activeColor : inactiveColor}
                />
              }
              active={activeAnalytic}
              onClick={onCloseSideMenu}
            />
            <ComposeButton onClick={onOpenDiscussion} />
          </>
        ) : (
          <>
            <Link
              href="/community-notes/explore"
              className={styles["search-box"]}
              onClick={onCloseSideMenu}
            >
              <IconMenuExplore
                fill="var(--color-mute-text)"
                style={{ padding: 3 }}
              />
              <span className={styles.text}>Search</span>
            </Link>
            {!hideCommunityNoteFilter && (
              <>
                <MenuItemMemo
                  title="Helpful context"
                  to="/community-notes/helpful"
                  icon={<IconDot fill="var(--accent-blue)" />}
                  active={activeCommunityNoteHelpful}
                  onClick={onCloseSideMenu}
                />
                <MenuItemMemo
                  title="Needs more ratings"
                  to="/community-notes/need-rating"
                  icon={<IconDot fill="var(--accent-yellow)" />}
                  active={activeCommunityNoteNMR}
                  onClick={onCloseSideMenu}
                />
                <MenuItemMemo
                  title="Need context"
                  to="/community-notes/need-context"
                  icon={<IconDot />}
                  active={activeCommunityNoteNeedContext}
                  onClick={onCloseSideMenu}
                />
                <div className={styles["menu-separate"]} />
              </>
            )}
            {fcUser?.fid && (
              <MenuItemMemo
                title="My contribution"
                to="/community-notes/contribute"
                icon={
                  <IconMenuUserRole
                    fill={activeMyContributor ? activeColor : inactiveColor}
                  />
                }
                active={activeMyContributor}
                onClick={onCloseSideMenu}
              />
            )}
            <MenuItemMemo
              title="Write a note"
              icon={
                <IconPlus
                  size={20}
                  fill={inactiveColor}
                  style={{ padding: 3 }}
                />
              }
              onClick={onOpenModalAddNote}
            />
            <MenuItemMemo
              title="Report a link"
              icon={<IconMenuReport />}
              onClick={onOpenModalReport}
            />
          </>
        )}
        {fcUser && (
          <div
            className={`${styles["menu-item"]} ${styles["avatar-wrap"]}`}
            onClick={onMenuClick}
          >
            <ImageView
              src={userAvatar}
              className={styles.avatar}
              alt="avatar"
            />
          </div>
        )}
      </div>
    ),
    [
      activeAnalytic,
      activeColor,
      activeCommunityNoteHelpful,
      activeCommunityNoteNMR,
      activeCommunityNoteNeedContext,
      activeHome,
      activeMyContributor,
      communityNote,
      fcUser,
      inactiveColor,
      onCloseSideMenu,
      onMenuClick,
      onOpenDiscussion,
      onOpenModalAddNote,
      onOpenModalReport,
      userAvatar,
    ]
  );
  const onShareProfileClick = useCallback(() => {
    if (!fcUser) {
      onLoginClick();
      return;
    }
    setInitialShareUrl(window.location.origin + window.location.pathname);
    toggleDiscussion();
  }, [fcUser, onLoginClick, toggleDiscussion]);
  const windowScrollListener = useCallback(() => {
    setOpenMenu(false);
  }, []);
  useEffect(() => {
    if (fcUser) {
      GoogleAnalytics.identify(fcUser);
    }
  }, [fcUser]);
  useEffect(() => {
    window.addEventListener("scroll", windowScrollListener);
    return () => {
      window.removeEventListener("scroll", windowScrollListener);
    };
  }, [windowScrollListener]);
  useEffect(() => {
    if (magic) {
      if (query.get("provider")) {
        finishSocialLogin();
      } else {
        setGettingMagicUserRedirect(false);
        checkingAuth();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [magic, query]);
  useEffect(() => {
    if (action === "login") {
      setTimeout(() => {
        btnLoginRef.current?.click?.();
      }, 500);
    }
  }, [action]);
  return (
    <div className={styles.container}>
      <aside className={styles["left-side"]}>
        <Link
          className={`${styles["menu-item"]} ${styles["brand-wrap"]}`}
          href={communityNote ? "/community-notes" : "/home"}
        >
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 4,
              overflow: "hidden",
            }}
          >
            <IconBuidlerLogo size={30} style={{ borderRadius: 15 }} />
          </div>
          <span style={{ margin: "0 10px" }}>Buidler</span>
          {communityNote && <div className={styles["beta-tag"]}>beta</div>}
        </Link>
        {renderMenu()}
      </aside>
      <main className={styles["page-container"]}>
        <NavbarMobile
          communityNote={communityNote}
          openMenu={openMenu}
          toggleMenu={toggleMenu}
          renderMenu={renderMenu}
        />
        {!gettingMagicUserRedirect && children}
      </main>
      <aside className={styles["right-side"]}>{renderRight()}</aside>
      {fcUser?.fid && (
        <ModalFCReply
          open={!!replyCast}
          handleClose={onCloseReply}
          cast={replyCast}
        />
      )}
      <PopoverButton
        ref={popupMenuRef}
        popupOnly
        componentPopup={
          <PopupUserFCMenu
            onCloseMenu={onCloseMenu}
            onLogoutClick={onLogoutClick}
            onLinkWithFarcaster={onLinkWithFarcaster}
          />
        }
      />
      <PopoverButton
        ref={popupLoginRef}
        popupOnly
        componentPopup={
          <PopupSignIn onClose={onCloseMenuLogin} redirect={redirect} />
        }
      />
      <ModalCompose
        open={openDiscussion}
        handleClose={toggleDiscussion}
        openResult={onOpenResult}
        initialShareUrl={initialShareUrl}
      />
      <ModalReviewResult
        open={!!resultData}
        resultData={resultData}
        handleClose={onCloseReviewResult}
      />
      <ModalBugsReport open={openBugsReport} handleClose={toggleBugsReport} />
      <ModalSubmitReport
        open={openReport || !!metadataCreateReport}
        handleClose={toggleReport}
        initialMetadata={metadataCreateReport}
      />
      <ModalSubmitNote
        open={openAddNote || !!metadataCreateNote}
        handleClose={toggleAddNote}
        initialMetadata={metadataCreateNote}
        onOpenJoinAsContributor={onLinkWithFarcaster}
      />
      <ModalRateNote
        open={!!rateNote}
        handleClose={onCloseModalRateNote}
        note={rateNote?.note}
        metadata={rateNote?.metadata}
        detail={rateNote?.detail}
        onLogin={onLoginClick}
      />
      <ModalJoinAsContributor
        open={openLinkWithFarcaster}
        handleClose={handleCloseLinkWithFarcaster}
        deepLink={signedKeyRequest?.deeplinkUrl}
      />
      <div id="btn-share-profile" onClick={onShareProfileClick} />
      <div id="btn-bugs-report" onClick={toggleBugsReport} />
      <ScrollRestoration />
    </div>
  );
};

export default memo(FCWrapper);
