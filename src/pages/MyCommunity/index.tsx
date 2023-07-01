import React, { memo, useCallback } from "react";
import styles from "./index.module.scss";
import { Stack } from "@mui/material";
import useCommunities from "hooks/useCommunities";
import { Community } from "models/Community";
import CommunityItem from "shared/CommunityItem";

const MyCommunity = () => {
  const communities = useCommunities();
  const renderCommunityItem = useCallback((community: Community) => {
    return <CommunityItem key={community.community_id} community={community} />;
  }, []);
  return (
    <Stack className={styles.container}>
      <span className={styles.title}>Your community</span>
      {communities && communities?.length > 0 && (
        <Stack direction="row" flexWrap="wrap">
          {communities.map(renderCommunityItem)}
        </Stack>
      )}
    </Stack>
  );
};

export default memo(MyCommunity);
