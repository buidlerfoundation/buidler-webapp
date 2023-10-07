import React, { memo, useCallback } from "react";
import styles from "./index.module.scss";
import useAppSelector from "hooks/useAppSelector";
import useAppDispatch from "hooks/useAppDispatch";
import { FC_CAST_ACTIONS } from "reducers/FCCastReducers";
import EmbeddedMain from "shared/EmbeddedMain";
import IconPlus from "shared/SVG/IconPlus";

const Empty = () => {
  const dispatch = useAppDispatch();
  const fcUser = useAppSelector((state) => state.fcUser.data);
  const onCreateCastClick = useCallback(() => {
    dispatch(FC_CAST_ACTIONS.toggleNewCast());
  }, [dispatch]);
  return (
    <div className={styles["empty-state"]}>
      <EmbeddedMain />
      <div className={styles["empty-body"]}>
        <span>No discussion has been created yet.</span>
        {fcUser && (
          <div className={styles.actions}>
            <div className={styles["btn-cast"]} onClick={onCreateCastClick}>
              <IconPlus fill="white" style={{ marginRight: 10 }} />
              <span>New discussion</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(Empty);
