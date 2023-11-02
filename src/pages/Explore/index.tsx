import React, { memo, useCallback, useMemo, useState } from "react";
import styles from "./index.module.scss";
import IconMenuExplore from "shared/SVG/FC/IconMenuExplore";
import { useNavigate } from "react-router-dom";
import { isUrlValid } from "helpers/LinkHelper";
import { insertHttpIfNeed } from "helpers/CastHelper";
// import ReviewCard from "shared/ReviewCard";
// import { useScreenshot } from "use-screenshot-hook";
// import api from "api";

const Explore = () => {
  const navigate = useNavigate();
  const [value, setValue] = useState("");
  // const screenshotRef = useRef<any>();
  // const { image, takeScreenshot } = useScreenshot({ ref: screenshotRef });
  // const [src, setSrc] = useState("");
  const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  }, []);
  const valueSubmit = useMemo(() => insertHttpIfNeed(value), [value]);
  const onSubmit = useCallback(
    (e: any) => {
      e.preventDefault();
      if (isUrlValid(valueSubmit)) {
        navigate(`${encodeURIComponent(valueSubmit)}`);
      } else {
        // error
      }
    },
    [navigate, valueSubmit]
  );
  // const onScreenShot = useCallback(() => {
  //   takeScreenshot("png");
  // }, [takeScreenshot]);
  // useEffect(() => {
  //   if (image) {
  //     fetch(image).then(async (res) => {
  //       const blob = await res.blob();
  //       const uploadRes = await api.upload(blob);
  //       if (uploadRes.data) {
  //         setSrc(uploadRes.data);
  //       }
  //     });
  //   }
  // }, [image]);
  return (
    <div className={styles.container}>
      <nav className={styles.head}>
        <div className={styles.search}>
          <form onSubmit={onSubmit}>
            <input className={styles.input} value={value} onChange={onChange} />
          </form>
          {!value && (
            <div className={styles.placeholder}>
              <IconMenuExplore size={18} fill="var(--color-mute-text)" />
              <span style={{ marginLeft: 10 }}>Enter any url</span>
            </div>
          )}
        </div>
      </nav>
      {/* <button onClick={onScreenShot}>Take screenshot</button>
      <div className={styles["screenshot-container"]}>
        <div ref={screenshotRef}>
          <ReviewCard
            url="https://buidler.app/"
            content="Have always been intrigued by the idea of social annotation tools, e.g. universal web comments, an example is https://web.hypothes.is/. Awesome to see someone building something like this using Farcaster - https://buidler.app/"
            rating={5}
          />
        </div>
      </div>
      {src && (
        <img
          src={src}
          style={{ width: 300, height: "auto" }}
          alt="test-screenshot"
        />
      )} */}
    </div>
  );
};

export default memo(Explore);
