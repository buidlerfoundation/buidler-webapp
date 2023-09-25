import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import styles from "./index.module.scss";
import IconJumpOut from "shared/SVG/IconJumpOut";
import LogoFC from "shared/SVG/LogoFC";
import LogoBuidlerHorizontal from "shared/SVG/LogoBuidlerHorizontal";
import LoginFC from "shared/LoginFC";
import { useParams } from "react-router-dom";
import useAppDispatch from "hooks/useAppDispatch";
import { FC_USER_ACTIONS, getCurrentFCUser } from "reducers/FCUserReducers";
import api from "api";
import { ISignedKeyRequest } from "models/FC";
import { setCookie } from "common/Cookie";
import { AsyncKey } from "common/AppConfig";
import { toast } from "react-hot-toast";
import useAppSelector from "hooks/useAppSelector";
import { extractContentMessage } from "helpers/MessageHelper";
import useQuery from "hooks/useQuery";

const PluginFC = () => {
  const dispatch = useAppDispatch();
  const [randomId, setRandomId] = useState(Math.random());
  const [theme, setTheme] = useState("");
  const query = useQuery();
  const initialTheme = useMemo(() => query.get("theme"), [query]);
  const [loading, setLoading] = useState(false);
  const [polling, setPolling] = useState(false);
  const [castQueue, setCastQueue] = useState<any>(null);
  const [signedKeyRequest, setSignedKeyRequest] = useState<
    ISignedKeyRequest | undefined | null
  >(null);
  const storeSignerId = useAppSelector((state) => state.fcUser.signer_id);
  const fcUser = useAppSelector((state) => state.fcUser.data);
  const params = useParams<{
    signer_id?: string;
  }>();
  const signerId = useMemo(() => params?.signer_id, [params?.signer_id]);
  const logout = useCallback(() => {
    // clearData();
    // dispatch(logoutAction());
    // navigate("/plugin-fc", { replace: true });
  }, []);
  const castToFC = useCallback(
    async (payload: any) => {
      payload.text = extractContentMessage(payload.text);
      const res = await api.cast(payload);
      if (res.success) {
        setRandomId(Math.random());
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
      } else {
        logout();
      }
      setCastQueue(null);
    },
    [fcUser?.username, logout]
  );
  const requestSignerId = useCallback(async () => {
    setLoading(true);
    const res = await api.requestSignedKey();
    setLoading(false);
    if (res.data?.token) {
      setSignedKeyRequest(res.data);
      setPolling(true);
      try {
        const resPolling = await api.pollingSignedKey(res.data?.token);
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
  const checkingSignerId = useCallback(async () => {
    if (signerId) {
      await setCookie(AsyncKey.signerIdKey, signerId);
      const fcUser = await dispatch(getCurrentFCUser()).unwrap();
      if (fcUser) {
        dispatch(FC_USER_ACTIONS.updateSignerId(signerId));
      } else {
        logout();
      }
    } else {
      requestSignerId();
    }
  }, [dispatch, logout, requestSignerId, signerId]);
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
  const onClosePlugin = useCallback(() => {
    window.top?.postMessage(
      { type: "b-fc-plugin-close" },
      { targetOrigin: "*" }
    );
  }, []);
  useEffect(() => {
    if (initialTheme) {
      setTheme(initialTheme);
    }
  }, [initialTheme]);
  useEffect(() => {
    const messageListener = async (
      e: MessageEvent<{ type: string; payload: any; metadata?: any }>
    ) => {
      if (e?.data?.type === "b-fc-update-tw-theme") {
        setTheme(e.data.payload);
      }
      if (e?.data?.type === "b-fc-reload-iframe") {
        setRandomId(Math.random());
      }
      if (e?.data?.type === "tw-cast") {
        castToFC(e.data.payload);
      }
      if (e?.data?.type === "tw-cast-queue") {
        setCastQueue(e.data.payload);
      }
    };
    window.addEventListener("message", messageListener);
    return () => {
      window.removeEventListener("message", messageListener);
    };
  }, [castToFC]);
  return (
    <div
      className={`buidler-plugin-theme-${theme || "light"} ${styles.container}`}
    >
      <div className={styles.header}>
        <div className={styles["btn-jump-out"]} onClick={onClosePlugin}>
          <IconJumpOut />
          <span style={{ margin: "0 10px" }}>Farcaster</span>
          <LogoFC />
        </div>
        {fcUser ? (
          <div className={styles["user-info"]}>
            <span>{fcUser.display_name}</span>
            {fcUser.pfp?.url && (
              <img
                src={fcUser.pfp?.url}
                alt="fc-user-avatar"
                className={styles.avatar}
              />
            )}
          </div>
        ) : (
          <div className={styles["copy-right"]}>
            <span style={{ marginRight: 10 }}>Powered by</span>
            <LogoBuidlerHorizontal />
          </div>
        )}
      </div>
      {!storeSignerId && signedKeyRequest?.deeplinkUrl && (
        <LoginFC deepLink={signedKeyRequest.deeplinkUrl} />
      )}
      {fcUser?.username && (
        <iframe
          className={styles.iframe}
          title="fc-iframe"
          src={`https://warpcast.com/${fcUser.username}`}
          key={randomId}
        />
      )}
    </div>
  );
};

export default memo(PluginFC);
