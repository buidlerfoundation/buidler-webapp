import React, { useEffect } from "react";
import useAppSelector from "renderer/hooks/useAppSelector";
import { Switch, Route, useHistory } from "react-router-dom";
import AppListener from "renderer/components/AppListener";
import { findUser, getInitial } from "renderer/actions/UserActions";
import MainWrapper from "./Layout";
import Home from "../Home";
import { AsyncKey } from "../../common/AppConfig";
import { getCookie } from "../../common/Cookie";
import AppTitleBar from "../../components/AppTitleBar";
import Started from "../Started";
import useAppDispatch from "renderer/hooks/useAppDispatch";
import { useState } from "react";
import { useCallback } from "react";

interface PrivateRouteProps {
  component: any;
  exact: boolean;
  path: string;
}

const PrivateRoute = ({ component: Component, ...rest }: PrivateRouteProps) => {
  const userData = useAppSelector((state) => state.user.userData);
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(true);
  const history = useHistory();
  const initApp = useCallback(async () => {
    if (!userData.user_id) {
      await dispatch(findUser());
    }
    setLoading(false);
  }, [dispatch, userData?.user_id]);
  useEffect(() => {
    getCookie(AsyncKey.accessTokenKey)
      .then((res: any) => {
        if (!res) {
          history.replace("/started");
        } else {
          initApp();
        }
      })
      .catch(() => {
        history.replace("/started");
      });
  }, [history, initApp]);
  if (loading) return <div className="main-load-page" />;
  return <Route {...rest} render={(props) => <Component {...props} />} />;
};

const Main = () => {
  const imgDomain = useAppSelector((state) => state.user.imgDomain);
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(getInitial?.());
  }, [dispatch]);
  if (!imgDomain) {
    return <div className="main-load-page" />;
  }
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <AppTitleBar />
      <AppListener />
      <MainWrapper>
        <Switch>
          <PrivateRoute exact path="/" component={Home} />
          <Route exact path="/started" component={Started} />
        </Switch>
      </MainWrapper>
    </div>
  );
};
export default Main;
