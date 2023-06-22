import { useMemo } from "react";
import useGlobalChannels from "./useGlobalChannels";
import useSpaceChannels from "./useSpaceChannels";

const useChannels = () => {
  const globalChannels = useGlobalChannels();
  const spaceChannels = useSpaceChannels();
  return useMemo(
    () => [...spaceChannels, ...globalChannels],
    [globalChannels, spaceChannels]
  );
};

export default useChannels;
