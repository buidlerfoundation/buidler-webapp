import React, { memo, useCallback, useState } from "react";
import styles from "./index.module.scss";
import { useNavigate } from "react-router-dom";
import IconMenuExplore from "shared/SVG/FC/IconMenuExplore";

const Analytic = () => {
  const navigate = useNavigate();
  const [value, setValue] = useState("");
  const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  }, []);
  const onSubmit = useCallback((e: any) => {
    e.preventDefault();
    // call api check user
  }, []);
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
              <span style={{ marginLeft: 10 }}>Search by username</span>
            </div>
          )}
        </div>
      </nav>
    </div>
  );
};

export default memo(Analytic);
