import React, { memo } from "react";
import styles from "./index.module.scss";
import MainWrapper from "./Layout";
import { Route, Routes } from "react-router-dom";
import PageNotFound from "shared/PageNotFound";
import Started from "pages/Started";
import Home from "pages/Home";
import Panel from "pages/Panel";

const Main = () => {
  return (
    <div className={styles.container}>
      <Routes>
        <Route element={<MainWrapper />}>
          <Route
            path="/"
            element={<Home />}
          />
          <Route
            path="/channels/:community_id?/:channel_id?/:entity_type?/:entity_id?"
            element={<Home />}
          />
          <Route path="/panel/:community_id/:channel_id" element={<Panel />} />
        </Route>
        <Route path="/started" element={<Started />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </div>
  );
};

export default memo(Main);
