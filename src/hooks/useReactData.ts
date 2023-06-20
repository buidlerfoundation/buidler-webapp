import { useMemo } from "react";
import useAppSelector from "./useAppSelector";

function useReacts(messageId: string) {
  const reactData = useAppSelector((state) => state.react.reactData);
  return useMemo(() => reactData?.[messageId] || [], [messageId, reactData]);
}

export default useReacts;
