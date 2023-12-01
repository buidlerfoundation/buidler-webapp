"use client"

import React, { memo, useCallback, useEffect, useRef } from "react";
import NavBar from "./NavBar";
import "./css/index.scss";
import "./css/responsive.scss";
import "./css/privacy.scss";
import "./css/privacy-responsive.scss";
import Footer from "./Footer";
import Link from "next/link";

const Terms = () => {
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
    document.title = "Terms of Service | Buidler";
  }, []);
  return (
    <div className="home privacy" onScroll={onScroll}>
      <NavBar />
      <div className="page-1 container">
        <h1 className="page-title">Buidler Terms Of Service</h1>
        <span className="page-content-terms">
          These Terms of Service (“Terms”) govern your access to and use of our
          services that are fully owned and operated by the Buidler (referred to
          as “we”, “our”, “Buidler”) including the Buidler website and the
          Buidler applications, including Mac OS, Android and Mac iOS
          (collectively, referred to as the “Services”) and any information,
          text, links, graphics, videos, audio or other material uploaded,
          downloaded or appearing on the Services (collectively, referred to as
          “Content”). These Terms and the Buidler Privacy Policy form the End
          User Agreement between you and the Buidler.
        </span>
        <h2 className="page-content-head">1. Who may use the Services</h2>
        <span className="page-content-terms">
          Anyone who is not barred from using the Services under the laws of the
          applicable jurisdiction, and is at least 13 years of age can use the
          Service. If you are living in the United Kingdom or a European Union
          country, you must be at least 16 years old.
          <br />
          <br />
          By using these Services, you agree to form a binding End User
          Agreement between you and the Buidler.
          <br />
          <br />
          If you are accepting these Terms and using the Services on behalf of a
          company, organization, government, or other legal entity, you
          represent and warrant that you are authorized to do so and have the
          authority to bind such entity to these Terms, in which case the words
          “you” and “your” as used in these Terms shall refer to such entity.
        </span>
        <h2 className="page-content-head">2. Our Privacy Policy</h2>
        <span className="page-content-terms">
          Privacy is central to our purpose and mission. For more details,
          please refer to the Buidler
          <Link href="/privacy"> Privacy Policy.</Link>
        </span>
        <h2 className="page-content-head">3. Our Services</h2>
        <span className="page-content-terms">
          Our Services are intended to inform you and educate you about using
          our private and secure communications app (Buidler Website), and
          facilitate private and secure communications between two or more
          parties, or within a closed channel or within an community (Buidler,
          or Buidler App).
        </span>
        <h3 className="page-content-head" style={{ marginTop: 16 }}>
          3.1. Using the Buidler Website
        </h3>
        <span className="page-content-terms">
          The purpose of the Buidler Website is primarily to provide you with
          information about the Buidler App and link to download of the Buidler
          App. We have done our best to make sure this information is accurate
          and up-to-date, however, there may be unintentional errors that may
          mislead you. Therefore, we encourage you to contact us for any
          clarifications you may need.
          <br />
          <br />
          The Buidler Website also enables you to submit your contact details,
          so we are able to keep you informed about our work.
        </span>
        <h2 className="page-content-head">
          4. Our Responsibilities and Commitments to You
        </h2>
        <span className="page-content-terms">
          We are committed to ensuring the delivery of our Services in a way
          that is accessible and reliable.
          <br />
          <br />
          We will not sell or otherwise monetize your personal data or content
          in any way. We cannot access your data even if we wanted to, as
          Buidler preserves the privacy and secrecy of your messages. See our
          Privacy Policy for more information.
          <br />
          <br />
          Buidler’s License to You — Buidler grants you a limited, revocable,
          non-exclusive, and non-transferable license to use our Services in
          accordance with these Terms.
          <br />
          <br />
          Availability of Our Services — We strive to ensure that our Services
          are continuously available for use. However, there may be occasions
          when they are interrupted, including for maintenance, upgrades, or to
          resolve network or equipment failures. We may discontinue some or all
          of our Services, including certain features and the support for
          certain devices and platforms.
          <br />
          <br />
          Keeping you informed — We continuously provide updates about our
          Services through various channels, including the Buidler Blog, Buidler
          Twitter Account and Buidler Community on Buidler. Where possible, we
          will strive to keep you updated about outages and service disruptions
          through these channels.
        </span>
        <h2 className="page-content-head">
          5. Your Responsibilities and Rights
        </h2>
        <h3 className="page-content-head" style={{ marginTop: 16 }}>
          5.1. Account Management and General Use
        </h3>
        <span className="page-content-terms">
          Software and account — You are responsible for keeping your device,
          Buidler App and your account up-to-date, safe and secure, including
          being responsible for any passwords or recovery phrases.
          <br />
          <br />
          Fees and Taxes — You are responsible for data and mobile carrier fees
          and taxes associated with the devices on which you use our Services.
          <br />
          <br />
          Terms and Policies — You must use our Services according to our Terms
          and policies. If we block your device for a breach of our Terms, you
          will not create another account without our permission.
          <br />
          <br />
          Legal and Acceptable Use — You agree to use our Services only for
          legal, authorized, and acceptable purposes. You will not use (or
          assist others in using) our Services in ways that: (a) violate or
          infringe the rights of Buidler, our users, or others, including
          privacy, publicity, intellectual property, or other rights; (b)
          involve sending illegal or impermissible communications such as bulk
          messaging, auto-messaging, and auto-dialing; (c) breach the Buidler
          Content Policy described further below.
          <br />
          <br />
          Harm to Buidler — You must not (or assist others to) access, use,
          modify, distribute, transfer, or exploit our Services in unauthorized
          manners, or in ways that harm Buidler, our Services, or systems. For
          example you must not (a) gain or try to gain unauthorized access to
          our Services or systems; (b) disrupt the integrity or performance of
          our Services; (c) create accounts for our Services through
          unauthorized or automated means; (d) collect information about other
          Buidler users in any unauthorized manner; or (e) sell, rent, or charge
          for our Services.
          <br />
          <br />
          Third-party services — Our Services may allow you to access, use, or
          interact with third-party websites, apps, content, and other products
          and services run by third parties. When you use third-party services,
          their terms and privacy policies govern your use of those services.
          When using Community operated by third-parties, these Terms as well as
          any terms or policies associated with the Community will govern your
          use.
          <br />
          <br />
          Your Content — You own and/or take responsibility for the content
          (text messages, audio, video, images) you submit through our Services.
          Your content is yours, but you give us a license to it when you use
          Buidler. We reserve the right to block, remove, and/or permanently
          delete your content for any reason, including breach of these terms,
          our Buidler’s Privacy.
          <br />
          <br />
          Buidler Rights — You acknowledge that the Buidler owns all copyrights,
          trademarks, domains, logos, trade dress, trade secrets, patents, and
          other intellectual property rights associated with our Services. You
          may not use our copyrights, trademarks, domains, logos, trade dress,
          patents, and other intellectual property rights unless you have our
          written permission. To report copyright, trademark, or other
          intellectual property infringement, please contact
          <b>hello@buidler.app</b>
          <br />
          <br />
        </span>
        <h3 className="page-content-head" style={{ marginTop: 16 }}>
          5.2. Buidler Content Policy
        </h3>
        <span className="page-content-terms">
          When using our services, you must comply with these terms and all
          applicable laws, rules, and regulations, and you must only use the
          services for authorized and acceptable purposes.
          <br />
          <br />
          We have identified the following activities of Buidler as a clear
          breach of these Terms.
          <br />
          <br />
          <b>Violent Behavior, Violent Extremism and Terrorism</b>
          <br />
          <br />
          Buidler cannot be used to:
          <br />
          <br />
          • to glorify violence, or promote violence of any form (physical,
          psychological, sexual) against another individual or group, or incite
          harm or directly attack or threaten other people on the basis of race,
          ethnicity, national origin, caste, sexual orientation, gender, gender
          identity, religious affiliation, age, disability, or serious disease.
          <br />
          • by organizations, groups and individuals designated by the United
          Nations as terrorist organizations or terrorists.
          <br />
          <br />
          <b>Child Sexual Exploitation</b>
          <br />
          <br />
          Buidler cannot be used to organism or promote child sexual
          exploitation. A child is defined as anyone under the age of 18.
          Specifically, Buidler cannot be used to store or share:
          <br />
          <br />
          • visual depictions of a child engaging in sexually explicit or
          sexually suggestive acts;
          <br />
          • illustrated, computer-generated or other forms of realistic
          depictions of a human child in a sexually explicit context, or
          engaging in sexually explicit acts;
          <br />
          • sexualized commentaries about or directed at a known or unknown
          minor;
          <br />
          • links to third-party sites that host child sexual exploitation
          material;
          <br />
          • fantasies about or promoting engagement in child sexual
          exploitation;
          <br />
          • recruiting, advertising or expressing an interest in a commercial
          sex act involving a child, or in harboring and/or transporting a child
          for sexual purposes.
          <br />
          <br />
          <b>Extremely Violence and/or Graphic Content</b>
          <br />
          <br />
          Buidler cannot be used to store or share violent or gory content that
          is intended to shock or disgust others, or create harm or distress to
          the person or persons represented in the content.
          <br />
          <br />
          <b>Harmful and/or Unlawful Content</b>
          <br />
          <br />
          Buidler cannot be used for cyber abuse, non-consensual sharing of
          intimate images and abhorrent violent material.
          <br />
          <br />
          Don’t use the services to do harm to yourself or others. Among other
          things, this includes trying to gain access to another user’s account
          or any non-public portions of the services, infringing anyone else’s
          intellectual property rights or any other proprietary rights,
          harassing, bullying, spamming, auto-messaging, or auto-dialing people
          through our services.
        </span>
        <h2 className="page-content-head">6. Disclaimers and Limitations</h2>
        <span className="page-content-terms">
          Disclaimers — YOU USE OUR SERVICES AT YOUR OWN RISK AND SUBJECT TO THE
          FOLLOWING DISCLAIMERS. WE PROVIDE OUR SERVICES ON AN “AS IS” BASIS
          WITHOUT ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED
          TO, WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE,
          TITLE, NON-INFRINGEMENT, AND FREEDOM FROM COMPUTER VIRUS OR OTHER
          HARMFUL CODE. BUIDLER DOES NOT WARRANT THAT ANY INFORMATION PROVIDED
          BY US IS ACCURATE, COMPLETE, OR USEFUL, THAT OUR SERVICES WILL BE
          OPERATIONAL, ERROR-FREE, SECURE, OR SAFE, OR THAT OUR SERVICES WILL
          FUNCTION WITHOUT DISRUPTIONS, DELAYS, OR IMPERFECTIONS. WE DO NOT
          CONTROL, AND ARE NOT RESPONSIBLE FOR, CONTROLLING HOW OR WHEN OUR
          USERS USE OUR SERVICES. WE ARE NOT RESPONSIBLE FOR THE ACTIONS OR
          INFORMATION (INCLUDING CONTENT) OF OUR USERS OR OTHER THIRD PARTIES.
          YOU RELEASE US, AFFILIATES, DIRECTORS, OFFICERS, EMPLOYEES, PARTNERS,
          AND AGENTS (TOGETHER, “BUIDLER PARTIES”) FROM ANY CLAIM, COMPLAINT,
          CAUSE OF ACTION, CONTROVERSY, OR DISPUTE (TOGETHER, “CLAIM”) AND
          DAMAGES, KNOWN AND UNKNOWN, RELATING TO, ARISING OUT OF, OR IN ANY WAY
          CONNECTED WITH ANY SUCH CLAIM YOU HAVE AGAINST ANY THIRD PARTIES.
          <br />
          <br />
          Limitation of Liability — THE BUIDLER PARTIES WILL NOT BE LIABLE TO
          YOU FOR ANY LOST PROFITS OR CONSEQUENTIAL, SPECIAL, PUNITIVE,
          INDIRECT, OR INCIDENTAL DAMAGES RELATING TO, ARISING OUT OF, OR IN ANY
          WAY IN CONNECTION WITH OUR TERMS, US, OR OUR SERVICES, EVEN IF THE
          BUIDLER PARTIES HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
          OUR AGGREGATE LIABILITY RELATING TO, ARISING OUT OF, OR IN ANY WAY IN
          CONNECTION WITH OUR TERMS, US, OR OUR SERVICES WILL NOT EXCEED TEN
          DOLLARS ($10). THE FOREGOING DISCLAIMER OF CERTAIN DAMAGES AND
          LIMITATION OF LIABILITY WILL APPLY TO THE MAXIMUM EXTENT PERMITTED BY
          APPLICABLE LAW. THE LAWS OF SOME STATES OR JURISDICTIONS MAY NOT ALLOW
          THE EXCLUSION OR LIMITATION OF CERTAIN DAMAGES, SO SOME OR ALL OF THE
          EXCLUSIONS AND LIMITATIONS SET FORTH ABOVE MAY NOT APPLY TO YOU.
          NOTWITHSTANDING ANYTHING TO THE CONTRARY IN OUR TERMS, IN SUCH CASES,
          THE LIABILITY OF THE BUIDLER PARTIES WILL BE LIMITED TO THE FULLEST
          EXTENT PERMITTED BY APPLICABLE LAW.
          <br />
          <br />
        </span>
        <h2 className="page-content-head">
          7. Resolving Disputes and Ending Terms
        </h2>
        <span className="page-content-terms">
          Resolving disputes — You agree to resolve any Claim you have with us
          relating to or arising out of our Terms, us, or our Services
          exclusively in the state of Victoria, Australia. You also agree to
          submit to the personal jurisdiction of such courts for the purpose of
          litigating all such disputes. The laws of Australia govern our Terms,
          as well as any disputes, whether in court or arbitration, which might
          arise between Buidler and you, without regard to conflict of law
          provisions.
          <br />
          <br />
          Ending these Terms — You may end these Terms with Buidler at any time
          by deleting Buidler from your device and discontinuing use of our
          Services. We may modify, suspend, or terminate your access to or use
          of our Services anytime for any reason, such as if you violate the
          letter or spirit of our Terms or create harm, risk, or possible legal
          exposure for Buidler. The following provisions will survive
          termination of your relationship with Buidler: “Licenses,”
          “Disclaimers,” “Limitation of Liability,” “Resolving dispute,”
          “Availability” and “Ending these Terms,” and “General”.
        </span>
        <h2 className="page-content-head">8. These Terms</h2>
        <span className="page-content-terms">
          Buidler may update the Terms at any time. When we update our Terms, We
          will update the “Last Modified” date associated with the updated
          Terms. Your continued use of our Services confirms your acceptance of
          our updated Terms and supersedes any prior agreed Terms. You will
          comply with all applicable export control and trade sanctions laws.
          Our Terms cover the entire agreement between you and Buidler regarding
          our Services. If you do not agree with our Terms, you should stop
          using our Services.
          <br />
          <br />
          If we fail to enforce our Terms, we do not waive the right to enforce
          them. If any provision of the Terms is deemed unlawful, void, or
          unenforceable, that provision shall be deemed severable from our Terms
          and shall not affect the enforceability of the remaining provisions.
          Our Services are not intended for distribution to or use in any
          country where such distribution or use would violate local law or
          would subject us to any regulations in another country. If you have
          specific questions about these Terms, please contact us at{" "}
          <b>hello@buidler.app</b>
        </span>
        <span className="page-content-head">
          Buidler iOS – End User License Agreement
        </span>
        <span className="page-content-terms">
          By using the Buidler iOS app (“App”), you not only agree to the Terms
          of Service and Privacy Policy of Buidler, but also this End User
          License Agreement (“EULA”).
          <br />
          <br />
          <b>1. Acknowledgement: </b>You acknowledge that this EULA is concluded
          between LAG Foundation Ltd (“Buidler”), and not with Apple, Inc
          (“Apple”), and Buidler, not Apple, is solely responsible for the
          Licensed Application and the content thereof.
          <br />
          <br />
          <b>2. Scope of License: </b>Subject to your compliance with our Terms
          of Service, Buidler grants you a limited, non-exclusive,
          non-transferable, revocable license to download and use the App.
          <br />
          <br />
          <b>3. Maintenance and Support: </b>Buidler provides no guarantee that
          We will supply you with maintenance or support beyond what already
          exists on our documentation and github pages. Apple has no obligation
          whatsoever to furnish any maintenance and support services with
          respect to the App.
          <br />
          <br />
          <b>4. Warranty: </b>Our warrant can be found in our Terms of Service,
          which you agree to. In the event of any failure of the Licensed
          Application to conform to the warranty, You may notify Apple, and
          Apple will refund the purchase price for the App. To the maximum
          extent permitted by applicable law, Apple will have no other warranty
          obligation whatsoever with respect to the App, and any other claims,
          losses, liabilities, damages, costs or expenses attributable to any
          failure to conform to any warranty will be handled in accordance with
          the Buidler Terms of Service.
          <br />
          <br />
          <b>5. Product Claims: </b>Buidler, and not Apple, is responsible for
          addressing any claims relating to the App or its use, including, but
          not limited to: (i) product liability claims; (ii) any claim that the
          Licensed Application fails to conform to any applicable legal or
          regulatory requirement; and (iii) claims arising under consumer
          protection, privacy, or similar legislation. This is handled in
          accordance with the Buidler Terms of Service.
          <br />
          <br />
          <b>6. Intellectual Property Rights: </b>Buidler, and not Apple, is
          responsible for all intellectual property issues associated with the
          app. This is covered in our Terms of Service.
          <br />
          <br />
          <b>7. Legal Compliance: </b>You represent and warrant that (i) he/she
          is not located in a country that is subject to a U.S. Government
          embargo, or that has been designated by the U.S. Government as a
          “terrorist supporting” country; and (ii) he/she is not listed on any
          U.S. Government list of prohibited or restricted parties.
          <br />
          <br />
          <b>8. Developer Name and Address: </b>If you have questions about the
          Terms of Service or this EULA, you may email <b>hello@buidler.app</b>
          <br />
          <br />
          <b>9. Third Party Terms of Agreement: </b>You must comply with
          applicable third party terms of agreement when using the App, if any
          such third party applications exist.
          <br />
          <br />
          <b>10. Third Party Beneficiary: </b>Buidler and You acknowledge and
          agree that Apple, and Apple’s subsidiaries, are third party
          beneficiaries of this EULA, and that, upon Your acceptance of the
          Terms of Service and this EULA, Apple will have the right (and will be
          deemed to have accepted the right) to enforce the EULA against You as
          a third party beneficiary thereof.
          <br />
          <br />
          <b>11. Unacceptable Content: </b>You acknowledge that you are subject
          to acceptable content policies within Community and other areas on the
          app and must not use the App to distribute objectionable content. If
          you are deemed an abusive user you may also be restricted or removed
          from Communities or the App if reported or discovered.
        </span>
        <h2 className="page-content-head">Conclusion</h2>
        <span className="page-content-terms">
          This page outlines the Terms of Service for the Buidler app, services,
          and website, as well as the End User License Agreement for iOS. If
          you’d like to read more about how we handle your privacy, you can
          check out the Buidler privacy policy. If you have any questions,
          opinions, or concerns about Buidler’s Terms, please get in touch with
          us via email at
          <b>hello@buidler.app</b>.
        </span>
      </div>
      <Footer />
    </div>
  );
};

export default memo(Terms);
