import { utils } from "ethers";
import { useMemo } from "react";
import useUser from "./useUser";

function useUserAddress() {
  const userData = useUser()
  return useMemo(() => {
    if (!userData.public_key) return '';
    return utils.computeAddress(userData?.public_key);
  }, [userData.public_key]);
}

export default useUserAddress;
