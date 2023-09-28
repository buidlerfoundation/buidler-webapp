import api from "api";
import { AsyncKey } from "common/AppConfig";
import { setCookie } from "common/Cookie";
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
import IconJumpOut from "shared/SVG/IconJumpOut";
import LogoFC from "shared/SVG/LogoFC";
import LoginFC from "shared/LoginFC";
import { FC_CAST_ACTIONS, getCastsByUrl } from "reducers/FCCastReducers";

const FCWrapper = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
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
  const signerId = useMemo(() => query.get("signer_id"), [query]);
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
  useEffect(() => {
    if (q) {
      dispatch(FC_CAST_ACTIONS.updateQueryUrl(q));
    }
  }, [dispatch, q]);
  useEffect(() => {
    if (queryUrl) {
      dispatch(getCastsByUrl({ text: queryUrl, page: 1, limit: 20 }));
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
        // reload
      }
      if (e?.data?.type === "tw-cast") {
        castToFC(e.data.payload);
      }
      if (e?.data?.type === "tw-cast-queue") {
        setCastQueue(e.data.payload);
      }
      if (e?.data?.type === "b-fc-update-tw-url") {
        dispatch(FC_CAST_ACTIONS.updateQueryUrl(e?.data?.payload || ""));
        if (castHash) {
          navigate(-1);
        }
      }
    };
    window.addEventListener("message", messageListener);
    return () => {
      window.removeEventListener("message", messageListener);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [castHash, castToFC, dispatch]);
  const onWithoutLoginClick = useCallback(() => {
    pollingController.current.abort();
    setSignedKeyRequest(null);
  }, []);
  const onLoginClick = useCallback(() => {
    if (signedKeyRequest) return;
    requestSignerId();
  }, [requestSignerId, signedKeyRequest]);
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
          <div className={styles["btn-login"]} onClick={onLoginClick}>
            <span>Login</span>
          </div>
        )}
      </div>
      <Outlet />
      {!storeSignerId && signedKeyRequest?.deeplinkUrl && (
        <div className={styles["login__wrap"]}>
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
