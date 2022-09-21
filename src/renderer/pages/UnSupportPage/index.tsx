import React, { useCallback } from "react";
import images from "renderer/common/images";
import "./index.scss";

const UnSupportPage = () => {
  const handleBackToHome = useCallback(() => {
    window.location.replace("https://www.buidler.app/");
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
