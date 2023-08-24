import { useMemo } from "react";

function useIsMobile(userId?: string) {
  return useMemo(() => /Android|iOS|Mobile/.test(navigator.userAgent), []);
}

export default useIsMobile;
