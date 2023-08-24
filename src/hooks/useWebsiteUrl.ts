import { isUrlValid } from "helpers/LinkHelper";
import React from "react";
import { useLocation } from "react-router-dom";

function useWebsiteUrl() {
  const location = useLocation();
  return React.useMemo(() => {
    if (location.pathname.includes("/url/")) {
      const websiteUrl = window.location.href
        .split("/url/")?.[1]
        ?.split("?ott=")?.[0];
      if (isUrlValid(websiteUrl)) {
        return websiteUrl;
      }
    }
    return "";
  }, [location.pathname]);
}

export default useWebsiteUrl;
