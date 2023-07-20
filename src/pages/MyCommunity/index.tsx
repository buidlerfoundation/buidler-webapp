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
import usePinnedCommunities from "hooks/usePinnedCommunities";
import { getLastChannelIdByCommunityId } from "common/Cookie";

const MyCommunity = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const communities = useCommunities();
  const pinnedCommunities = usePinnedCommunities();
  const onClick = useCallback(
    async (community: Community) => {
      if (
        !pinnedCommunities?.find(
          (el) => el.community_id === community.community_id
        )
      ) {
        api.pinCommunity(community.community_id);
        dispatch(pinCommunity(community));
      }
      const lastChannelIdByCommunityId = await getLastChannelIdByCommunityId(
        community.community_id
      );
      navigate(
        `/channels/${community.community_id}/${
          lastChannelIdByCommunityId || ""
        }`,
        { replace: true }
      );
    },
    [dispatch, navigate, pinnedCommunities]
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
