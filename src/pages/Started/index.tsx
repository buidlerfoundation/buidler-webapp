import React, { useState } from "react";
import "./index.scss";
import images from "../../common/images";
import ModalCreatePassword from "../../components/ModalCreatePassword";
import ModalImportSeedPhrase from "../../components/ModalImportSeedPhrase";
import { useNavigate } from "react-router-dom";
import { ethers, utils } from "ethers";
import { encryptString, getIV } from "utils/DataCrypto";
import { setCookie } from "common/Cookie";
import { AsyncKey } from "common/AppConfig";
import api from "api";
import { isValidPrivateKey } from "helpers/SeedHelper";
import { useDispatch, useSelector } from "react-redux";
import actionTypes from "actions/ActionTypes";
import { getPrivateChannel } from "helpers/ChannelHelper";

const Started = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const dataFromUrl = useSelector((state: any) => state.configs.dataFromUrl);
  const [isOpenPasswordModal, setOpenPasswordModal] = useState(false);
  const [isOpenImportModal, setOpenImportModal] = useState(false);
  const loggedOn = async (
    seed: string,
    password: string,
    backupLater?: boolean
  ) => {
    const iv = await getIV();
    let privateKey;
    let signingKey;
    if (isValidPrivateKey(seed)) {
      privateKey = seed;
      if (privateKey.substring(0, 2) !== "0x") {
        privateKey = `0x${privateKey}`;
      }
      signingKey = new utils.SigningKey(privateKey);
    } else {
      const wallet = ethers.Wallet.fromMnemonic(seed);
      privateKey = wallet.privateKey;
      signingKey = wallet._signingKey();
    }
    const publicKey = utils.computePublicKey(privateKey, true);
    dispatch({ type: actionTypes.SET_PRIVATE_KEY, payload: privateKey });
    const data = { [publicKey]: privateKey };
    const encryptedData = encryptString(JSON.stringify(data), password, iv);
    if (backupLater) {
      const encryptedSeed = encryptString(seed, password, iv);
      setCookie(AsyncKey.encryptedSeedKey, encryptedSeed);
      dispatch({ type: actionTypes.SET_SEED_PHRASE, payload: seed });
    }
    setCookie(AsyncKey.encryptedDataKey, encryptedData);
    const { nonce } = await api.requestNonce(publicKey);
    if (nonce) {
      const msgHash = utils.hashMessage(nonce);
      const msgHashBytes = utils.arrayify(msgHash);
      const signature = signingKey.signDigest(msgHashBytes);
      const res = await api.verifyNonce(nonce, signature.compact);
      if (res.statusCode === 200) {
        setCookie(AsyncKey.accessTokenKey, res.token);
        const privateKeyChannel = await getPrivateChannel(privateKey);
        dispatch({
          type: actionTypes.SET_CHANNEL_PRIVATE_KEY,
          payload: privateKeyChannel,
        });
        if (dataFromUrl?.includes?.("invitation")) {
          const invitationId = dataFromUrl.split("=")[1];
          const acceptRes = await api.acceptInvitation(invitationId);
          if (acceptRes.statusCode === 200) {
            dispatch({ type: actionTypes.REMOVE_DATA_FROM_URL });
          }
        }
        navigate("/home", { replace: true });
      }
    }
  };
  return (
    <div className="started-container">
      <div className="started-body">
        <div className="started-info-view">
          <img className="started-logo" alt="" src={images.icLogoSquare} />
          <span className="started-title">
            One-stop for your
            <br />
            Web3 Commnunity
          </span>
          <span className="started-description">
            Buidler is a Web3 Application for your
            <br />
            community, fans, team, and supporters.
          </span>
        </div>
        <div
          className="create-wallet-button normal-button"
          onClick={() => setOpenPasswordModal(true)}
        >
          Create a new wallet
        </div>
        <div
          className="import-wallet-button normal-button"
          onClick={() => setOpenImportModal(true)}
        >
          Import existing wallet
        </div>
      </div>
      <ModalCreatePassword
        open={isOpenPasswordModal}
        handleClose={() => setOpenPasswordModal(false)}
        loggedOn={loggedOn}
      />
      <ModalImportSeedPhrase
        open={isOpenImportModal}
        handleClose={() => setOpenImportModal(false)}
        loggedOn={loggedOn}
      />
    </div>
  );
};

export default Started;
