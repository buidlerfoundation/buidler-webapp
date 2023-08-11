import images from "common/images";
import React, { memo, useCallback } from "react";
import { Link } from "react-router-dom";
import GoogleAnalytics from "services/analytics/GoogleAnalytics";

const NavBar = () => {
  const onLogoClick = useCallback(() => {
    GoogleAnalytics.tracking("Header Logo Clicked", {
      category: "Header",
    });
  }, []);
  const onInstallClick = useCallback(() => {
    GoogleAnalytics.tracking("Header Install Extension Clicked", {
      category: "Header",
    });
  }, []);
  return (
    <div id="my-navbar" className="center" style={{ top: 0 }}>
      <div className="container">
        <nav className="navbar navbar-expand-lg">
          <Link to="/" className="navbar-brand" onClick={onLogoClick}>
            <img
              src={images.logoDark}
              className="nav-logo-dark"
              alt="logo-dark"
            />
            <img
              src={images.logoLight}
              className="nav-logo-light"
              alt="logo-light"
            />
          </Link>

          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav ml-auto"></ul>
            <a
              href="https://chrome.google.com/webstore/detail/omhbdacaeafhladkifficmjmpeaijlfc"
              className="btn btn-primary btn-launch"
              style={{ marginLeft: 25 }}
              target="_blank"
              rel="noreferrer"
              onClick={onInstallClick}
            >
              Install Extension
            </a>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default memo(NavBar);
