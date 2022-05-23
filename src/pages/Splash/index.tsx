import React, { useEffect, useCallback } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import actions from "../../actions";
import "./index.scss";
import { useNavigate } from "react-router-dom";
import { getCookie } from "../../common/Cookie";
import { AsyncKey } from "../../common/AppConfig";
import HomeLoading from "../../components/HomeLoading";

type SplashProps = {
  findUser?: () => any;
};

const Splash = ({ findUser }: SplashProps) => {
  const navigate = useNavigate();
  const initApp = useCallback(
    async (showLoading = true) => {
      await findUser?.();
      navigate("/home", { replace: true });
    },
    [findUser, navigate]
  );
  useEffect(() => {
    const res = getCookie(AsyncKey.accessTokenKey);
    if (!res) {
      navigate("/started", { replace: true });
    } else if (navigator.onLine) {
      initApp();
    }
  }, [navigate, initApp, findUser]);
  return <HomeLoading />;
};

const mapStateToProps = (state: any) => {
  return {};
};

const mapActionsToProps = (dispatch: any) =>
  bindActionCreators(actions, dispatch);

export default connect(mapStateToProps, mapActionsToProps)(Splash);
