import { useMemo } from "react";
import useAppSelector from "./useAppSelector";

function useOutsideUrlType() {
  const outsideUrlType = useAppSelector((state) => state.outside.urlType);
  return useMemo(() => outsideUrlType, [outsideUrlType]);
}

export default useOutsideUrlType;
