import React, { memo, useEffect, useMemo } from "react";
import useAppSelector from "renderer/hooks/useAppSelector";
import { Switch, Route, useHistory, useRouteMatch } from "react-router-dom";
import {
  findTeamAndChannel,
  findUser,
  getInitial,
  logout,
  setCurrentTeam,
} from "renderer/actions/UserActions";
import MainWrapper from "./Layout";
import Home from "../Home";
import { AsyncKey, LoginType } from "../../common/AppConfig";
import { getCookie, removeCookie, setCookie } from "../../common/Cookie";
import Started from "../Started";
import useAppDispatch from "renderer/hooks/useAppDispatch";
import { useState } from "react";
import { useCallback } from "react";
import UnSupportedNetwork from "renderer/components/UnSupportedNetwork";
import ChainId from "renderer/services/connectors/ChainId";
import EmptyTeamView from "renderer/components/EmptyTeamView";
import useQuery from "renderer/hooks/useQuery";
import actionTypes from "renderer/actions/ActionTypes";
import api from "renderer/api";
import toast from "react-hot-toast";
import {
  createErrorMessageSelector,
  createLoadingSelector,
} from "renderer/reducers/selectors";
import AppTitleBar from "renderer/shared/AppTitleBar";
import GoogleAnalytics from "renderer/services/analytics/GoogleAnalytics";
import { utils } from "ethers";
import SwitchAccountMetaMask from "renderer/components/SwitchAccountMetaMask";
import useCurrentCommunity from "renderer/hooks/useCurrentCommunity";
import PageNotFound from "renderer/shared/PageNotFound";
import ErrorPage from "renderer/shared/ErrorBoundary/ErrorPage";
import UnSupportPage from "../UnSupportPage";
import NoInternetPage from "renderer/shared/NoInternetPage";

const PublicRoute = ({ component: Component, ...rest }: any) => {
  const history = useHistory();
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    GoogleAnalytics.tracking("Page Viewed", {
      category: "Traffic",
      page_name: "Login",
      source: query.get("ref") || "",
      path: window.location.pathname,
    });
  }, []);
  useEffect(() => {
    getCookie(AsyncKey.accessTokenKey)
      .then((res: any) => {
        if (res) {
          history.replace("/");
        }
      })
      .catch(() => {
        history.replace("/started");
      });
  }, [history]);
  return <Route {...rest} render={(props) => <Component {...props} />} />;
};

const errorUserSelector = createErrorMessageSelector([actionTypes.USER_PREFIX]);
const currentTeamLoadingSelector = createLoadingSelector([
  actionTypes.CURRENT_TEAM_PREFIX,
]);
const currentTeamErrorSelector = createErrorMessageSelector([
  actionTypes.CURRENT_TEAM_PREFIX,
]);

