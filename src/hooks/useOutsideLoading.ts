import { useMemo } from "react";
import useAppSelector from "./useAppSelector";

function useOutsideLoading() {
  const outsideLoading = useAppSelector((state) => state.outside.loading);
  return useMemo(() => outsideLoading, [outsideLoading]);
}

export default useOutsideLoading;
