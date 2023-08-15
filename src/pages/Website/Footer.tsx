import images from "common/images";
import React, { memo, useCallback } from "react";
import { Link } from "react-router-dom";
import GoogleAnalytics from "services/analytics/GoogleAnalytics";

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
  const onTWClick = useCallback(() => {
    GoogleAnalytics.tracking("Footer Social Links Clicked", {
      category: "Footer",
      socials: "twitter",
      url: "https://twitter.com/buidler_app",
    });
  }, []);
  const onGHClick = useCallback(() => {
    GoogleAnalytics.tracking("Footer Social Links Clicked", {
      category: "Footer",
      socials: "github",
      url: "https://github.com/buidlerfoundation",
    });
  }, []);
  const onYTBClick = useCallback(() => {
    GoogleAnalytics.tracking("Footer Social Links Clicked", {
      category: "Footer",
      socials: "youtube",
      url: "https://www.youtube.com/channel/UCIkFTkBdbVgzQgw6braFaeg",
    });
  }, []);
  const onWebAppClick = useCallback(() => {
    window.open(`${window.location.origin}/communities`, "_blank");
    GoogleAnalytics.tracking("Footer Launch App On Browser Clicked", {
      category: "Footer",
    });
  }, []);
  const onExtensionClick = useCallback(() => {
    GoogleAnalytics.tracking("Footer Extension Clicked", {
      category: "Footer",
    });
  }, []);
  const onPluginClick = useCallback(() => {
    GoogleAnalytics.tracking("Footer Web Plugin Clicked", {
      category: "Footer",
    });
  }, []);
  const onAboutClick = useCallback(() => {
    GoogleAnalytics.tracking("Footer About Clicked", {
      category: "Footer",
    });
  }, []);
  const onTermsClick = useCallback(() => {
    GoogleAnalytics.tracking("Footer Terms Clicked", {
      category: "Footer",
    });
  }, []);
  const onPrivacyClick = useCallback(() => {
    GoogleAnalytics.tracking("Footer Privacy Clicked", {
      category: "Footer",
    });
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
                  onClick={onTWClick}
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
                  onClick={onYTBClick}
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
                  onClick={onGHClick}
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
                <div className="footer-menu-item" onClick={onWebAppClick}>
                  Web App
                </div>
                <a
                  className="footer-menu-item"
                  href="https://chrome.google.com/webstore/detail/omhbdacaeafhladkifficmjmpeaijlfc"
                  target="_blank"
                  rel="noreferrer"
                  onClick={onExtensionClick}
                >
                  Extension
                </a>
                <a
                  className="footer-menu-item"
                  href="https://docs.buidler.app/add-community-chat-plugin"
                  target="_blank"
                  rel="noreferrer"
                  onClick={onPluginClick}
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
                  onClick={onAboutClick}
                >
                  About
                </a>
                <Link
                  className="footer-menu-item"
                  to="/terms"
                  onClick={onTermsClick}
                >
                  Terms
                </Link>
                <Link
                  className="footer-menu-item"
                  to="/privacy"
                  onClick={onPrivacyClick}
                >
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