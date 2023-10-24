import React, { memo, useCallback, useMemo, useState } from "react";
import styles from "./index.module.scss";
import IconMenuExplore from "shared/SVG/FC/IconMenuExplore";
import { useNavigate } from "react-router-dom";
import { isUrlValid } from "helpers/LinkHelper";
import { insertHttpIfNeed } from "helpers/CastHelper";

const Explore = () => {
  const navigate = useNavigate();
  const [value, setValue] = useState("");
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
    </div>
  );
};

export default memo(Explore);
