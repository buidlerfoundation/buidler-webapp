import { useState } from "react";
import { useCallback, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { logout } from "renderer/actions/UserActions";
import { AsyncKey, LoginType } from "renderer/common/AppConfig";
import { clearData, getCookie } from "renderer/common/Cookie";
import useAppDispatch from "renderer/hooks/useAppDispatch";
import useAppSelector from "renderer/hooks/useAppSelector";
import WalletConnectUtils from "renderer/services/connectors/WalletConnectUtils";

type PageWrapperProps = {
  children: any;
};

const PageWrapper = ({ children }: PageWrapperProps) => {
  const [loginType, setLoginType] = useState();
  const privateKey = useAppSelector((state) => state.configs.privateKey);
  const history = useHistory();
  const dispatch = useAppDispatch();
  const handleLogout = useCallback(() => {
    clearData(() => {
      history.replace("/started");
      dispatch(logout());
    });
  }, [dispatch, history]);
  const checkingProvider = useCallback(async () => {
    const type = await getCookie(AsyncKey.loginType);
    setLoginType(type);
    if (
      !privateKey &&
      !WalletConnectUtils.connector?.connected &&
      type !== LoginType.Metamask
    ) {
      handleLogout();
    }
  }, [handleLogout, privateKey]);
  useEffect(() => {
    checkingProvider();
  }, [checkingProvider]);
  if (
    WalletConnectUtils.connector?.connected ||
    privateKey ||
    loginType === LoginType.Metamask
  )
    return <div>{children}</div>;
  return <div className="page-wrapper-container" />;
};

export default PageWrapper;
