import images from "common/images";
import React, { memo, useCallback } from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  const logBadgeClick = useCallback(() => {
    const BADGE_ID = "34f68d0d12e8b756";
    const ALCHEMY_URL = `https://alchemyapi.io/?r=badge:${BADGE_ID}`;
    const ALCHEMY_ANALYTICS_URL = `https://analytics.alchemyapi.io/analytics`;
    fetch(`${ALCHEMY_ANALYTICS_URL}/badge-click`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        badge_id: BADGE_ID,
      }),
    });
    window.open(ALCHEMY_URL, "_blank");
  }, []);
  return (
    <>
      <div className="page-footer">
        <div className="container">
          <div className="row">
            <div className="col-12 col-md-8">
              <span className="content-footer">
                Buidler - One extension. Any communities.
              </span>
              <div className="footer-icons">
                <a
                  className="icon__wrap"
                  href="https://twitter.com/buidler_app"
                  target="_blank"
                  rel="noreferrer"
                >
                  <img
                    loading="lazy"
                    src={images.icTW}
                    className="icon"
                    alt="logo-tw"
                  />
                </a>
                <a
                  className="icon__wrap"
                  href="https://www.youtube.com/@buidler_app"
                  target="_blank"
                  rel="noreferrer"
                >
                  <img
                    loading="lazy"
                    src={images.icYTB}
                    className="icon"
                    alt="logo-ytb"
                  />
                </a>
                <a
                  className="icon__wrap"
                  href="https://github.com/buidlerfoundation"
                  target="_blank"
                  rel="noreferrer"
                >
                  <img
                    loading="lazy"
                    src={images.icGH}
                    className="icon"
                    alt="logo-gh"
                  />
                </a>
              </div>
              <div className="embed-ph__wrap">
                <div>
                  <img
                    id="badge-button"
                    style={{ width: 240, height: 53 }}
                    src="https://static.alchemyapi.io/images/marketing/badge.png"
                    alt="Alchemy Supercharged"
                    onClick={logBadgeClick}
                  />
                </div>
              </div>
            </div>
            <div className="col-6 col-md-2">
              <h5 className="footer-title">Product</h5>
              <div className="menu__wrap">
                <Link className="footer-menu-item" to="/communities">
                  Web App
                </Link>
                <a
                  className="footer-menu-item"
                  href="https://chrome.google.com/webstore/detail/omhbdacaeafhladkifficmjmpeaijlfc"
                  target="_blank"
                  rel="noreferrer"
                >
                  Extension
                </a>
                <a
                  className="footer-menu-item"
                  href="https://docs.buidler.app/add-community-chat-plugin"
                  target="_blank"
                  rel="noreferrer"
                >
                  Web Plugin
                </a>
              </div>
            </div>
            <div className="col-6 col-md-2">
              <h5 className="footer-title">Company</h5>
              <div className="menu__wrap">
                <a
                  className="footer-menu-item"
                  href="https://docs.buidler.app/about"
                  target="_blank"
                  rel="noreferrer"
                >
                  About
                </a>
                <Link className="footer-menu-item" to="/terms">
                  Terms
                </Link>
                <Link className="footer-menu-item" to="/privacy">
                  Privacy
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="page-copyright">
        <div className="container">
          <div className="center content-copyright">
            <span>© 2023 Buidler - All right reserved.</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default memo(Footer);
