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
import LoginFC from "shared/LoginFC";
import { ISignedKeyRequest } from "models/FC";
import api from "api";
import toast from "react-hot-toast";
import IconDownload from "shared/SVG/FC/IconDownload";
import useExtensionInstalled from "hooks/useExtensionInstalled";
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
import MagicLogin from "shared/MagicLogin";
import { MagicUserMetadata } from "magic-sdk";
import { CircularProgress } from "@mui/material";
import { useMagic } from "providers/MagicProvider";
import IconMenuCommunityNote from "shared/SVG/FC/IconMenuCommunityNote";
import WhiteListedModal from "shared/WhiteListedModal";
import { Route } from "next";
import ModalSubmitReport from "shared/ModalSubmitReport";
import IconDot from "shared/SVG/IconDot";
import { getReportCategories } from "reducers/CommunityNoteReducers";
import ModalSubmitNote from "shared/ModalSubmitNote";
import IconPlus from "shared/SVG/IconPlus";
import IconMenuReport from "shared/SVG/IconMenuReport";

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
              : "var(--color-secondary-text)",
            fontWeight: active ? 700 : 600,
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
  const [loading, setLoading] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const [openLogin, setOpenLogin] = useState(false);
  const [openLinkWithFarcaster, setOpenLinkWithFarcaster] = useState(false);
  const [magicLoading, setMagicLoading] = useState(false);
  const [openModalWhiteListed, setOpenModalWhiteListed] = useState(false);
  const [gettingMagicUserRedirect, setGettingMagicUserRedirect] =
    useState(false);
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
  const isExtensionInstalled = useExtensionInstalled();
  const fcUser = useAppSelector((state) => state.fcUser?.data);
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
  const showMobileMenu = useMemo(
    () =>
      pathname === "/home" ||
      pathname === "/insights" ||
      pathname === "/active" ||
      pathname === "/top",
    [pathname]
  );
  const toggleReport = useCallback(
    () => setOpenReport((current) => !current),
    []
  );
  const toggleAddNote = useCallback(
    () => setOpenAddNote((current) => !current),
    []
  );
  const toggleModalWhiteListed = useCallback(
    () => setOpenModalWhiteListed((current) => !current),
    []
  );
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
    setOpenLogin(false);
    clearData();
    dispatch(logoutAction());
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
      setOpenLogin(false);
      setGettingMagicUserRedirect(false);
      toggleModalWhiteListed();
    },
    [
      dispatch,
      magicProvider,
      redirectUrl,
      router,
      toggleModalWhiteListed,
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
  }, [theme]);
  useEffect(() => {
    if (magic) {
      checkingAuth();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [magic]);
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
  const onWithoutLoginClick = useCallback(() => {
    pollingController.current.abort();
    setOpenLinkWithFarcaster(false);
    setOpenLogin(false);
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
        setOpenLogin(false);
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
  const onLinkWithFarcaster = useCallback(() => {
    setOpenLogin(true);
    setOpenLinkWithFarcaster(true);
    requestSignerId();
    onCloseMenu();
  }, [onCloseMenu, requestSignerId]);
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
          setOpenLogin(false);
          setGettingMagicUserRedirect(false);
          if (redirectUrl) {
            router.push(decodeURIComponent(redirectUrl) as Route);
          }
          toggleModalWhiteListed();
        } else {
          const signerId = await getCookie(AsyncKey.signerIdKey);
          if (signerId) {
            await linkWithFCAccount(signerId, res.data?.token);
          } else {
            onLinkWithFarcaster();
          }
        }
      }
      setMagicLoading(false);
    },
    [
      dispatch,
      linkWithFCAccount,
      magicProvider,
      onLinkWithFarcaster,
      redirectUrl,
      router,
      saveTokenCookie,
      toggleModalWhiteListed,
      trackingLoginSuccess,
    ]
  );
  const onCloseMagicLogin = useCallback(() => {
    setOpenLogin(false);
  }, []);
  const onLoginClick = useCallback(async () => {
    setOpenLogin(true);
  }, []);
  const finishSocialLogin = useCallback(async () => {
    if (magic) {
      try {
        setGettingMagicUserRedirect(true);
        const result = await magic.oauth.getRedirectResult();
        onGetMagicUserMetadata(result.magic.userMetadata);
      } catch (err) {
        setGettingMagicUserRedirect(false);
      }
    }
  }, [magic, onGetMagicUserMetadata]);
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
    if (!fcUser) {
      dispatch(FC_USER_ACTIONS.updateLoginSource("Post Link"));
      onLoginClick();
      return;
    }
    toggleAddNote();
  }, [dispatch, fcUser, onLoginClick, toggleAddNote]);
  const renderMenu = useCallback(
    () => (
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
            <MenuItemMemo
              title="Helpful context"
              to="/community-notes/helpful"
              icon={<IconDot fill="var(--accent-blue)" />}
              active={activeCommunityNoteHelpful}
              onClick={onCloseSideMenu}
            />
            <MenuItemMemo
              title="Need more rating"
              to="/community-notes/need-rating"
              icon={<IconDot fill="var(--accent-yellow)" />}
              active={activeCommunityNoteNMR}
              onClick={onCloseSideMenu}
            />
            <MenuItemMemo
              title="Need add context"
              to="/community-notes/need-context"
              icon={<IconDot />}
              active={activeCommunityNoteNeedContext}
              onClick={onCloseSideMenu}
            />
            <div
              style={{
                margin: "14px 25px 0 25px",
                height: 2,
                borderRadius: 1,
                backgroundColor: "var(--color-highlight-action-high)",
              }}
            />
            <MenuItemMemo
              title="Add a note"
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
    if (query.get("provider")) {
      finishSocialLogin();
    }
  }, [finishSocialLogin, query]);
  useEffect(() => {
    if (action === "login") {
      setOpenLogin(true);
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
            <IconBuidlerLogo size={30} />
          </div>
          <span style={{ margin: "0 10px" }}>Buidler</span>
          {communityNote && <div className={styles["beta-tag"]}>beta</div>}
        </Link>
        {renderMenu()}
        {!isExtensionInstalled && (
          <a
            className={styles["extension-description-container"]}
            href="https://chrome.google.com/webstore/detail/buidler-one-extension-any/omhbdacaeafhladkifficmjmpeaijlfc"
            target="_blank"
            rel="noreferrer"
          >
            <span className={styles["extension-description"]}>
              Please install extension for the full experience with Buidler!
            </span>
            <div className={styles.cta}>
              <IconDownload
                fill="var(--color-mention)"
                style={{ marginRight: 10 }}
              />
              <span>Download Extension</span>
            </div>
          </a>
        )}
      </aside>
      <main className={styles["page-container"]}>
        {showMobileMenu && (
          <div
            className={`${styles["nav-mobile-wrap"]} ${
              openMenu ? styles["nav-mobile-wrap-on"] : ""
            }`}
          >
            <div className={styles["nav-mobile"]}>
              <Link className={styles["mobile-brand-wrap"]} href="/home">
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 4,
                    overflow: "hidden",
                  }}
                >
                  <IconBuidlerLogo size={30} />
                </div>
                <span style={{ margin: "0 10px" }}>Buidler</span>
              </Link>
              <div className={styles["side-menu"]} onClick={toggleMenu}>
                <div className={styles["line-1"]} />
                <div className={styles["line-2"]} />
              </div>
            </div>
            {renderMenu()}
          </div>
        )}
        {children}
      </main>
      <aside className={styles["right-side"]}>{renderRight()}</aside>
      {!fcUser?.fid && openLogin && (
        <div className={styles["login__wrap"]} onClick={onWithoutLoginClick}>
          {!openLinkWithFarcaster ? (
            <MagicLogin
              handleClose={onCloseMagicLogin}
              onLogged={onGetMagicUserMetadata}
              setMagicLoading={setMagicLoading}
              magicLoading={magicLoading}
              redirect={redirect}
            />
          ) : (
            <LoginFC
              deepLink={signedKeyRequest?.deeplinkUrl}
              onWithoutLoginClick={onWithoutLoginClick}
            />
          )}
        </div>
      )}
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
      <WhiteListedModal
        open={openModalWhiteListed}
        handleClose={toggleModalWhiteListed}
        isWhiteListed={fcUser?.is_whitelisted}
      />
      <ModalSubmitReport open={openReport} handleClose={toggleReport} />
      <ModalSubmitNote open={openAddNote} handleClose={toggleAddNote} />
      <div id="btn-share-profile" onClick={onShareProfileClick} />
      <div id="btn-bugs-report" onClick={toggleBugsReport} />
    </div>
  );
};

export default memo(FCWrapper);
