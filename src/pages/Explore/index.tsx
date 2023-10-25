import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import styles from "./index.module.scss";
import IconMenuExplore from "shared/SVG/FC/IconMenuExplore";
import { useNavigate } from "react-router-dom";
import { isUrlValid } from "helpers/LinkHelper";
import { insertHttpIfNeed } from "helpers/CastHelper";
import { useScreenshot } from "use-screenshot-hook";

const Explore = () => {
  const navigate = useNavigate();
  const screenshotRef = useRef<any>();
  const [value, setValue] = useState("");
  const { image, takeScreenshot } = useScreenshot({ ref: screenshotRef });
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
  const onScreenShot = useCallback(() => {
    takeScreenshot();
  }, [takeScreenshot]);
  useEffect(() => {
    if (image) {
      console.log(image);
      fetch(image).then(async (res) => {
        const blob = await res.blob();
        console.log(blob);
      });
    }
  }, [image]);
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
      <button onClick={onScreenShot}>Take screenshot</button>
      <div className={styles["screenshot-container"]}>
        <div className={styles["screenshot-wrap"]} ref={screenshotRef}>
          <div className={styles.screenshot}>Hello world</div>
        </div>
      </div>
      {image && (
        <img
          src={image}
          style={{ width: 300, height: "auto" }}
          alt="test-screenshot"
        />
      )}
    </div>
  );
};

export default memo(Explore);
