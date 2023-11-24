import React, { memo, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import GoogleAnalytics from "services/analytics/GoogleAnalytics";

const WebsiteWrapper = () => {
  const location = useLocation();
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    GoogleAnalytics.tracking("Page Viewed", {
      category: "Traffic",
      page_name: "Landing Page",
      source: query.get("ref") || "",
      path: location.pathname,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);
  return (
    <>
      <Outlet />
    </>
  );
};

export default memo(WebsiteWrapper);
