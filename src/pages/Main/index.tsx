import React, { memo } from "react";
import styles from "./index.module.scss";
import { Route, Routes } from "react-router-dom";
import PageNotFound from "shared/PageNotFound";
import Started from "pages/Started";
import ErrorPluginPage from "shared/ErrorBoundary/ErrorPluginPage";
import ShortShare from "pages/ShortShare";
import Website from "pages/Website";
import Terms from "pages/Website/Terms";
import Privacy from "pages/Website/Privacy";
import WebsiteWrapper from "./Layout/WebsiteWrapper";
import PluginFC from "pages/PluginFC";
import FCDetail from "pages/FCDetail";
import FCPluginWrapper from "./Layout/FCPluginWrapper";
import FCWrapper from "./Layout/FCWrapper";
import HomeFeed from "pages/HomeFeed";
import Explore from "pages/Explore";
import HomeFeedDetail from "pages/HomeFeedDetail";
import FeedByUrl from "pages/FeedByUrl";
import HomeFeedWrapper from "./Layout/HomeFeedWrapper";
import useFeedFilters from "hooks/useFeedFilters";
import Community from "pages/Community";
import UserAnalytic from "pages/UserAnalytic";

const Main = () => {
  const filters = useFeedFilters();
  return (
    <div className={styles.container}>
      <Routes>
        <Route element={<WebsiteWrapper />}>
          <Route path="/" element={<Website />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
        </Route>
        <Route element={<FCWrapper />}>
          <Route element={<HomeFeedWrapper />}>
            {filters.map((el) => (
              <Route
                key={el.path}
                path={el.path}
                element={<HomeFeed filter={el.value} />}
              />
            ))}
          </Route>
          <Route path="/analytic/:username" element={<UserAnalytic />} />
          <Route path="/community" element={<Community />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/explore/:url" element={<FeedByUrl />} />
          <Route path="/:fc_username/:hash" element={<HomeFeedDetail />} />
        </Route>
        <Route element={<FCPluginWrapper />}>
          <Route path="/plugin-fc" element={<PluginFC />} />
          <Route path="/plugin-fc/:cast_hash" element={<FCDetail />} />
        </Route>
        <Route path="/started" element={<Started />} />
        <Route path="/plugin/*" element={<ErrorPluginPage />} />
        <Route path="/:share_id" element={<ShortShare />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </div>
  );
};

export default memo(Main);
