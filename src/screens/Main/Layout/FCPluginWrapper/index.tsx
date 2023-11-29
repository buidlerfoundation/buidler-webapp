"use client";

import api from "api";
import { AsyncKey } from "common/AppConfig";
import { clearData, getCookie, removeCookie, setCookie } from "common/Cookie";
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
import { FC_USER_ACTIONS, getCurrentFCUser } from "reducers/FCUserReducers";
import styles from "./index.module.scss";
import LoginFC from "shared/LoginFC";
import {
  FC_CAST_ACTIONS,
  getCastsByUrl,
  getMainMetadata,
} from "reducers/FCCastReducers";
import PopoverButton from "shared/PopoverButton";
import PopupUserFCMenu from "shared/PopupUserFCMenu";
import ImageView from "shared/ImageView";
import { logoutAction } from "reducers/actions";
import IconBuidlerLogo from "shared/SVG/IconBuidlerLogo";
import CopyRight from "screens/PluginFC/CopyRight";
import { getResultCastByHash } from "reducers/HomeFeedReducers";
import {
  extractContentMessage,
  normalizeContentCastToSubmit,
} from "helpers/CastHelper";
import { useParams, useRouter } from "next/navigation";

interface IFCPluginWrapper {
  children: React.ReactNode;
}

const FCPluginWrapper = ({ children }: IFCPluginWrapper) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const popupMenuRef = useRef<any>();
  const [theme, setTheme] = useState("");
  const query = useQuery();
  const params = useParams<{ cast_hash: string }>();
  const castHash = useMemo(() => params?.cast_hash, [params?.cast_hash]);
  const initialTheme = useMemo(() => query?.get("theme"), [query]);
  const pollingController = useRef(new AbortController());
  const q = useMemo(() => query?.get("q"), [query]);
  const [loading, setLoading] = useState(false);
  const [openLogin, setOpenLogin] = useState(false);
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
  const signerId = useMemo(() => query?.get("signer_id"), [query]);
  const logout = useCallback(() => {
    window.top?.postMessage(
      { type: "b-fc-plugin-logout" },
      { targetOrigin: "*" }
    );
    clearData();
    dispatch(logoutAction());
    setOpenLogin(false);
    setSignedKeyRequest(null);
  }, [dispatch]);
  const onCloseMenu = useCallback(() => {
    popupMenuRef.current?.hide();
  }, []);
  const onLogoutClick = useCallback(() => {
    logout();
    onCloseMenu();
  }, [logout, onCloseMenu]);
  const getPayloadToSubmit = useCallback((payload: any) => {
    if (payload.onlyLink) {
      return payload;
    } else {
      const mentionData = normalizeContentCastToSubmit(payload.text);
      return {
        ...payload,
        text: mentionData.content,
        mentions: mentionData.mentions,
        mentions_positions: mentionData.mentionPositions,
      };
    }
  }, []);
  const castToFC = useCallback(
    async (payload: any) => {
      payload.text = extractContentMessage(payload.text);
      const payloadToSubmit = getPayloadToSubmit(payload);
      payloadToSubmit.source = "extension";
      const res = await api.cast(payloadToSubmit);
      if (res.success && res.data) {
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
          dispatch(
            getResultCastByHash({
              parent_hash: payload?.parent_cast_id?.hash,
              hash: res.data,
              page: 1,
              limit: 20,
              cast_author_fid: fcUser?.fid,
            })
          );
        } else if (queryUrl) {
          dispatch(
            getResultCastByHash({
              hash: res.data,
              page: 1,
              limit: 20,
              cast_author_fid: fcUser?.fid,
              query_url: queryUrl,
            })
          );
        }
      }
      setCastQueue(null);
    },
    [dispatch, fcUser?.fid, fcUser?.username, getPayloadToSubmit, queryUrl]
  );
  const requestSignerId = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    setOpenLogin(true);
    const res = await api.requestSignedKey();
    setLoading(false);
    if (res.data?.token) {
      setSignedKeyRequest(res.data);
      setPolling(true);
      await setCookie(AsyncKey.requestTokenKey, res.data?.token);
      try {
        const resPolling = await api.pollingSignedKey(
          res.data?.token,
          pollingController.current
        );
        if (resPolling?.data?.signer_id) {
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
        setSignedKeyRequest(null);
        setOpenLogin(false);
      }
      setPolling(false);
    }
  }, [dispatch, loading]);
  const initialSignerId = useCallback(
    async (id: string) => {
      await setCookie(AsyncKey.signerIdKey, id);
      const fcUser = await dispatch(getCurrentFCUser()).unwrap();
      if (fcUser) {
        dispatch(FC_USER_ACTIONS.updateSignerId(id));
      }
    },
    [dispatch]
  );
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
  const checkingSignerId = useCallback(async () => {
    if (signerId) {
      await setCookie(AsyncKey.signerIdKey, signerId);
      const fcUser = await dispatch(getCurrentFCUser()).unwrap();
      if (fcUser) {
        dispatch(FC_USER_ACTIONS.updateSignerId(signerId));
      }
    } else {
      const signerIdFromCookie = await getCookie(AsyncKey.signerIdKey);
      if (signerIdFromCookie) {
        const fcUser = await dispatch(getCurrentFCUser()).unwrap();
        if (fcUser) {
          dispatch(FC_USER_ACTIONS.updateSignerId(signerIdFromCookie));
        }
      } else {
        checkRequestToken();
      }
    }
  }, [checkRequestToken, dispatch, signerId]);
  const onCloseModalReply = useCallback(() => {
    dispatch(FC_CAST_ACTIONS.updateReplyCast());
  }, [dispatch]);
  const onLoginClick = useCallback(() => {
    if (signedKeyRequest) return;
    requestSignerId();
  }, [requestSignerId, signedKeyRequest]);
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
      if (e?.data?.type === "b-fc-navigate") {
        router.replace(e.data.payload);
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
          router.back();
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
      if (e?.data?.type === "b-fc-close-reply") {
        onCloseModalReply();
      }
    };
    window.addEventListener("message", messageListener);
    return () => {
      window.removeEventListener("message", messageListener);
    };
  }, [
    castHash,
    onCloseModalReply,
    castToFC,
    dispatch,
    initialSignerId,
    onLoginClick,
    router,
  ]);
  useEffect(() => {
    if (theme) {
      document.getElementsByTagName("html")?.[0]?.setAttribute("class", theme);
      setTheme(theme);
    }
  }, [theme]);
  const onWithoutLoginClick = useCallback(() => {
    pollingController.current.abort();
    setSignedKeyRequest(null);
    setOpenLogin(false);
  }, []);
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
    <div className={styles.container}>
      <div className={styles.header}>
        <a className={styles["btn-jump-out"]} href="/" target="_blank">
          <div
            style={{
              width: 25,
              height: 25,
              borderRadius: 4,
              overflow: "hidden",
            }}
          >
            <IconBuidlerLogo />
          </div>
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
      {children}
      <CopyRight />
      {!storeSignerId && openLogin && (
        <div className={styles["login__wrap"]} onClick={onWithoutLoginClick}>
          <LoginFC
            deepLink={signedKeyRequest?.deeplinkUrl}
            onWithoutLoginClick={onWithoutLoginClick}
          />
        </div>
      )}
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

export default memo(FCPluginWrapper);
