import { utils } from "ethers";
import { useMemo } from "react";
import useAppSelector from "./useAppSelector";

function useUserAddress() {
  const userData = useAppSelector((state) => state.user.userData);
  return useMemo(() => {
    if (!userData.public_key) return '';
    return utils.computeAddress(userData?.public_key);
  }, [userData.public_key]);
}

export default useUserAddress;
