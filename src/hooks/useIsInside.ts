import { useMemo } from "react";

function useIsInside() {
  return useMemo(() => window.location.pathname.includes("/channels"), []);
}

export default useIsInside;
