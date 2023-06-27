import { useMemo } from "react";
import useAppSelector from "./useAppSelector";

function usePluginOpen() {
  const pluginOpen = useAppSelector((state) => state.outside.pluginOpen);
  return useMemo(() => pluginOpen, [pluginOpen]);
}

export default usePluginOpen;
