"use client";

import api from "api";
import { AsyncKey, signTypeDataLinkFC } from "common/AppConfig";
import { clearData, getCookie, removeCookie, setCookie } from "common/Cookie";
import useAppDispatch from "hooks/useAppDispatch";
import useAppSelector from "hooks/useAppSelector";
import useQuery from "hooks/useQuery";
import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { getCurrentFCUser } from "reducers/FCUserReducers";
import styles from "./index.module.scss";
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
import { useParams, usePathname, useRouter } from "next/navigation";
import GoogleAnalytics from "services/analytics/GoogleAnalytics";
import { getNotesByUrl, submitNote } from "reducers/CommunityNoteReducers";
import { IDataToken } from "models/User";
import { useMagic } from "providers/MagicProvider";

interface IFCPluginWrapper {
  children: React.ReactNode;
}

const FCPluginWrapper = ({ children }: IFCPluginWrapper) => {
  const dispatch = useAppDispatch();
  const { magicProvider } = useMagic();
  const router = useRouter();
  const pathname = usePathname();
  const popupMenuRef = useRef<any>();
  const [theme, setTheme] = useState("");
  const query = useQuery();
  const params = useParams<{ cast_hash: string }>();
  const castHash = useMemo(() => params?.cast_hash, [params?.cast_hash]);
  const initialTheme = useMemo(() => query?.get("theme"), [query]);
  const q = useMemo(() => query?.get("q"), [query]);
  const [castQueue, setCastQueue] = useState<any>(null);
  const queryUrl = useAppSelector((state) => state.fcCast.queryUrl);
  const fcUser = useAppSelector((state) => state.fcUser?.data);
  const replyCast = useAppSelector((state) => state.fcCast.replyCast);
  const openNewCast = useAppSelector((state) => state.fcCast.openNewCast);
  const isCommunityNote = useMemo(
    () => pathname.includes("/community-note"),
    [pathname]
  );
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
  const createNote = useCallback(
    async (payload: any) => {
      payload.summary = extractContentMessage(payload.summary);
      dispatch(submitNote(payload));
    },
    [dispatch]
  );
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
          await removeCookie(AsyncKey.requestTokenKey);
          await dispatch(getCurrentFCUser());
        }
      }
    },
    [dispatch, magicProvider]
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
  const checkingAuth = useCallback(async () => {
    await handleRefresh();
    const reqToken = await getCookie(AsyncKey.requestTokenKey);
    const accessToken = await getCookie(AsyncKey.accessTokenKey);
    if (accessToken) {
      if (reqToken) {
        const res = await api.checkRequestToken(reqToken);
        if (res.data?.state === "completed" && res.data?.signer_id) {
          await setCookie(AsyncKey.signerIdKey, res?.data?.signer_id);
          await linkWithFCAccount(res.data?.signer_id, accessToken);
        }
      } else {
        await dispatch(getCurrentFCUser()).unwrap();
      }
    }
  }, [dispatch, handleRefresh, linkWithFCAccount]);
  const onCloseModalReply = useCallback(() => {
    dispatch(FC_CAST_ACTIONS.updateReplyCast());
  }, [dispatch]);
  const onLoginClick = useCallback(async () => {
    window.top?.postMessage({ type: "b-fc-open-login" }, { targetOrigin: "*" });
  }, []);
  const onMenuClick = useCallback(
    async (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      e.stopPropagation();
      const target = e.currentTarget;
      popupMenuRef.current.show(target);
    },
    []
  );
  const renderUser = useCallback(() => {
    if (fcUser) {
      return (
        <div className={styles["user-info"]} onClick={onMenuClick}>
          {fcUser.pfp?.url && (
            <ImageView
              src={fcUser.pfp?.url}
              alt="fc-user-avatar"
              className={styles.avatar}
            />
          )}
        </div>
      );
    }
    return (
      <div
        id="btn-login"
        className={styles["btn-login"]}
        onClick={onLoginClick}
      >
        <span>Login</span>
      </div>
    );
  }, [fcUser, onLoginClick, onMenuClick]);
  useEffect(() => {
    if (fcUser) {
      GoogleAnalytics.identify(fcUser);
    }
  }, [fcUser]);
  useEffect(() => {
    if (q) {
      dispatch(FC_CAST_ACTIONS.updateQueryUrl(q));
    }
  }, [dispatch, q]);
  useEffect(() => {
    if (queryUrl) {
      dispatch(getCastsByUrl({ text: queryUrl, page: 1, limit: 20 }));
      dispatch(getMainMetadata(queryUrl));
      dispatch(getNotesByUrl({ url: queryUrl, page: 1, limit: 20 }));
    }
  }, [dispatch, queryUrl]);
  useEffect(() => {
    if (fcUser?.fid) {
      window.top?.postMessage(
        { type: "b-fc-plugin-logged", user: JSON.stringify(fcUser) },
        { targetOrigin: "*" }
      );
    }
  }, [fcUser]);
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
        if (e.data.payload?.classification) {
          createNote(e.data.payload);
        } else {
          castToFC(e.data.payload);
        }
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
        const { signerId, accessToken, refreshToken, q, theme, title, uniqId } =
          e?.data?.payload || {};
        if (uniqId && !signerId) {
          GoogleAnalytics.identifyByExtensionId(uniqId);
        }
        if (signerId) {
          await setCookie(AsyncKey.signerIdKey, signerId);
        }
        if (accessToken) {
          await setCookie(AsyncKey.accessTokenKey, accessToken);
        }
        if (refreshToken) {
          await setCookie(AsyncKey.refreshTokenKey, refreshToken);
        }
        checkingAuth();
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
    onLoginClick,
    createNote,
    router,
    checkingAuth,
  ]);
  useEffect(() => {
    if (theme) {
      document.getElementsByTagName("html")?.[0]?.setAttribute("class", theme);
      setTheme(theme);
    }
  }, [theme]);
  useEffect(() => {
    if (openNewCast && !fcUser) {
      onLoginClick();
    }
  }, [fcUser, onLoginClick, openNewCast]);
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
        {renderUser()}
      </div>
      {children}
      {!isCommunityNote && <CopyRight />}
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
