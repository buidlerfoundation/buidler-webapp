import React, { memo, useMemo } from "react";
import styles from "./index.module.scss";
import Spinner from "shared/Spinner";
import { Skeleton, Stack } from "@mui/material";
import SpaceItemLoading from "shared/SpaceItem/SpaceItemLoading";

interface ILoading {
  url: string;
}

const Loading = ({ url }: ILoading) => {
  const communityDisplayName = useMemo(() => {
    const parsed = new URL(url);
    return parsed.host;
  }, [url]);
  return (
    <div className={styles.loading}>
      <Stack width={275}>
        <Stack
          style={{
            borderRadius: 10,
            overflow: "hidden",
            backgroundColor: "var(--color-lighter-background)",
            margin: "0 10px",
          }}
        >
          <div
            style={{
              backgroundColor: "var(--color-stroke)",
              height: 72,
            }}
          />
          <Stack
            margin="20px 15px 75px 15px"
            direction="row"
            alignItems="center"
          >
            <div
              style={{
                width: 50,
                height: 50,
                borderRadius: 7.5,
                backgroundColor: "var(--color-stroke)",
              }}
            />
            <Stack marginLeft="15px">
              <span
                style={{ fontSize: 16, fontWeight: 600, lineHeight: "22px" }}
              >
                {communityDisplayName}
              </span>
              <Skeleton
                style={{ marginTop: 4, lineHeight: "22px", fontSize: 16 }}
                variant="text"
                width={90}
              />
            </Stack>
          </Stack>
        </Stack>
        <SpaceItemLoading />
      </Stack>
      <div
        style={{
          flex: 1,
          position: "relative",
          backgroundColor: "var(--color-lighter-background)",
          borderRadius: 10,
        }}
      >
        <Spinner />
      </div>
      <div
        style={{
          width: 390,
          height: "100%",
          borderRadius: 10,
          margin: "0 10px",
          backgroundColor: "var(--color-lighter-background)",
        }}
      />
    </div>
  );
};

export default memo(Loading);