const PrivateRoute = ({ component: Component, ...rest }: any) => {
  const query = useQuery();
  const match_community_id = useMemo(
    () => rest?.computedMatch?.params?.match_community_id,
    [rest?.computedMatch?.params?.match_community_id]
  );
  const match_channel_id = useMemo(
    () => rest?.computedMatch?.params?.match_channel_id,
    [rest?.computedMatch?.params?.match_channel_id]
  );
  const invitationId = useMemo(() => query.get("invitation"), [query]);
  const invitationRef = useMemo(() => query.get("ref"), [query]);
  const ott = useMemo(() => query.get("ott"), [query]);
  const userData = useAppSelector((state) => state.user.userData);
  const userError = useAppSelector((state) => errorUserSelector(state));
  const currentTeamLoading = useAppSelector((state) =>
    currentTeamLoadingSelector(state)
  );
  const currentTeamError = useAppSelector((state) =>
    currentTeamErrorSelector(state)
  );
  const team = useAppSelector((state) => state.user.team);
  const currentTeam = useCurrentCommunity();
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const history = useHistory();

  const initApp = useCallback(async () => {
    if (rest.redirect) {
      setLoading(true);
    }
    if (!userData.user_id && !userError) {
      await dispatch(findUser());
      if (invitationId && !team) {
        const res = await api.acceptInvitation(invitationId, invitationRef);
        if (res.statusCode === 200) {
          await dispatch(findTeamAndChannel(res.data?.team_id));
          toast.success("You have successfully joined new community.");
          dispatch({ type: actionTypes.REMOVE_DATA_FROM_URL });
          setCookie(AsyncKey.lastTeamId, res.data?.team_id);
          history.replace({
            search: "",
            pathname: `/channels/${res.data?.team_id}`,
          });
          return;
        } else {
          await dispatch(findTeamAndChannel());
          history.replace({
            search: "",
            pathname: `/channels`,
          });
        }
      } else {
        await dispatch(findTeamAndChannel(match_community_id));
      }
    } else if (
      match_community_id &&
      currentTeam.team_id !== match_community_id
    ) {
      const matchCommunity = team?.find(
        (t) => t.team_id === match_community_id
      );
      if (
        matchCommunity &&
        !currentTeamLoading &&
        !currentTeamError &&
        match_channel_id
      ) {
        await dispatch(setCurrentTeam(matchCommunity));
      }
    }
    setLoading(false);
  }, [
    rest.redirect,
    userData.user_id,
    userError,
    match_community_id,
    currentTeam.team_id,
    dispatch,
    invitationId,
    team,
    history,
    currentTeamLoading,
    currentTeamError,
    match_channel_id,
    invitationRef,
  ]);
  useEffect(() => {
    if (window.location.pathname !== "/") {
      const query = new URLSearchParams(window.location.search);
      GoogleAnalytics.tracking("Page Viewed", {
        category: "Traffic",
        page_name: "Home",
        source: query.get("ref") || "",
        path: window.location.pathname,
      });
    }
  }, []);
  const checkingAuth = useCallback(async () => {
    if (invitationId) {
      dispatch({
        type: actionTypes.SET_DATA_FROM_URL,
        payload: {
          invitationId,
          invitationRef,
        },
      });
    }
    if (ott) {
      const res = await api.generateTokenFromOTT(ott);
      if (res.success) {
        await setCookie(AsyncKey.accessTokenKey, res.data?.token);
        await setCookie(AsyncKey.loginType, LoginType.Metamask);
        await setCookie(AsyncKey.refreshTokenKey, res.data?.refresh_token);
        await setCookie(AsyncKey.tokenExpire, res.data?.token_expire_at);
        await setCookie(
          AsyncKey.refreshTokenExpire,
          res.data?.refresh_token_expire_at
        );
        history.replace(window.location.pathname);
        return;
      }
    }
    getCookie(AsyncKey.accessTokenKey)
      .then((res: any) => {
        if (!res) {
          history.replace({
            pathname: "/started",
            search: window.location.search,
          });
          dispatch(logout?.());
        } else {
          initApp();
        }
      })
      .catch(() => {
        history.replace({
          pathname: "/started",
          search: window.location.search,
        });
        dispatch(logout?.());
      });
  }, [dispatch, history, initApp, invitationId, invitationRef, ott]);
  useEffect(() => {
    checkingAuth();
  }, [checkingAuth]);
  if (loading)
    return (
      <div className="main-load-page">
        <AppTitleBar />
      </div>
    );
  return <Route {...rest} render={(props) => <Component {...props} />} />;
};

