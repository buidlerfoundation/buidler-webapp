import React, { memo } from "react";
import styles from "./index.module.scss";
import MainWrapper from "./Layout";
import { Route, Routes } from "react-router-dom";
import PageNotFound from "shared/PageNotFound";
import Started from "pages/Started";
import Home from "pages/Home";
import Panel from "pages/Panel";
import Plugin from "pages/Plugin";
import HomeWrapper from "./Layout/HomeWrapper";
import MyCommunity from "pages/MyCommunity";
import OutsideWrapper from "./Layout/OutsideWrapper";
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

const Main = () => {
  return (
    <div className={styles.container}>
      <Routes>
        <Route element={<WebsiteWrapper />}>
          <Route path="/landing-page" element={<Website />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
        </Route>
        <Route element={<MainWrapper />}>
          <Route path="/communities" element={<MyCommunity />} />
          <Route element={<HomeWrapper />}>
            <Route path="/url/*" element={<Home />} />
            <Route
              path="/channels/:community_id?/:channel_id?/:entity_type?/:entity_id?"
              element={<Home />}
            />
          </Route>
          <Route element={<OutsideWrapper />}>
            <Route
              path="/panel/:community_id/:channel_id"
              element={<Panel />}
            />
            <Route
              path="/plugin/:community_id/:channel_id"
              element={<Plugin />}
            />
          </Route>
        </Route>
        <Route element={<FCWrapper />}>
          <Route path="/" element={<HomeFeed />} />
          <Route path="/explore" element={<Explore />} />
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
