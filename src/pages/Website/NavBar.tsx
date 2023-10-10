import images from "common/images";
import React, { memo, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import GoogleAnalytics from "services/analytics/GoogleAnalytics";

const NavBar = () => {
  const location = useLocation();
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

          <button
            className="navbar-toggler"
            type="button"
            data-toggle="collapse"
            data-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
            id="toggle-side-menu"
          >
            <div className="side-menu center">
              <div className="line-1"></div>
              <div className="line-2"></div>
            </div>
          </button>

          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav ml-auto">
              <li className="nav-item">
                <Link
                  className={`nav-link ${
                    location.pathname === "/" ? "active" : ""
                  }`}
                  to="/"
                >
                  Home
                </Link>
              </li>
              <li className="nav-item">
                <a
                  className="nav-link"
                  href="https://buidler-extension.notion.site/Buidler-Roadmap-https-buidler-app-761e03885290404e875a6dca5282121b"
                  target="_blank"
                  rel="noreferrer"
                >
                  Roadmap
                </a>
              </li>
            </ul>
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
