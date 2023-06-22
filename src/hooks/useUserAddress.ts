import { useMemo } from "react";
import useUser from "./useUser";

function useUserAddress() {
  const userData = useUser()
  return useMemo(() => {
    return userData?.user_addresses?.[0]?.address || ''
  }, [userData?.user_addresses]);
}

export default useUserAddress;
