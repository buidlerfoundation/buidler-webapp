"use client";

import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import images from "common/images";
import Footer from "./Footer";
import NavBar from "./NavBar";
import GoogleAnalytics from "services/analytics/GoogleAnalytics";
import { useRouter } from "next/navigation";

const Website = () => {
  const router = useRouter();
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
      navBar.style.top = "-140px";
    } else if (
      scrollTop < previousScrollTop.current &&
      navBar.style.top === "-140px"
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
  useEffect(() => {
    if (typeof window !== "undefined") {
      if ("standalone" in window.navigator && window.navigator.standalone) {
        router.replace("/home");
      }
    }
  }, [router]);
  return (
    <div className="home" onScroll={onScroll}>
      <NavBar />
      <div className="container page-1">
        <h1 className="page-content">
          <span style={{ color: "var(--color-branding-secondary)" }}>
            A web annotation{" "}
          </span>
          <br />
          built on top of Farcaster
        </h1>
        <span className="page-description">
          A web annotation tool that leverages the power of Farcaster, enabling
          users to collaboratively annotate and discuss web content.
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
            style={{ display: "none" }}
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
                Buidler is a social web annotation that enables you to comment
                and engage in discussions on any webpage. With Buidler, you can
                share your thoughts, explore different viewpoints, and connect
                with others, all within the context of the web content you're
                browsing.
              </p>
            </div>
          </div>
          <div
            className={`faq-item ${faqExpand === "faq-2" ? "faq-active" : ""}`}
          >
            <div className="faq-head" id="faq-2" onClick={openFAQ}>
              <span>
                2. What is Farcaster, and how does it relate to Buidler?
              </span>
              <img
                src={images.icFAQExpand}
                className="ic-expand"
                alt="ic-expand"
              />
            </div>
            <div className="faq-content__wrap">
              <p className="faq-content">
                <span className="para">
                  Farcaster is a protocol for building decentralized social
                  apps. It is a{" "}
                  <a
                    href="https://www.varunsrinivasan.com/2022/01/11/sufficient-decentralization-for-social-networks"
                    target="_blank"
                    rel="noreferrer"
                  >
                    sufficiently decentralized
                  </a>{" "}
                  protocol where users control their data, and developers can
                  build apps permissionlessly on the network.
                </span>
                <br />
                <span className="para">
                  Buidler, built on top of Farcaster, takes advantage of its
                  essential infrastructure to create a truly decentralized
                  social platform. It also benefits from the diverse range of
                  content and users found in various client apps within the
                  Farcaster ecosystem. When users create posts on Farcaster
                  client apps that include web links, Buidler serves as a
                  bridge, displaying all discussions related to that URL.
                </span>
                <br />
                <span className="para">
                  By doing so, Buidler enhances its capabilities and connects
                  its users to a broader community, ensuring open, diverse, and
                  far-reaching discussions.
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
                    src="https://www.youtube.com/embed/6ypCxsJ49tg?autoplay=true"
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
      {showVideo && <div className="modal-backdrop fade show"></div>}
    </div>
  );
};

export default memo(Website);
