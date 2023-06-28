import { useMemo } from "react";

function useIsPanel() {
  return useMemo(() => window.location.pathname.includes("/panel"), []);
}

export default useIsPanel;