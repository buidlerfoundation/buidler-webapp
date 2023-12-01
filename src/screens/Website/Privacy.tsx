"use client";

import React, { memo, useCallback, useEffect, useRef } from "react";
import NavBar from "./NavBar";
import "./css/index.scss";
import "./css/responsive.scss";
import "./css/privacy.scss";
import "./css/privacy-responsive.scss";
import Footer from "./Footer";
import Link from "next/link";

const Privacy = () => {
  const previousScrollTop = useRef(0);
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
  useEffect(() => {
    document.title = "Privacy Policy | Buidler";
  }, []);
  return (
    <div className="home privacy" onScroll={onScroll}>
      <NavBar />
      <div className="page-1 container">
        <h1 className="page-title">Privacy policy</h1>
        <span className="page-content-terms">
          At Buidler, accessible from
          <Link href="/"> https://buidler.app</Link>, one of our main priorities
          is the privacy of our visitors. This Privacy Policy document contains
          types of information that is collected and recorded by Buidler and how
          we use it.
          <br />
          <br />
          If you have additional questions or require more information about our
          Privacy Policy, do not hesitate to contact us.
          <br />
          <br />
          This Privacy Policy applies only to our online activities and is valid
          for visitors to our website with regards to the information that they
          shared and/or collect in Buidler. This policy is not applicable to any
          information collected offline or via channels other than this website.
          Our Privacy Policy was created with the help of the Terms Feed Free
          Privacy Policy Generator.
        </span>
        <h2 className="page-content-head">Consent</h2>
        <span className="page-content-terms">
          By using our website, you hereby consent to our Privacy Policy and
          agree to its terms.
        </span>
        <h2 className="page-content-head">Information we collect</h2>
        <span className="page-content-terms">
          The personal information that you are asked to provide, and the
          reasons why you are asked to provide it, will be made clear to you at
          the point we ask you to provide your personal information.
          <br />
          <br />
          If you contact us directly, we may receive additional information
          about you such as your name, email address, phone number, the contents
          of the message and/or attachments you may send us, and any other
          information you may choose to provide.
          <br />
          <br />
          When you register for an Account, we may ask for your contact
          information, including items such as name, company name, address,
          email address, and telephone number.
        </span>
        <h2 className="page-content-head">How we use your information</h2>
        <span className="page-content-terms">
          We use the information we collect in various ways, including to:
          <br />
          <br />
          • Provide, operate, and maintain our website
          <br />
          • Improve, personalize, and expand our website
          <br />
          • Understand and analyze how you use our website
          <br />
          • Develop new products, services, features, and functionality
          <br />
          • Communicate with you, either directly or through one of our
          partners, including for customer service, to provide you with updates
          and other information relating to the website, and for marketing and
          promotional purposes
          <br />
          • Send you emails
          <br />• Find and prevent fraud
        </span>
        <h2 className="page-content-head">Log Files</h2>
        <span className="page-content-terms">
          Buidler follows a standard procedure of using log files. These files
          log visitors when they visit websites. All hosting companies do this
          and a part of hosting services' analytics. The information collected
          by log files include internet protocol (IP) addresses, browser type,
          Internet Service Provider (ISP), date and time stamp, referring/exit
          pages, and possibly the number of clicks. These are not linked to any
          information that is personally identifiable. The purpose of the
          information is for analyzing trends, administering the site, tracking
          users' movement on the website, and gathering demographic information.
        </span>
        <h2 className="page-content-head">Cookies and Web Beacons</h2>
        <span className="page-content-terms">
          Like any other website, Buidler uses 'cookies'. These cookies are used
          to store information including visitors' preferences, and the pages on
          the website that the visitor accessed or visited. The information is
          used to optimize the users' experience by customizing our web page
          content based on visitors' browser type and/or other information.
        </span>
        <h2 className="page-content-head">
          Advertising Partners Privacy Policies
        </h2>
        <span className="page-content-terms">
          You may consult this list to find the Privacy Policy for each of the
          advertising partners of Buidler.
          <br />
          <br />
          Third-party ad servers or ad networks uses technologies like cookies,
          JavaScript, or Web Beacons that are used in their respective
          advertisements and links that appear on Buidler, which are sent
          directly to users' browser. They automatically receive your IP address
          when this occurs. These technologies are used to measure the
          effectiveness of their advertising campaigns and/or to personalize the
          advertising content that you see on websites that you visit.
          <br />
          <br />
          Note that Buidler has no access to or control over these cookies that
          are used by third-party advertisers.
        </span>
        <h2 className="page-content-head">Third Party Privacy Policies</h2>
        <span className="page-content-terms">
          Buidler's Privacy Policy does not apply to other advertisers or
          websites. Thus, we are advising you to consult the respective Privacy
          Policies of these third-party ad servers for more detailed
          information. It may include their practices and instructions about how
          to opt-out of certain options. You can choose to disable cookies
          through your individual browser options.
          <br />
          <br />
          To know more detailed information about cookie management with
          specific web browsers, it can be found at the browsers' respective
          websites.
        </span>
        <h2 className="page-content-head">
          CCPA Privacy Rights (Do Not Sell My Personal Information)
        </h2>
        <span className="page-content-terms">
          Under the CCPA, among other rights, California consumers have the
          right to:
          <br />
          <br />
          Request that a business that collects a consumer's personal data
          disclose the categories and specific pieces of personal data that a
          business has collected about consumers.
          <br />
          <br />
          Request that a business delete any personal data about the consumer
          that a business has collected.
          <br />
          <br />
          Request that a business that sells a consumer's personal data, not
          sell the consumer's personal data.
          <br />
          <br />
          If you make a request, we have one month to respond to you. If you
          would like to exercise any of these rights, please
          <Link href="#"> contact us.</Link>
        </span>
        <h2 className="page-content-head">GDPR Data Protection Rights</h2>
        <span className="page-content-terms">
          We would like to make sure you are fully aware of all of your data
          protection rights. Every user is entitled to the following:
          <br />
          <br />
          The right to access - You have the right to request copies of your
          personal data. We may charge you a small fee for this service.
          <br />
          <br />
          The right to rectification - You have the right to request that we
          correct any information you believe is inaccurate. You also have the
          right to request that we complete the information you believe is
          incomplete.
          <br />
          <br />
          The right to erasure - You have the right to request that we erase
          your personal data, under certain conditions.
          <br />
          <br />
          The right to restrict processing - You have the right to request that
          we restrict the processing of your personal data, under certain
          conditions.
          <br />
          <br />
          The right to object to processing - You have the right to object to
          our processing of your personal data, under certain conditions.
          <br />
          <br />
          The right to data portability - You have the right to request that we
          transfer the data that we have collected to another organization, or
          directly to you, under certain conditions.
          <br />
          <br />
          If you make a request, we have one month to respond to you. If you
          would like to exercise any of these rights, please{" "}
          <Link href="#">contact us.</Link>
        </span>
        <h2 className="page-content-head">Children's Information</h2>
        <span className="page-content-terms">
          Another part of our priority is adding protection for children while
          using the internet. We encourage parents and guardians to observe,
          participate in, and/or monitor and guide their online activity.
          <br />
          <br />
          Buidler does not knowingly collect any Personal Identifiable
          Information from children under the age of 13. If you think that your
          child provided this kind of information on our website, we strongly
          encourage you to contact us immediately and we will do our best
          efforts to promptly remove such information from our records.
        </span>
      </div>
      <Footer />
    </div>
  );
};

export default memo(Privacy);
