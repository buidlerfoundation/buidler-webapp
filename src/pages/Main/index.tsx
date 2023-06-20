import React, { memo } from "react";
import styles from "./index.module.scss";
import MainWrapper from "./Layout";
import { Route, Switch } from "react-router-dom";
import PageNotFound from "shared/PageNotFound";
import Started from "pages/Started";
import Home from "pages/Home";

const Main = () => {
  return (
    <div className={styles.container}>
      <MainWrapper>
        <Switch>
          <Route exact path="/" component={Home} />
          <Route
            exact
            path="/channels/:community_id?/:channel_id?/:entity_type?/:entity_id?"
            component={Home}
          />
          <Route exact path="/started" component={Started} />
          <Route exact path="*" component={PageNotFound} />
        </Switch>
      </MainWrapper>
    </div>
  );
};

export default memo(Main);
