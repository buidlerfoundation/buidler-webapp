import React, { memo } from "react";
import styles from "./index.module.scss";
import MainWrapper from "./Layout";
import { Route, Routes } from "react-router-dom";
import PageNotFound from "shared/PageNotFound";
import Started from "pages/Started";
import Home from "pages/Home";

const Main = () => {
  return (
    <div className={styles.container}>
      <Routes>
        <Route element={<MainWrapper />}>
          <Route
            path="/channels/:community_id?/:channel_id?/:entity_type?/:entity_id?"
            element={<Home />}
          />
        </Route>
        <Route path="/started" element={<Started />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </div>
  );
};

export default memo(Main);