const RedirectToHome = memo(() => {
  const [isEmpty, setEmpty] = useState(false);
  const match = useRouteMatch<{
    match_community_id?: string;
  }>();
  const dispatch = useAppDispatch();
  const { match_community_id } = match.params;
  const channelMap = useAppSelector((state) => state.user.channelMap);
  const team = useAppSelector((state) => state.user.team);
  const lastChannel = useAppSelector((state) => state.user.lastChannel);
  const channel = useMemo(
    () => channelMap[match_community_id || ""],
    [channelMap, match_community_id]
  );
  const history = useHistory();
  const gotoChannel = useCallback(async () => {
    if (!team) return;
    setEmpty(false);
    const cookieChannelId = await getCookie(AsyncKey.lastChannelId);
    let channelId = cookieChannelId;
    let teamId = match_community_id || (await getCookie(AsyncKey.lastTeamId));
    if (match_community_id) {
      const matchCommunity = team.find(
        (el) => el.team_id === match_community_id
      );
      if (!matchCommunity) {
        removeCookie(AsyncKey.lastTeamId);
        history.replace("/channels");
        return;
      }
      const channelByTeam = lastChannel?.[match_community_id];
      channelId = channelByTeam?.channel_id;
      if (!channel) {
        await dispatch(findTeamAndChannel(match_community_id));
      }
    }
    const matchChannel = channel?.find?.((el) => el.channel_id === channelId);
    if ((!channelId && !cookieChannelId) || !matchChannel) {
      channelId = channel?.[0]?.channel_id;
    }
    if (!teamId) {
      teamId = team?.[0]?.team_id;
    }
    if (channelId && teamId) {
      history.replace(`/channels/${teamId}/${channelId}`);
    } else if (teamId) {
      history.replace(`/channels/${teamId}`);
      setEmpty(true);
    } else {
      setEmpty(true);
    }
  }, [team, match_community_id, channel, lastChannel, history, dispatch]);
  useEffect(() => {
    gotoChannel();
  }, [gotoChannel]);
  if (isEmpty && team?.length === 0) {
    return (
      <>
        <AppTitleBar />
        <EmptyTeamView />
      </>
    );
  }
  if (isEmpty && channel?.length === 0) {
    return <Home />;
  }
  return <AppTitleBar />;
});

const Main = () => {
  const unSupport = useMemo(
    () => /iPhone|Android/g.test(window.navigator.userAgent),
    []
  );
  const imgDomain = useAppSelector((state) => state.user.imgDomain);
  const { chainId, metaMaskAccount } = useAppSelector((state) => state.network);
  const internetConnection = useAppSelector(
    (state) => state.configs.internetConnection
  );
  const userData = useAppSelector((state) => state.user.userData);
  const somethingWrong = useAppSelector(
    (state) => state.configs.somethingWrong
  );
  const address = useMemo(() => {
    if (!userData.user_id) return null;
    return utils.computeAddress(userData?.user_id);
  }, [userData.user_id]);
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(getInitial?.());
  }, [dispatch]);
  if (!internetConnection || !navigator.onLine) return <NoInternetPage />;
  if (unSupport) return <UnSupportPage />;
  if (somethingWrong) return <ErrorPage />;
  if (!imgDomain) {
    return <div className="main-load-page" />;
  }
  // if (
  //   chainId !==
  //   (process.env.REACT_APP_DEFAULT_CHAIN_ID
  //     ? parseInt(process.env.REACT_APP_DEFAULT_CHAIN_ID)
  //     : ChainId.EthereumMainnet)
  // ) {
  //   return <UnSupportedNetwork />;
  // }
  if (
    !!address &&
    !!metaMaskAccount &&
    address.toLowerCase() !== metaMaskAccount?.toLowerCase()
  ) {
    return <SwitchAccountMetaMask />;
  }
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <MainWrapper>
        <Switch>
          <PrivateRoute exact path="/" component={RedirectToHome} redirect />
          <PrivateRoute
            exact
            path="/channels"
            component={RedirectToHome}
            redirect
          />
          <PrivateRoute
            exact
            path="/channels/:match_community_id"
            component={RedirectToHome}
            redirect
          />
          <PrivateRoute
            exact
            path="/channels/:match_community_id/:match_channel_id"
            component={Home}
          />
          <PrivateRoute
            exact
            path="/channels/:match_community_id/:match_channel_id/:entity_type/:entity_id"
            component={Home}
          />
          <PublicRoute exact path="/started" component={Started} />
          <Route exact path="*" component={PageNotFound} />
        </Switch>
      </MainWrapper>
    </div>
  );
};
export default Main;
