import api from "api";
import { AsyncKey } from "common/AppConfig";
import { clearData, setCookie } from "common/Cookie";
import { extractContentMessage } from "helpers/MessageHelper";
import useAppDispatch from "hooks/useAppDispatch";
import useAppSelector from "hooks/useAppSelector";
import useQuery from "hooks/useQuery";
import { ISignedKeyRequest } from "models/FC";
import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "react-hot-toast";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import { FC_USER_ACTIONS, getCurrentFCUser } from "reducers/FCUserReducers";
import styles from "./index.module.scss";
import LoginFC from "shared/LoginFC";
import {
  FC_CAST_ACTIONS,
  getCastReplies,
  getCastsByUrl,
  getMainMetadata,
} from "reducers/FCCastReducers";
import PopoverButton from "shared/PopoverButton";
import PopupUserFCMenu from "shared/PopupUserFCMenu";
import ImageView from "shared/ImageView";
import { logoutAction } from "reducers/actions";
import ModalFCCast from "shared/ModalFCCast";
import IconBuidlerLogo from "shared/SVG/IconBuidlerLogo";
import CopyRight from "pages/PluginFC/CopyRight";

const FCWrapper = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const popupMenuRef = useRef<any>();
  const [theme, setTheme] = useState("");
  const query = useQuery();
  const params = useParams<{ cast_hash: string }>();
  const castHash = useMemo(() => params?.cast_hash, [params?.cast_hash]);
  const initialTheme = useMemo(() => query.get("theme"), [query]);
  const pollingController = useRef(new AbortController());
  const q = useMemo(() => query.get("q"), [query]);
  const [loading, setLoading] = useState(false);
  const [polling, setPolling] = useState(false);
  const [castQueue, setCastQueue] = useState<any>(null);
  const [signedKeyRequest, setSignedKeyRequest] = useState<
    ISignedKeyRequest | undefined | null
  >(null);
  const storeSignerId = useAppSelector((state) => state.fcUser?.signer_id);
  const queryUrl = useAppSelector((state) => state.fcCast.queryUrl);
  const fcUser = useAppSelector((state) => state.fcUser?.data);
  const replyCast = useAppSelector((state) => state.fcCast.replyCast);
  const openNewCast = useAppSelector((state) => state.fcCast.openNewCast);
  const signerId = useMemo(() => query.get("signer_id"), [query]);
  const handleCloseNewCast = useCallback(() => {
    dispatch(FC_CAST_ACTIONS.toggleNewCast());
  }, [dispatch]);
  const logout = useCallback(() => {
    window.top?.postMessage(
      { type: "b-fc-plugin-logout" },
      { targetOrigin: "*" }
    );
    clearData();
    dispatch(logoutAction());
  }, [dispatch]);
  const onCloseMenu = useCallback(() => {
    popupMenuRef.current?.hide();
  }, []);
  const onLogoutClick = useCallback(() => {
    logout();
    onCloseMenu();
  }, [logout, onCloseMenu]);
  const castToFC = useCallback(
    async (payload: any) => {
      payload.text = extractContentMessage(payload.text);
      const res = await api.cast(payload);
      if (res.success) {
        // handle after cast
        if (fcUser?.username) {
          window.top?.postMessage(
            {
              type: "b-fc-plugin-open-tab",
              url: `https://warpcast.com/${
                fcUser?.username
              }/0x${res.data?.slice(0, 6)}`,
            },
            { targetOrigin: "*" }
          );
        }
        if (payload?.parent_cast_id?.hash) {
          dispatch(getCastReplies({ hash: payload?.parent_cast_id?.hash }));
        } else if (queryUrl) {
          dispatch(getCastsByUrl({ text: queryUrl, page: 1, limit: 20 }));
        }
      } else {
        logout();
      }
      setCastQueue(null);
    },
    [dispatch, fcUser?.username, logout, queryUrl]
  );
  const requestSignerId = useCallback(async () => {
    setLoading(true);
    const res = await api.requestSignedKey();
    setLoading(false);
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
  }, [dispatch, logout]);
  const initialSignerId = useCallback(
    async (id: string) => {
      await setCookie(AsyncKey.signerIdKey, id);
      const fcUser = await dispatch(getCurrentFCUser()).unwrap();
      if (fcUser) {
        dispatch(FC_USER_ACTIONS.updateSignerId(id));
      } else {
        logout();
      }
    },
    [dispatch, logout]
  );
  const checkingSignerId = useCallback(async () => {
    if (signerId) {
      await setCookie(AsyncKey.signerIdKey, signerId);
      const fcUser = await dispatch(getCurrentFCUser()).unwrap();
      if (fcUser) {
        dispatch(FC_USER_ACTIONS.updateSignerId(signerId));
      } else {
        logout();
      }
    }
  }, [dispatch, logout, signerId]);
  const onCloseModalReply = useCallback(() => {
    dispatch(FC_CAST_ACTIONS.updateReplyCast());
  }, [dispatch]);
  useEffect(() => {
    if (q) {
      dispatch(FC_CAST_ACTIONS.updateQueryUrl(q));
    }
  }, [dispatch, q]);
  useEffect(() => {
    if (queryUrl) {
      dispatch(getCastsByUrl({ text: queryUrl, page: 1, limit: 20 }));
      dispatch(getMainMetadata(queryUrl));
    }
  }, [dispatch, queryUrl]);
  useEffect(() => {
    checkingSignerId();
  }, [checkingSignerId]);
  useEffect(() => {
    if (storeSignerId) {
      window.top?.postMessage(
        { type: "b-fc-plugin-logged", signerId: storeSignerId },
        { targetOrigin: "*" }
      );
    }
  }, [storeSignerId]);
  useEffect(() => {
    let timeout: any = null;
    if (fcUser?.username && castQueue) {
      // timeout to cast to fc after login
      timeout = setTimeout(() => {
        castToFC(castQueue);
      }, 1000);
    }
    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [castQueue, castToFC, fcUser?.username]);
  useEffect(() => {
    if (initialTheme) {
      setTheme(initialTheme);
    }
  }, [initialTheme]);
  useEffect(() => {
    const messageListener = async (
      e: MessageEvent<{ type: string; payload: any; metadata?: any }>
    ) => {
      if (e?.data?.type === "b-fc-open-login") {
        onLoginClick();
      }
      if (e?.data?.type === "b-fc-update-tw-theme") {
        setTheme(e.data.payload);
      }
      if (e?.data?.type === "b-fc-reload-iframe") {
        // reload
      }
      if (e?.data?.type === "tw-cast") {
        castToFC(e.data.payload);
      }
      if (e?.data?.type === "tw-cast-queue") {
        setCastQueue(e.data.payload);
      }
      if (e?.data?.type === "b-fc-update-tw-url") {
        dispatch(FC_CAST_ACTIONS.updateQueryUrl(e?.data?.payload?.url || ""));
        dispatch(FC_CAST_ACTIONS.updateTitleUrl(e?.data?.payload?.title || ""));
        if (castHash) {
          navigate(-1);
        }
      }
      if (e?.data?.type === "b-fc-initial-data") {
        const { signerId, q, theme, title } = e?.data?.payload || {};
        if (signerId) {
          initialSignerId(signerId);
        }
        if (q) {
          dispatch(FC_CAST_ACTIONS.updateQueryUrl(q));
        }
        if (theme) {
          setTheme(theme);
        }
        if (title) {
          dispatch(FC_CAST_ACTIONS.updateTitleUrl(title));
        }
      }
      if (e?.data?.type === "b-fc-new-cast") {
        dispatch(FC_CAST_ACTIONS.openNewCast());
      }
      if (e?.data?.type === "b-fc-close-reply") {
        onCloseModalReply();
      }
    };
    window.addEventListener("message", messageListener);
    return () => {
      window.removeEventListener("message", messageListener);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [castHash, onCloseModalReply, castToFC, dispatch, initialSignerId]);
  const onWithoutLoginClick = useCallback(() => {
    pollingController.current.abort();
    setSignedKeyRequest(null);
    if (openNewCast) {
      handleCloseNewCast();
    }
  }, [handleCloseNewCast, openNewCast]);
  const onLoginClick = useCallback(() => {
    if (signedKeyRequest) return;
    requestSignerId();
  }, [requestSignerId, signedKeyRequest]);
  useEffect(() => {
    if (openNewCast && !fcUser) {
      onLoginClick();
    }
  }, [fcUser, onLoginClick, openNewCast]);
  const onMenuClick = useCallback(
    async (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      e.stopPropagation();
      const target = e.currentTarget;
      popupMenuRef.current.show(target);
    },
    []
  );
  useEffect(() => {
    if (replyCast) {
      window.top?.postMessage(
        { type: "b-fc-plugin-open-reply", payload: replyCast },
        { targetOrigin: "*" }
      );
    }
  }, [replyCast]);
  return (
    <div
      className={`buidler-plugin-theme-${theme || "light"} ${styles.container}`}
    >
      <div className={styles.header}>
        <a className={styles["btn-jump-out"]} href="/" target="_blank">
          <IconBuidlerLogo />
          <span style={{ margin: "0 10px" }}>Buidler</span>
        </a>
        {fcUser ? (
          <div className={styles["user-info"]} onClick={onMenuClick}>
            {fcUser.pfp?.url && (
              <ImageView
                src={fcUser.pfp?.url}
                alt="fc-user-avatar"
                className={styles.avatar}
              />
            )}
          </div>
        ) : (
          <div className={styles["btn-login"]} onClick={onLoginClick}>
            <span>Login</span>
          </div>
        )}
      </div>
      <Outlet />
      <CopyRight />
      {!storeSignerId && signedKeyRequest?.deeplinkUrl && (
        <div className={styles["login__wrap"]} onClick={onWithoutLoginClick}>
          <LoginFC
            deepLink={signedKeyRequest.deeplinkUrl}
            onWithoutLoginClick={onWithoutLoginClick}
          />
        </div>
      )}
      <ModalFCCast
        open={openNewCast}
        handleClose={handleCloseNewCast}
        theme={theme}
      />
      <PopoverButton
        ref={popupMenuRef}
        popupOnly
        style={{ top: 10 }}
        componentPopup={
          <PopupUserFCMenu
            onCloseMenu={onCloseMenu}
            theme={theme}
            onLogoutClick={onLogoutClick}
          />
        }
      />
    </div>
  );
};

export default memo(FCWrapper);
