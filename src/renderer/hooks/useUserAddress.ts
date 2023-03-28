import { utils } from "ethers";
import { useMemo } from "react";
import useAppSelector from "./useAppSelector";

function useUserAddress() {
  const userData = useAppSelector((state) => state.user.userData);
  return useMemo(() => {
    if (!userData.user_id) return null;
    return utils.computeAddress(userData?.user_id);
  }, [userData.user_id]);
}

export default useUserAddress;
