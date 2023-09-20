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

const PluginFC = () => {
  const dispatch = useAppDispatch();
  const [randomId, setRandomId] = useState(Math.random());
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
      }
      setCastQueue(null);
    },
    [fcUser?.username]
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
          dispatch(FC_USER_ACTIONS.updateSignerId(resPolling?.data?.signer_id));
          dispatch(getCurrentFCUser()).unwrap();
        }
      } catch (error: any) {
        toast.error(error.message);
        setSignedKeyRequest(null);
      }
      setPolling(false);
    }
  }, [dispatch]);
  const checkingSignerId = useCallback(async () => {
    if (signerId) {
      await setCookie(AsyncKey.signerIdKey, signerId);
      dispatch(FC_USER_ACTIONS.updateSignerId(signerId));
      dispatch(getCurrentFCUser());
    } else {
      requestSignerId();
    }
  }, [dispatch, requestSignerId, signerId]);
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
    if (fcUser?.username && castQueue) {
      castToFC(castQueue);
    }
  }, [castQueue, castToFC, fcUser?.username]);
  const onClosePlugin = useCallback(() => {
    window.top?.postMessage(
      { type: "b-fc-plugin-close" },
      { targetOrigin: "*" }
    );
  }, []);
  useEffect(() => {
    const messageListener = async (
      e: MessageEvent<{ type: string; payload: any; metadata?: any }>
    ) => {
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
    <div className={styles.container}>
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
