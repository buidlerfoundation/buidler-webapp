import { useMemo } from "react";
import useAppSelector from "./useAppSelector";

function useActiveTab() {
  const activeTab = useAppSelector((state) => state.message.chatBoxActiveTab);
  return useMemo(() => activeTab, [activeTab]);
}

export default useActiveTab;
