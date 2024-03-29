import images from "common/images";
import React, { memo, useCallback } from "react";
import Link from "next/link";
import GoogleAnalytics from "services/analytics/GoogleAnalytics";
import { usePathname } from "next/navigation";

const NavBar = () => {
  const pathname = usePathname();
  const tracking = useCallback((event: string, cat = "Header") => {
    GoogleAnalytics.tracking(event, {
      category: cat,
    });
  }, []);
  const onLogoClick = useCallback(() => {
    tracking("Header Logo Clicked");
  }, [tracking]);
  const onInstallClick = useCallback(() => {
    tracking("Header Install Extension Clicked");
  }, [tracking]);
  const onInsightClick = useCallback(() => {
    tracking("Header User Insights Clicked");
  }, [tracking]);
  const onNewFeedClick = useCallback(() => {
    tracking("Header NewsFeed Clicked");
  }, [tracking]);
  const onRoadMapClick = useCallback(() => {
    tracking("Header Roadmap Clicked");
  }, [tracking]);
  return (
    <div id="my-navbar" className="center" style={{ top: 0 }}>
      <Link className="cta-banner" href="/insights" onClick={onInsightClick}>
        <span>
          Get a full overview of your performance on Farcaster.{" "}
          <span className="mention-string">View your profile now →</span>
        </span>
      </Link>
      <div className="center" style={{ flex: 1, width: "100%" }}>
        <div className="container">
          <nav className="navbar navbar-expand-lg">
            <Link href="/" className="navbar-brand" onClick={onLogoClick}>
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

            <div
              className="collapse navbar-collapse"
              id="navbarSupportedContent"
            >
              <ul className="navbar-nav ml-auto">
                <li className="nav-item">
                  <Link
                    className={`nav-link ${pathname === "/" ? "active" : ""}`}
                    href="/"
                  >
                    Home
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    className={"nav-link"}
                    href="/home"
                    onClick={onNewFeedClick}
                  >
                    News Feed
                  </Link>
                </li>
                <li className="nav-item">
                  <a
                    className="nav-link"
                    href="https://buidler-extension.notion.site/Buidler-Roadmap-https-buidler-app-761e03885290404e875a6dca5282121b"
                    target="_blank"
                    rel="noreferrer"
                    onClick={onRoadMapClick}
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
    </div>
  );
};

export default memo(NavBar);
