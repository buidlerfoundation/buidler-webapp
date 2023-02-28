import React, { useCallback, useEffect } from "react";
import images from "renderer/common/images";
import { BuidlerURL } from "renderer/helpers/LinkHelper";
import "./index.scss";

const UnSupportPage = () => {
  useEffect(() => {
    if (/iPhone/g.test(window.navigator.userAgent)) {
      window.location.replace(`${BuidlerURL}/download/ios`);
    }
  }, []);
  const handleBackToHome = useCallback(() => {
    window.location.replace(BuidlerURL);
  }, []);
  return (
    <div className="un-support-page__container">
      <div className="un-support-body">
        <img src={images.icLogoSquare} className="app-logo" alt="" />
        <span className="un-support-text">
          Hi there!
          <br />
          Mobile version is coming soon. Let’s try again with your desktop.
        </span>

        <div className="bottom-button" onClick={handleBackToHome}>
          <span>Back to homepage</span>
        </div>
      </div>
    </div>
  );
};

export default UnSupportPage;
