import { useMemo } from "react";

function useIsPlugin() {
  return useMemo(() => window.location.pathname.includes("/plugin"), []);
}

export default useIsPlugin;
