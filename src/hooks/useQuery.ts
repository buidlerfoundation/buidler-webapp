import { useSearchParams } from "next/navigation";
import React from "react";

function useQuery() {
  const search = useSearchParams();

  return React.useMemo(() => search, [search]);
}

export default useQuery;
