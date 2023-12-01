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
import IconMenuExplore from "shared/SVG/FC/IconMenuExplore";
import { clearData, getCookie, removeCookie, setCookie } from "common/Cookie";
import { AsyncKey } from "common/AppConfig";
import useAppDispatch from "hooks/useAppDispatch";
import { FC_USER_ACTIONS, getCurrentFCUser } from "reducers/FCUserReducers";
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
import IconMenuCommunity from "shared/SVG/FC/IconMenuCommunity";
import useQuery from "hooks/useQuery";
import IconMenuAnalytic from "shared/SVG/FC/IconMenuAnalytic";
import ModalBugsReport from "shared/ModalBugsReport";
import GoogleAnalytics from "services/analytics/GoogleAnalytics";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";

interface IMenuItem {
  active?: boolean;
  title: string;
  to: string;
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
  return (
    <Link className={styles["menu-item"]} href={to} onClick={onMenuClick}>
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
    </Link>
  );
};

const MenuItemMemo = memo(MenuItem);

interface IFCWrapper {
  children: React.ReactNode;
}

const FCWrapper = ({ children }: IFCWrapper) => {
  const dispatch = useAppDispatch();
  const [openMenu, setOpenMenu] = useState(false);
  const popupMenuRef = useRef<any>();
  const [loading, setLoading] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const [openLogin, setOpenLogin] = useState(false);
  const query = useQuery();
  const querySignerId = useMemo(() => query?.get("signer_id"), [query]);
  const [polling, setPolling] = useState(false);
  const [initialShareUrl, setInitialShareUrl] = useState("");
  const [openDiscussion, setOpenDiscussion] = useState(false);
  const [openBugsReport, setOpenBugsReport] = useState(false);
  const initialTheme = useMemo(() => query?.get("theme"), [query]);
  const [theme, setTheme] = useState(initialTheme);
  const filters = useFeedFilters();
  const params = useParams<{ url: string }>();
  const exploreUrl = useMemo(() => params?.url, [params?.url]);
  const [signedKeyRequest, setSignedKeyRequest] = useState<
    ISignedKeyRequest | undefined | null
  >(null);
  const isExtensionInstalled = useExtensionInstalled();
  const fcUser = useAppSelector((state) => state.fcUser?.data);
  const loginSource = useAppSelector((state) => state.fcUser.loginSource);
  const replyCast = useAppSelector((state) => state.homeFeed.replyCast);
  const storeSignerId = useAppSelector((state) => state.fcUser?.signer_id);
  const pollingController = useRef(new AbortController());
  const pathname = usePathname();
  const activeColor = useMemo(() => "var(--color-primary-text)", []);
  const inactiveColor = useMemo(() => "var(--color-secondary-text)", []);
  const [resultData, setResultData] = useState<any>(null);
  const showMobileMenu = useMemo(
    () =>
      pathname === "/home" ||
      pathname === "/insights" ||
      pathname === "/active" ||
      pathname === "/top",
    [pathname]
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
  const logout = useCallback(() => {
    window.top?.postMessage(
      { type: "b-fc-plugin-logout" },
      { targetOrigin: "*" }
    );
    setSignedKeyRequest(null);
    setOpenLogin(false);
    clearData();
    dispatch(logoutAction());
  }, [dispatch]);
  const onCloseReply = useCallback(() => {
    dispatch(HOME_FEED_ACTIONS.updateReplyCast());
  }, [dispatch]);
  const checkRequestToken = useCallback(async () => {
    const reqToken = await getCookie(AsyncKey.requestTokenKey);
    if (!reqToken) return;
    const res = await api.checkRequestToken(reqToken);
    if (res.data?.state === "completed" && res.data?.signer_id) {
      await setCookie(AsyncKey.signerIdKey, res?.data?.signer_id);
      await removeCookie(AsyncKey.requestTokenKey);
      const fcUser = await dispatch(getCurrentFCUser()).unwrap();
      if (fcUser) {
        dispatch(FC_USER_ACTIONS.updateSignerId(res?.data?.signer_id));
      }
    }
  }, [dispatch]);
  const checkingAuth = useCallback(async () => {
    setLoading(true);
    const signerId = await getCookie(AsyncKey.signerIdKey);
    if (signerId) {
      setCookie(AsyncKey.signerIdKey, signerId);
      const fcUser = await dispatch(getCurrentFCUser()).unwrap();
      if (fcUser) {
        dispatch(FC_USER_ACTIONS.updateSignerId(signerId));
      }
    } else if (querySignerId) {
      await setCookie(AsyncKey.signerIdKey, querySignerId);
      const fcUser = await dispatch(getCurrentFCUser()).unwrap();
      if (fcUser) {
        dispatch(FC_USER_ACTIONS.updateSignerId(querySignerId));
      }
    } else {
      await checkRequestToken();
    }
    setLoading(false);
  }, [checkRequestToken, dispatch, querySignerId]);
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
    checkingAuth();
  }, [checkingAuth]);
  useEffect(() => {
    if (exploreUrl) {
      dispatch(getFeedByUrl({ text: exploreUrl, page: 1, limit: 20 }));
    }
  }, [dispatch, exploreUrl]);
  const onWithoutLoginClick = useCallback(() => {
    pollingController.current.abort();
    setSignedKeyRequest(null);
    setOpenLogin(false);
  }, []);
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
  const requestSignerId = useCallback(async () => {
    if (loginLoading) return;
    setLoginLoading(true);
    setOpenLogin(true);
    const res = await api.requestSignedKey();
    setLoginLoading(false);
    if (res.data?.token) {
      setSignedKeyRequest(res.data);
      await setCookie(AsyncKey.requestTokenKey, res.data?.token);
      setPolling(true);
      try {
        const resPolling = await api.pollingSignedKey(
          res.data?.token,
          pollingController.current
        );
        if (resPolling?.data?.signer_id) {
          trackingLoginSuccess();
          await setCookie(AsyncKey.signerIdKey, resPolling?.data?.signer_id);
          await removeCookie(AsyncKey.requestTokenKey);
          const fcUser = await dispatch(getCurrentFCUser()).unwrap();
          if (fcUser) {
            dispatch(
              FC_USER_ACTIONS.updateSignerId(resPolling?.data?.signer_id)
            );
          }
        }
      } catch (error: any) {
        toast.error(error.message);
        trackingLoginFailed(error.message);
        setSignedKeyRequest(null);
        setOpenLogin(false);
      }
      setPolling(false);
    } else {
      trackingLoginFailed(res.message || "");
    }
  }, [dispatch, loginLoading, trackingLoginFailed, trackingLoginSuccess]);
  const onLoginClick = useCallback(() => {
    if (signedKeyRequest) return;
    requestSignerId();
  }, [requestSignerId, signedKeyRequest]);
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
    if (fcUser) {
      return (
        <div className={styles["user-info"]} onClick={onMenuClick}>
          <span className="truncate" style={{ marginRight: 10, maxWidth: 170 }}>
            {fcUser.display_name}
          </span>
          <ImageView
            src={fcUser.pfp.url}
            className={styles.avatar}
            alt="avatar"
          />
        </div>
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
  }, [fcUser, loading, onLoginClick, onMenuClick]);
  const onCloseMenu = useCallback(() => {
    popupMenuRef.current?.hide();
  }, []);
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
  const activeExplore = useMemo(
    () => pathname?.includes("/explore"),
    [pathname]
  );
  const activeCommunity = useMemo(
    () => pathname?.includes("/community"),
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
  const renderMenu = useCallback(
    () => (
      <div className={styles.menus}>
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
        {/* <MenuItemMemo
          title="Communities"
          to="/community"
          icon={
            <IconMenuCommunity
              fill={activeCommunity ? activeColor : inactiveColor}
            />
          }
          active={activeCommunity}
        /> */}
        {/* <MenuItemMemo
          title="Explore"
          to="/explore"
          icon={
            <IconMenuExplore
              fill={activeExplore ? activeColor : inactiveColor}
            />
          }
          active={activeExplore}
        /> */}
        <ComposeButton onClick={onOpenDiscussion} />
        {fcUser && (
          <div className={`${styles["menu-item"]} ${styles["avatar-wrap"]}`}>
            <ImageView
              src={fcUser?.pfp.url}
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
      activeHome,
      fcUser,
      inactiveColor,
      onCloseSideMenu,
      onOpenDiscussion,
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
    window.addEventListener("scroll", windowScrollListener);
    return () => {
      window.removeEventListener("scroll", windowScrollListener);
    };
  }, [windowScrollListener]);
  return (
    <div className={styles.container}>
      <aside className={styles["left-side"]}>
        <Link
          className={`${styles["menu-item"]} ${styles["brand-wrap"]}`}
          href="/home"
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
      {!storeSignerId && openLogin && (
        <div className={styles["login__wrap"]} onClick={onWithoutLoginClick}>
          <LoginFC
            deepLink={signedKeyRequest?.deeplinkUrl}
            onWithoutLoginClick={onWithoutLoginClick}
          />
        </div>
      )}
      {fcUser && (
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
      {/* <ScrollRestoration /> */}
      <div id="btn-share-profile" onClick={onShareProfileClick} />
      <div id="btn-bugs-report" onClick={toggleBugsReport} />
    </div>
  );
};

export default memo(FCWrapper);
