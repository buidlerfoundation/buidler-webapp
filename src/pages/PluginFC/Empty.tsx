import React, { memo, useCallback } from "react";
import styles from "./index.module.scss";
import useAppSelector from "hooks/useAppSelector";
import useAppDispatch from "hooks/useAppDispatch";
import { FC_CAST_ACTIONS } from "reducers/FCCastReducers";

const Empty = () => {
  const dispatch = useAppDispatch();
  const fcUser = useAppSelector((state) => state.fcUser.data);
  const onCreateCastClick = useCallback(() => {
    dispatch(FC_CAST_ACTIONS.toggleNewCast());
  }, [dispatch]);
  return (
    <div className={styles["empty-state"]}>
      <span>No cast has been created yet</span>
      {fcUser && (
        <div className={styles["btn-cast"]} onClick={onCreateCastClick}>
          New Cast
        </div>
      )}
    </div>
  );
};

export default memo(Empty);
