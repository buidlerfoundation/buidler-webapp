import React, { useEffect } from "react";
import { bindActionCreators } from "redux";
import { connect, useSelector } from "react-redux";
// import { Switch, Route, HashRouter, useHistory } from 'react-router-dom';
import { Route, Routes, useNavigate } from "react-router-dom";
import MainWrapper from "./Layout";
import Home from "../Home";
import { AsyncKey } from "../../common/AppConfig";
import { getCookie } from "../../common/Cookie";
import Splash from "../Splash";
import actions from "../../actions";
import AppTitleBar from "../../components/AppTitleBar";
import Started from "../Started";
import UnlockPrivateKey from "../UnlockPrivateKey";
import ModalOTP from "components/ModalOTP";

interface PrivateRouteProps {
  element: any;
}

const PrivateRoute = ({ element: Component }: PrivateRouteProps) => {
  const navigate = useNavigate();
  useEffect(() => {
    const res = getCookie(AsyncKey.accessTokenKey);
    if (!res) {
      navigate("/started", { replace: true });
    }
  }, [navigate]);
  return <Component />;
};

type MainProps = {
  getInitial?: () => () => void;
};

const Main = ({ getInitial }: MainProps) => {
  const imgDomain = useSelector((state: any) => state.user.imgDomain);
  useEffect(() => {
    if (!imgDomain) {
      getInitial?.();
    }
  }, [getInitial, imgDomain]);
  if (!imgDomain) {
    return <div className="main-load-page" />;
  }
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <AppTitleBar />
      <MainWrapper>
        <Routes>
          <Route path="/" element={<Splash />} />
          <Route path="/home" element={<PrivateRoute element={Home} />} />
          <Route
            path="/unlock"
            element={<PrivateRoute element={UnlockPrivateKey} />}
          />
          <Route path="/started" element={<Started />} />
        </Routes>
      </MainWrapper>
      <ModalOTP />
    </div>
  );
};
const mapActionsToProps = (dispatch: any) =>
  bindActionCreators(actions, dispatch);

export default connect(null, mapActionsToProps)(Main);
