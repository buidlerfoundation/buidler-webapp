import React, { memo } from "react";
import styles from "./index.module.scss";
import MainWrapper from "./Layout";
import { Navigate, Route, Routes } from "react-router-dom";
import PageNotFound from "shared/PageNotFound";
import Started from "pages/Started";
import Home from "pages/Home";
import Panel from "pages/Panel";
import Plugin from "pages/Plugin";
import HomeWrapper from "./Layout/HomeWrapper";
import MyCommunity from "pages/MyCommunity";
import OutsideWrapper from "./Layout/OutsideWrapper";

const Main = () => {
  return (
    <div className={styles.container}>
      <Routes>
        <Route element={<MainWrapper />}>
          <Route path="/" element={<Navigate to="/communities" replace />} />
          <Route path="/communities" element={<MyCommunity />} />
          <Route element={<HomeWrapper />}>
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
        <Route path="/started" element={<Started />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </div>
  );
};

export default memo(Main);
