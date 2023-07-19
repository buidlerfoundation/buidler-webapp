import { useMemo } from "react";
import useAppSelector from "./useAppSelector";

const useAutoOff = () => {
  const autoOff = useAppSelector((state) => state.outside.autoOff);
  return useMemo(() => autoOff, [autoOff]);
};

export default useAutoOff;
