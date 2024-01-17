import React, { memo } from "react";
import styles from "./index.module.scss";
import IconPlus from "shared/SVG/IconPlus";
import IconMenuReport from "shared/SVG/IconMenuReport";

interface IExploreEmpty {
  onAddNote: () => void;
  onAddReport: () => void;
}

const ExploreEmpty = ({ onAddNote, onAddReport }: IExploreEmpty) => {
  return (
    <>
      <span className={styles["empty-description"]}>
        No community notes found for this link. If you think more context is
        needed, please help us:
      </span>
      <div className={styles["btn-empty"]} onClick={onAddNote}>
        <IconPlus
          size={20}
          fill="var(--color-mute-text)"
          style={{ padding: 3 }}
        />
        Add your note
      </div>
      <div className={styles["btn-empty"]} onClick={onAddReport}>
        <IconMenuReport />
        Report this link
      </div>
    </>
  );
};

export default memo(ExploreEmpty);
