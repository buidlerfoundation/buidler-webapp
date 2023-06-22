import React from "react";
import useAppSelector from "./useAppSelector";

function useETHPrice() {
  const walletBalance = useAppSelector((state) => state.user.walletBalance);

  return React.useMemo(
    () =>
      walletBalance?.coins?.find((el) => el.contract.name === "Ethereum")
        ?.price?.current_price,
    [walletBalance?.coins]
  );
}

export default useETHPrice;
