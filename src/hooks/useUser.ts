import { useMemo } from "react";
import useAppSelector from "./useAppSelector";

function useUser() {
  const user = useAppSelector((state) => state.user.data);
  return useMemo(() => user, [user]);
}

export default useUser;
