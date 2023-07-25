import React, { memo, useEffect, useMemo } from "react";
import styles from "./index.module.scss";
import GoogleAnalytics from "services/analytics/GoogleAnalytics";
import IconWeb3Auth from "shared/SVG/IconWeb3Auth";
import images from "common/images";
import { useAuth } from "providers/AuthProvider";
import { useWalletConnectClient } from "providers/WalletConnectProvider";
import { useLocation } from "react-router-dom";

const Started = () => {
  const location = useLocation();
  const auth = useAuth();
  const { isInitializing, client } = useWalletConnectClient();
  useEffect(() => {
    GoogleAnalytics.tracking("Login Started", { category: "Login" });
  }, []);
  const hideMetaMask = useMemo(() => {
    const userAgent = window.navigator.userAgent;
    return !/Chrome/.test(userAgent);
  }, []);
  useEffect(() => {
    if (location) {
      const query = new URLSearchParams(location.search);
      GoogleAnalytics.tracking("Page Viewed", {
        category: "Traffic",
        page_name: "Login",
        source: query.get("ref") || "",
        path: location.pathname,
        type: "web-app",
      });
    }
  }, [location]);
  return (
    <div className={styles.container}>
      <div className={styles.body}>
        <div className={styles["info-view"]}>
          <img className={styles.logo} alt="" src={images.icLogoSquare} />
          <span className={styles.title}>
            Release the on-chain superpower to buidl a trustless community
          </span>
          <span className={styles.description}>
            The web3 messaging platform offers wallet-to-wallet messaging,
            token-based membership, and on-chain verification.
          </span>
        </div>
        {!hideMetaMask && (
          <div
            className={`${styles["wallet-button"]} normal-button`}
            onClick={auth.loginWithMetaMask}
          >
            <span>MetaMask</span>
            <div className={styles["wallet-icon"]}>
              <img src={images.icMetamask} alt="" />
            </div>
          </div>
        )}
        {!isInitializing && client && (
          <div
            className={`${styles["wallet-button"]} normal-button`}
            onClick={auth.loginWithWalletConnect}
          >
            <span>WalletConnect</span>
            <div className={styles["wallet-icon"]}>
              <img src={images.icWalletConnect} alt="" />
            </div>
          </div>
        )}
        <div
          className={`${styles["wallet-button"]} normal-button`}
          onClick={auth.loginWithWeb3Auth}
        >
          <span>SocialConnect</span>
          <div className={styles["wallet-icon"]}>
            <IconWeb3Auth />
          </div>
        </div>
      </div>
      <div className={styles["promise-container"]}>
        <span>
          By connecting wallet, you agree to our{" "}
          <a href="https://buidler.app/terms" target="_blank" rel="noreferrer">
            Terms
          </a>{" "}
          and{" "}
          <a
            href="https://buidler.app/privacy"
            target="_blank"
            rel="noreferrer"
          >
            Privacy Policy
          </a>
          .
        </span>
      </div>
    </div>
  );
};

export default memo(Started);
