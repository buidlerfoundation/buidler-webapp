"use client";
import React, { memo, useCallback, useEffect } from "react";
import styles from "./index.module.scss";
import LogoBuidlerHorizontal from "shared/SVG/LogoBuidlerHorizontal";
import IconGoogle from "shared/SVG/IconGoogle";
import { useRouter } from "next/navigation";
import magic from "services/magic";

const Login = () => {
  const router = useRouter();
  const onBack = useCallback(() => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.replace("/home");
    }
  }, [router]);
  const finishSocialLogin = async () => {
    if (magic) {
      try {
        const result = await magic.oauth.getRedirectResult();
        console.log(result);
      } catch (err) {
        console.error(err);
      }
    }
  };
  const onSubmit = useCallback(async (e: any) => {
    e.preventDefault();
    const form = new FormData(e.target);
    const email = form.get("email")?.toString();
    console.log(email);
    if (magic && email) {
      try {
        const did = await magic.auth.loginWithEmailOTP({ email, showUI: true });
        console.log(`DID Token: ${did}`);

        const userInfo = await magic.user.getInfo();
        console.log(userInfo);

        // Handle user information as needed
      } catch {
        // Handle errors if required!
      }
    }
  }, []);
  const onLoginWithGoogle = useCallback(async () => {
    if (magic) {
      await magic.oauth.loginWithRedirect({
        provider: "google",
        redirectURI: window.location.href,
      });
    }
  }, []);
  useEffect(() => {
    finishSocialLogin();
  }, []);
  return (
    <div className={styles.container}>
      <div className={styles.body}>
        <div className={styles.logo}>
          <LogoBuidlerHorizontal style={{ width: "10rem", height: "auto" }} />
        </div>
        <span className={styles.title}>Login</span>
        <span className={styles.description}>Enter your email below</span>
        <form className={styles["form-input-email"]} onSubmit={onSubmit}>
          <input
            type="email"
            placeholder="hello@gmail.com"
            className={styles["input-email"]}
            name="email"
          />
          <button
            type="submit"
            className={styles["btn-submit"]}
            onSubmit={onSubmit}
          >
            Continue
          </button>
        </form>
        <div className={styles.separate}>
          <div className={styles.line} />
          <span>OR</span>
          <div className={styles.line} />
        </div>
        <div className={styles["btn-login-google"]} onClick={onLoginWithGoogle}>
          <IconGoogle />
          <span>Continue with Google</span>
        </div>
        <div className={styles["btn-back"]} onClick={onBack}>
          Continue without Login?
        </div>
      </div>
    </div>
  );
};

export default memo(Login);
