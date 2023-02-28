import React, { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useHistory } from "react-router-dom";
import actionTypes from "renderer/actions/ActionTypes";
import {
  findTeamAndChannel,
  findUser,
  logout,
} from "renderer/actions/UserActions";
import { AsyncKey } from "renderer/common/AppConfig";
import { clearData, getCookie } from "renderer/common/Cookie";
import ImageHelper from "renderer/common/ImageHelper";
import images from "renderer/common/images";
import {
  getPrivateChannel,
  uniqChannelPrivateKey,
} from "renderer/helpers/ChannelHelper";
import useAppDispatch from "renderer/hooks/useAppDispatch";
import useAppSelector from "renderer/hooks/useAppSelector";
import { decryptString, getIV } from "renderer/utils/DataCrypto";
import "./index.scss";

const UnlockPrivateKey = (props: any) => {
  const userData = useAppSelector((state) => state.user.userData);
  const history = useHistory();
  const [pass, setPass] = useState("");
  const dispatch = useAppDispatch();
  const initApp = useCallback(async () => {
    await uniqChannelPrivateKey();
    const accessToken = await getCookie(AsyncKey.accessTokenKey);
    if (accessToken && typeof accessToken === "string") {
      await dispatch(findUser());
    }
  }, [dispatch]);
  useEffect(() => {
    if (!userData) {
      initApp();
    }
  }, [userData, initApp]);
  const handleErrorAvatar = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
      e.currentTarget.onerror = null; // prevents looping
      e.currentTarget.src = images.icImageDefault;
    },
    []
  );
  const handleChangePass = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setPass(e.target.value),
    []
  );
  const handlePasswordKeyDown = useCallback(
    async (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.code === "Enter") {
        try {
          const iv = await getIV();
          const encryptedStr: any = await getCookie(AsyncKey.encryptedDataKey);
          const encryptedSeed: any = await getCookie(AsyncKey.encryptedSeedKey);

          if (Object.keys(encryptedSeed || {}).length > 0) {
            const seed = decryptString(encryptedSeed, pass, iv);
            dispatch({
              type: actionTypes.SET_SEED_PHRASE,
              payload: seed,
            });
          }
          const decryptedStr = decryptString(encryptedStr, pass, iv);
          if (!decryptedStr) {
            toast.error("Invalid Password");
          } else {
            const json = JSON.parse(decryptedStr);
            const privateKey = json?.[userData.user_id];
            dispatch({
              type: actionTypes.SET_PRIVATE_KEY,
              payload: privateKey,
            });
            const privateKeyChannel = await getPrivateChannel(privateKey);
            dispatch({
              type: actionTypes.SET_CHANNEL_PRIVATE_KEY,
              payload: privateKeyChannel,
            });
            await dispatch(findTeamAndChannel());
            history.replace("/channels");
          }
        } catch (error) {
          toast.error("Invalid Password");
        }
      }
    },
    [dispatch, history, pass, userData?.user_id]
  );
  const handleLogout = useCallback(() => {
    clearData(() => {
      history.replace("/started");
      dispatch(logout());
    });
  }, [dispatch, history]);
  if (!userData) return <div className="unlock-private-key__container" />;
  return (
    <div className="unlock-private-key__container">
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <img
          className="avatar"
          src={ImageHelper.normalizeImage(
            userData?.avatar_url,
            userData?.user_id
          )}
          alt=""
          onError={handleErrorAvatar}
        />
        <span className="user-name">{userData.user_name}</span>
        <input
          value={pass}
          onChange={handleChangePass}
          placeholder="Password"
          className="input-password"
          type="password"
          autoFocus
          onKeyDown={handlePasswordKeyDown}
        />
      </div>
      <div className="add-other-button normal-button" onClick={handleLogout}>
        <span>Logout</span>
      </div>
    </div>
  );
};

export default UnlockPrivateKey;
