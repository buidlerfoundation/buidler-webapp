import { useMemo } from "react";

function useIsInside() {
  return useMemo(
    () =>
      window.location.pathname.includes("/channels") ||
      window.location.pathname.includes("/url"),
    []
  );
}

export default useIsInside;
