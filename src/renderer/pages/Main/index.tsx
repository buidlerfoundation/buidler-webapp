import React, { useEffect } from "react";
import useAppSelector from "renderer/hooks/useAppSelector";
import {
  Switch,
  Route,
  useHistory,
  useRouteMatch,
  useLocation,
} from "react-router-dom";
import {
  findTeamAndChannel,
  findUser,
  getInitial,
  setCurrentTeam,
} from "renderer/actions/UserActions";
import MainWrapper from "./Layout";
import Home from "../Home";
import { AsyncKey } from "../../common/AppConfig";
import { getCookie, removeCookie, setCookie } from "../../common/Cookie";
import AppTitleBar from "../../shared/AppTitleBar";
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

const PublicRoute = ({ component: Component, ...rest }: any) => {
  const history = useHistory();
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

const PrivateRoute = ({ component: Component, ...rest }: any) => {
  const query = useQuery();
  const match_community_id = rest?.computedMatch?.params?.match_community_id;
  const userData = useAppSelector((state) => state.user.userData);
  const team = useAppSelector((state) => state.user.team);
  const currentTeam = useAppSelector((state) => state.user.currentTeam);
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(true);
  const history = useHistory();

  const initApp = useCallback(
    async (invitationId) => {
      setLoading(true);
      if (invitationId) {
        await dispatch(findUser());
        const res = await api.acceptInvitation(invitationId);
        if (res.statusCode === 200) {
          toast.success("You have successfully joined new team.");
          dispatch({ type: actionTypes.REMOVE_DATA_FROM_URL });
          removeCookie(AsyncKey.lastChannelId);
          removeCookie(AsyncKey.lastTeamId);
          setCookie(AsyncKey.lastTeamId, res.data?.team_id);
          history.replace(`/channels/${res.data?.team_id}`);
        }
      } else if (!userData.user_id) {
        await dispatch(findUser());
        await dispatch(findTeamAndChannel(match_community_id));
      } else if (
        match_community_id &&
        currentTeam.team_id !== match_community_id
      ) {
        const matchCommunity = team?.find(
          (t) => t.team_id === match_community_id
        );
        if (matchCommunity) {
          await dispatch(setCurrentTeam(matchCommunity));
        }
      }
      setLoading(false);
    },
    [
      currentTeam?.team_id,
      dispatch,
      history,
      match_community_id,
      team,
      userData.user_id,
    ]
  );
  useEffect(() => {
    let invitationId: string | null = null;
    if (query.has("invitation")) {
      invitationId = query.get("invitation");
      dispatch({
        type: actionTypes.SET_DATA_FROM_URL,
        payload: `invitation=${query.get("invitation")}`,
      });
      query.delete("invitation");
      history.replace({
        search: query.toString(),
      });
    }
    getCookie(AsyncKey.accessTokenKey)
      .then((res: any) => {
        if (!res) {
          history.replace("/started");
        } else {
          initApp(invitationId);
        }
      })
      .catch(() => {
        history.replace("/started");
      });
  }, [history, query, initApp, dispatch]);
  if (loading) return <div className="main-load-page" />;
  return <Route {...rest} render={(props) => <Component {...props} />} />;
};

const RedirectToHome = () => {
  const [isEmpty, setEmpty] = useState(false);
  const match = useRouteMatch<{
    match_community_id?: string;
  }>();
  const { match_community_id } = match.params;
  const channel = useAppSelector((state) => state.user.channel);
  const team = useAppSelector((state) => state.user.team);
  const lastChannel = useAppSelector((state) => state.user.lastChannel);
  const history = useHistory();
  const gotoChannel = useCallback(async () => {
    setEmpty(false);
    const cookieChannelId = await getCookie(AsyncKey.lastChannelId);
    let channelId = cookieChannelId;
    let teamId = match_community_id || (await getCookie(AsyncKey.lastTeamId));
    if (match_community_id) {
      const channelByTeam = lastChannel?.[match_community_id];
      channelId = channelByTeam?.channel_id;
    }
    if (!channelId && !cookieChannelId) {
      channelId = channel?.[0]?.channel_id;
    }
    if (!teamId) {
      teamId = team?.[0]?.team_id;
    }
    if (channelId && teamId) {
      history.replace(`/channels/${teamId}/${channelId}`);
    } else {
      setEmpty(true);
    }
  }, [match_community_id, lastChannel, channel, team, history]);
  useEffect(() => {
    gotoChannel();
  }, [gotoChannel]);
  if (isEmpty && team?.length === 0) {
    return <EmptyTeamView />;
  }
  return null;
};

const Main = () => {
  const location = useLocation();
  const imgDomain = useAppSelector((state) => state.user.imgDomain);
  const chainId = useAppSelector((state) => state.network.chainId);
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(getInitial?.());
  }, [dispatch]);
  if (!imgDomain) {
    return <div className="main-load-page" />;
  }
  if (chainId !== ChainId.EthereumMainnet) {
    return <UnSupportedNetwork />;
  }
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {location.pathname !== "/started" && <AppTitleBar />}
      <MainWrapper>
        <Switch>
          <PrivateRoute exact path="/" component={RedirectToHome} />
          <PrivateRoute exact path="/channels" component={RedirectToHome} />
          <PrivateRoute
            exact
            path="/channels/:match_community_id"
            component={RedirectToHome}
          />
          <PrivateRoute
            exact
            path="/channels/:match_community_id/:match_channel_id"
            component={Home}
          />
          <PublicRoute exact path="/started" component={Started} />
        </Switch>
      </MainWrapper>
    </div>
  );
};
export default Main;
