import { useMemo } from "react";
import useSpaceChannels from "./useSpaceChannels";

const useChannels = () => {
  const spaceChannels = useSpaceChannels();
  return useMemo(() => spaceChannels, [spaceChannels]);
};

export default useChannels;
