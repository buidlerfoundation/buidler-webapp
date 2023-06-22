import { useMemo } from "react";
import { Channel } from "models/Community";
import useSpaces from "./useSpaceChannel";

const useSpaceChannels = () => {
  const spaces = useSpaces();
  return useMemo(
    () =>
      spaces.reduce<Channel[]>((res, val) => {
        return [...res, ...(val.channels || [])];
      }, []),
    [spaces]
  );
};

export default useSpaceChannels;
