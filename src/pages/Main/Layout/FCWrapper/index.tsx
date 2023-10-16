import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import styles from "./index.module.scss";
import IconBuidlerLogo from "shared/SVG/IconBuidlerLogo";
import IconMenuHome from "shared/SVG/FC/IconMenuHome";
import IconMenuExplore from "shared/SVG/FC/IconMenuExplore";
import { clearData, getCookie, setCookie } from "common/Cookie";
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
import { getFeed } from "reducers/HomeFeedReducers";
import useFeedFilter from "hooks/useFeedFilter";

interface IMenuItem {
  active?: boolean;
  title: string;
  to: string;
  icon: React.ReactElement;
}

const MenuItem = ({ active, title, to, icon }: IMenuItem) => {
  return (
    <Link className={styles["menu-item"]} to={to}>
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

const FCWrapper = () => {
  const dispatch = useAppDispatch();
  const filter = useFeedFilter();
  const [loading, setLoading] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [polling, setPolling] = useState(false);
  const [signedKeyRequest, setSignedKeyRequest] = useState<
    ISignedKeyRequest | undefined | null
  >(null);
  const isExtensionInstalled = useExtensionInstalled();
  const fcUser = useAppSelector((state) => state.fcUser?.data);
  const storeSignerId = useAppSelector((state) => state.fcUser?.signer_id);
  const pollingController = useRef(new AbortController());
  const location = useLocation();
  const activeColor = useMemo(() => "var(--color-primary-text)", []);
  const inactiveColor = useMemo(() => "var(--color-secondary-text)", []);
  const logout = useCallback(() => {
    window.top?.postMessage(
      { type: "b-fc-plugin-logout" },
      { targetOrigin: "*" }
    );
    clearData();
    dispatch(logoutAction());
  }, [dispatch]);
  const checkingAuth = useCallback(async () => {
    setLoading(true);
    const signerId = await getCookie(AsyncKey.signerIdKey);
    if (signerId) {
      const fcUser = await dispatch(getCurrentFCUser()).unwrap();
      if (fcUser) {
        dispatch(FC_USER_ACTIONS.updateSignerId(signerId));
      } else {
        logout();
      }
    }
    setLoading(false);
  }, [dispatch, logout]);
  useEffect(() => {
    checkingAuth();
  }, [checkingAuth]);
  useEffect(() => {
    if (filter.label) {
      dispatch(getFeed({ type: filter.label, page: 1, limit: 20 }));
    }
  }, [dispatch, filter.label]);
  const onWithoutLoginClick = useCallback(() => {
    pollingController.current.abort();
    setSignedKeyRequest(null);
  }, []);
  const requestSignerId = useCallback(async () => {
    if (loginLoading) return;
    setLoginLoading(true);
    const res = await api.requestSignedKey();
    setLoginLoading(false);
    if (res.data?.token) {
      setSignedKeyRequest(res.data);
      setPolling(true);
      try {
        const resPolling = await api.pollingSignedKey(
          res.data?.token,
          pollingController.current
        );
        if (resPolling?.data?.signer_id) {
          await setCookie(AsyncKey.signerIdKey, resPolling?.data?.signer_id);
          const fcUser = await dispatch(getCurrentFCUser()).unwrap();
          if (fcUser) {
            dispatch(
              FC_USER_ACTIONS.updateSignerId(resPolling?.data?.signer_id)
            );
          } else {
            logout();
          }
        }
      } catch (error: any) {
        toast.error(error.message);
        setSignedKeyRequest(null);
      }
      setPolling(false);
    }
  }, [dispatch, loginLoading, logout]);
  const onLoginClick = useCallback(() => {
    if (signedKeyRequest) return;
    requestSignerId();
  }, [requestSignerId, signedKeyRequest]);
  const renderRight = useCallback(() => {
    if (loading) return null;
    if (fcUser) {
      return (
        <div className={styles["user-info"]}>
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
      <div className={styles["btn-login"]} onClick={onLoginClick}>
        Login
      </div>
    );
  }, [fcUser, loading, onLoginClick]);
  return (
    <div className={`buidler-plugin-theme-light ${styles.container}`}>
      <div className={styles["left-side"]}>
        <Link
          className={`${styles["menu-item"]} ${styles["brand-wrap"]}`}
          to="/"
        >
          <IconBuidlerLogo size={30} />
          <span style={{ margin: "0 10px" }}>Buidler</span>
        </Link>
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <MenuItemMemo
            title="Home"
            to="/"
            icon={
              <IconMenuHome
                fill={location.pathname === "/" ? activeColor : inactiveColor}
              />
            }
            active={location.pathname === "/"}
          />
          <MenuItemMemo
            title="Explore"
            to="/explore"
            icon={
              <IconMenuExplore
                fill={
                  location.pathname === "/explore" ? activeColor : inactiveColor
                }
              />
            }
            active={location.pathname === "/explore"}
          />
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
      </div>
      <div className={styles["page-container"]}>
        <div className={styles["nav-mobile"]}>
          <Link className={styles["mobile-brand-wrap"]} to="/">
            <IconBuidlerLogo size={30} />
            <span style={{ margin: "0 10px" }}>Buidler</span>
          </Link>
          {fcUser ? (
            <ImageView
              src={fcUser.pfp.url}
              alt="avatar"
              className={styles.avatar}
              style={{ marginRight: 15 }}
            />
          ) : (
            <div className={styles["btn-login"]} onClick={onLoginClick}>
              Login
            </div>
          )}
        </div>
        <Outlet />
      </div>
      <div className={styles["right-side"]}>{renderRight()}</div>
      {!storeSignerId && signedKeyRequest?.deeplinkUrl && (
        <div className={styles["login__wrap"]} onClick={onWithoutLoginClick}>
          <LoginFC
            deepLink={signedKeyRequest.deeplinkUrl}
            onWithoutLoginClick={onWithoutLoginClick}
          />
        </div>
      )}
    </div>
  );
};

export default memo(FCWrapper);
