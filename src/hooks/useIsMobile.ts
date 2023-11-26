import { useMemo } from "react";

function useIsMobile(userId?: string) {
  return useMemo(() => {
    if (typeof navigator !== "undefined") {
      return /Android|iOS|Mobile/.test(navigator.userAgent);
    }
    return false;
  }, []);
}

export default useIsMobile;
