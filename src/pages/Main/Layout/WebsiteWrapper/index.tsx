import React, { memo, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import GoogleAnalytics from "services/analytics/GoogleAnalytics";

const WebsiteWrapper = () => {
  const location = useLocation();
  useEffect(() => {
    GoogleAnalytics.init();
  }, []);
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    GoogleAnalytics.tracking("Page Viewed", {
      category: "Traffic",
      page_name: "Home",
      source: query.get("ref") || "",
      path: location.pathname,
    });
  }, [location.pathname]);
  return <Outlet />;
};

export default memo(WebsiteWrapper);
