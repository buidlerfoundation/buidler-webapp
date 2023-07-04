import React, { memo, useCallback, useEffect } from "react";
import styles from "./index.module.scss";
import { Stack } from "@mui/material";
import useCommunities from "hooks/useCommunities";
import { Community } from "models/Community";
import CommunityItem from "shared/CommunityItem";
import useAppDispatch from "hooks/useAppDispatch";
import { getCommunities, pinCommunity } from "reducers/UserActions";
import { useNavigate } from "react-router-dom";
import api from "api";

const MyCommunity = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const communities = useCommunities();
  const onClick = useCallback(
    (community: Community) => {
      api.pinCommunity(community.community_id);
      dispatch(pinCommunity(community));
      navigate(`/channels/${community.community_id}`, { replace: true });
    },
    [dispatch, navigate]
  );
  const renderCommunityItem = useCallback(
    (community: Community) => {
      return (
        <CommunityItem
          key={community.community_id}
          community={community}
          onClick={onClick}
        />
      );
    },
    [onClick]
  );
  useEffect(() => {
    dispatch(getCommunities());
  }, [dispatch]);
  return (
    <Stack className={styles.container}>
      <span className={styles.title}>Community</span>
      {communities && communities?.length > 0 && (
        <Stack direction="row" flexWrap="wrap">
          {communities.map(renderCommunityItem)}
        </Stack>
      )}
    </Stack>
  );
};

export default memo(MyCommunity);
