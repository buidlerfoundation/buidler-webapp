import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import "./css/index.scss";
import "./css/responsive.scss";
import "./css/home.scss";
import "./css/home-responsive.scss";
import images from "common/images";
import Footer from "./Footer";
import NavBar from "./NavBar";
import GoogleAnalytics from "services/analytics/GoogleAnalytics";

const Website = () => {
  const [showVideo, setShowVideo] = useState(false);
  const [faqExpand, setFAQExpand] = useState("");
  const previousScrollTop = useRef(0);
  const [ctaText, setCTAText] = useState("Add to Chrome - It's Free");
  useEffect(() => {
    const _navigator: any = navigator;
    if (/Android|iOS|iPhone/.test(navigator.userAgent)) {
      setCTAText("Available on Chrome (desktop)");
    } else if (_navigator.brave) {
      setCTAText("Add to Brave - It's Free");
    } else if (navigator.userAgent.includes("Chrome")) {
      setCTAText("Add to Chrome - It's Free");
    } else {
      setCTAText("Available on Chrome");
    }
  }, []);
  const toggleVideo = useCallback(
    () => setShowVideo((current) => !current),
    []
  );
  const onScroll = useCallback((e: any) => {
    const { scrollTop } = e.target;
    const navBar = document.getElementById("my-navbar");
    if (!navBar) return;
    if (scrollTop > previousScrollTop.current && navBar.style.top === "0px") {
      navBar.style.top = "-100px";
    } else if (
      scrollTop < previousScrollTop.current &&
      navBar.style.top === "-100px"
    ) {
      navBar.style.top = "0px";
    }
    previousScrollTop.current = scrollTop;
  }, []);
  const openFAQ = useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      const id = e.currentTarget.id;
      setFAQExpand((current) => {
        if (current === id) {
          return "";
        }
        return id;
      });
    },
    []
  );
  const onCTAClick = useCallback(() => {
    GoogleAnalytics.tracking("Home CTA Install Extension Clicked", {
      category: "Home CTA",
    });
  }, []);
  const onAddPluginClick = useCallback(() => {
    GoogleAnalytics.tracking("Home CTA Add Plugin Clicked", {
      category: "Home CTA",
    });
  }, []);
  const onVideoClick = useCallback(() => {
    toggleVideo();
    GoogleAnalytics.tracking("Video Played", {
      category: "Home",
    });
  }, [toggleVideo]);
  const onCommunityClick = useCallback(() => {
    window.open("/communities", "_blank");
  }, []);
  return (
    <div className="home" onScroll={onScroll}>
      <NavBar />
      <div className="container page-1">
        <h1 className="page-content">
          One extension. <br className="hide-desktop" />
          <span style={{ color: "var(--color-branding-secondary)" }}>
            Any communities.
          </span>
        </h1>
        <span className="page-description">
          Dive into communities right on the sites you're browsing, instantly.
          Enjoy the freedom of communication now!
        </span>
        <div className="page-actions">
          <a
            href="https://chrome.google.com/webstore/detail/omhbdacaeafhladkifficmjmpeaijlfc"
            className="btn btn-primary home-cta"
            target="_blank"
            id="main-cta"
            rel="noreferrer"
            onClick={onCTAClick}
          >
            {ctaText}
          </a>
          <a
            href="https://docs.buidler.app/add-community-chat-plugin"
            className="btn btn-light home-cta"
            target="_blank"
            rel="noreferrer"
            onClick={onAddPluginClick}
          >
            Add to Your Website
          </a>
        </div>
        <div className="video__wrap" id="video-wrapper" onClick={onVideoClick}>
          <video
            className="video-element"
            muted
            autoPlay
            loop
            playsInline
            preload="auto"
          >
            <source src={images.videoPromo} type="video/mp4" />
          </video>
          <div className="video-overlay center">
            <div className="btn-play-video center">
              <img
                className="icon-play-dark"
                src={images.icPlay}
                alt="ic-play"
              />
              <span>Watch Introduction Video</span>
            </div>
          </div>
        </div>
      </div>
      <div className="container page-2">
        <h2 className="page-content">FAQs</h2>
        <div className="page-2-body">
          <div
            className={`faq-item ${faqExpand === "faq-1" ? "faq-active" : ""}`}
          >
            <div className="faq-head" id="faq-1" onClick={openFAQ}>
              <span>1. What is Buidler?</span>
              <img
                src={images.icFAQExpand}
                className="ic-expand"
                alt="ic-expand"
              />
            </div>
            <div className="faq-content__wrap">
              <p className="faq-content">
                Buidler is a messaging platform lets you dive into communities
                right on the sites you're browsing, instantly. By installing the
                Buidler Extension, you can hang out, ask questions, or
                collaborate with everyone on the website directly on your
                browser - without switching or searching for chat channels.
              </p>
            </div>
          </div>
          <div
            className={`faq-item ${faqExpand === "faq-2" ? "faq-active" : ""}`}
          >
            <div className="faq-head" id="faq-2" onClick={openFAQ}>
              <span>2. How do I get started?</span>
              <img
                src={images.icFAQExpand}
                className="ic-expand"
                alt="ic-expand"
              />
            </div>
            <div className="faq-content__wrap">
              <p className="faq-content">
                <span className="para">
                  •<b>Install our extension: </b>
                  <a
                    href="https://chrome.google.com/webstore/detail/omhbdacaeafhladkifficmjmpeaijlfc"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Extension Link
                  </a>
                </span>
                <br />
                <span className="para">
                  {" "}
                  • <b>Join your first channel</b>{" "}
                </span>
                <span className="para-content-1">
                  Enable the extension and reload the website. Then, head on
                  over to the bottom right corner and click on the chat plugin.
                  From there, select "Live chat" and join the channel.
                </span>
                <span className="para-content-1">
                  If you haven't logged in yet, you can use social login or
                  crypto wallets like MetaMask or WalletConnect.
                </span>
                <br />
                <span className="para">
                  {" "}
                  • <b>Explore various communities</b>{" "}
                </span>
                <span className="para-content-1" style={{ marginBottom: 0 }}>
                  Join the community on your favorite websites or check out our
                  community here:{" "}
                  <a
                    href="/communities"
                    target="_blank"
                    rel="noreferrer"
                    onClick={onCommunityClick}
                  >
                    buidler.app/communities
                  </a>
                </span>
              </p>
            </div>
          </div>
          <div
            className={`faq-item ${faqExpand === "faq-3" ? "faq-active" : ""}`}
          >
            <div className="faq-head" id="faq-3" onClick={openFAQ}>
              <span>3. Buidler's mission</span>
              <img
                src={images.icFAQExpand}
                className="ic-expand"
                alt="ic-expand"
              />
            </div>
            <div className="faq-content__wrap">
              <p className="faq-content">
                We believe that the root of all problems in the world is wrong
                communication. Our mission here is to solve it, especially
                focusing on communication problems on the internet. Join
                discussions, share knowledge, and collaborate towards common
                goals.
              </p>
            </div>
          </div>
          <div
            className={`faq-item ${faqExpand === "faq-4" ? "faq-active" : ""}`}
          >
            <div className="faq-head" id="faq-4" onClick={openFAQ}>
              <span>4. So, how exactly does Buidler work its magic?</span>
              <img
                src={images.icFAQExpand}
                className="ic-expand"
                alt="ic-expand"
              />
            </div>
            <div className="faq-content__wrap">
              <p className="faq-content">
                <span className="para">
                  Buidler, a simple extension that transforms websites into
                  communities. Each URL becomes a chat room, connecting users
                  viewing the same content effortlessly.
                </span>
                <span className="para">
                  Our browser app enables real-time discussions and interactions
                  while browsing - no more wasted time switching between
                  platforms. Stay connected and engaged seamlessly inside the
                  Builder app.
                </span>
                If you own a website, integrate Builder into it to build loyal
                communities that keep visitors engaged, connected, and coming
                back for more.
              </p>
            </div>
          </div>
          <div
            className={`faq-item ${faqExpand === "faq-5" ? "faq-active" : ""}`}
          >
            <div className="faq-head" id="faq-5" onClick={openFAQ}>
              <span>5. Crypto wallet for logging in – a must or a choice?</span>
              <img
                src={images.icFAQExpand}
                className="ic-expand"
                alt="ic-expand"
              />
            </div>
            <div className="faq-content__wrap">
              <p className="faq-content">
                It's a choice. You can either continue as a guest or log in with
                your social media accounts, such as Google, Facebook, Apple,
                Twitter, LinkedIn, and more.
              </p>
            </div>
          </div>
          <div
            className={`faq-item ${faqExpand === "faq-6" ? "faq-active" : ""}`}
          >
            <div className="faq-head" id="faq-6" onClick={openFAQ}>
              <span>
                6. Want to boost the number of members in your community?
              </span>
              <img
                src={images.icFAQExpand}
                className="ic-expand"
                alt="ic-expand"
              />
            </div>
            <div className="faq-content__wrap">
              <p className="faq-content">
                Website owners can increase user engagement by integrating our
                plugin. Seamlessly offer real-time support and connect with your
                audience. Strengthen user loyalty, attract new visitors, and
                grow your community organically.{" "}
                <a
                  href="https://docs.buidler.app/add-community-chat-plugin"
                  target="_blank"
                  rel="noreferrer"
                >
                  Click here to integrate community chat plugin!
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
      <div className="buidler-modal-video">
        <div
          className={`modal fade ${showVideo ? "show" : ""}`}
          style={showVideo ? { display: "block" } : undefined}
          id="video-modal"
          tabIndex={-1}
          role="dialog"
          aria-labelledby="exampleModalLabel"
          aria-hidden="true"
          onClick={toggleVideo}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <button type="button" className="close" aria-hidden="true">
                ×
              </button>
              <div className="modal-body">
                {showVideo && (
                  <iframe
                    width="100%"
                    height="100%"
                    src="https://www.youtube.com/embed/Qs3sZNW2nNA?autoplay=true"
                    allowFullScreen
                    allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                    title="YouTube video player"
                  ></iframe>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <script>BADGE_ID = "34f68d0d12e8b756";</script>
      <script
        type="text/javascript"
        src="https://static.alchemyapi.io/scripts/analytics/badge-analytics.js"
      ></script>
      <script
        src="https://code.jquery.com/jquery-3.3.1.slim.min.js"
        integrity="sha384-q8i/X+965DzO0rT7abK41JStQIAqVgRVzpbzo5smXKp4YfRvH+8abtTE1Pi6jizo"
        crossOrigin="anonymous"
      ></script>
      <script
        src="https://cdn.jsdelivr.net/npm/popper.js@1.14.3/dist/umd/popper.min.js"
        integrity="sha384-ZMP7rVo3mIykV+2+9J3UJ46jBk0WLaUAdn689aCwoqbBJiSnjAK/l8WvCWPIPm49"
        crossOrigin="anonymous"
      ></script>
      <script
        src="https://cdn.jsdelivr.net/npm/bootstrap@4.1.3/dist/js/bootstrap.min.js"
        integrity="sha384-ChfqqxuZUCnJSK3+MXmPNIyE6ZbWh2IMqE241rYiqJxyMiZ6OW/JmZQ5stwEULTy"
        crossOrigin="anonymous"
      ></script>
      <script src="js/main.js"></script>
      {showVideo && <div className="modal-backdrop fade show"></div>}
    </div>
  );
};

export default memo(Website);
