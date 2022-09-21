import React, { useCallback } from "react";
import "./index.scss";

const UnSupportPage = () => {
  const handleBackToHome = useCallback(() => {
    window.location.replace("https://www.buidler.app/");
  }, []);
  return (
    <div className="un-support-page__container">
      <div style={{ height: 200 }} />
      <span className="un-support-text">
        Hi there, Mobile version is coming soon. Let's try again with your
        desktop.
      </span>
      <div style={{ flex: 1 }} />
      <div className="bottom-button" onClick={handleBackToHome}>
        <span>Back to home page</span>
      </div>
    </div>
  );
};

export default UnSupportPage;
