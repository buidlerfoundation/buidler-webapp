import React, { ReactNode, memo, useMemo } from "react";
import styles from "./index.module.scss";
import Link from "next/link";
import IconBuidlerLogo from "shared/SVG/IconBuidlerLogo";
import { usePathname } from "next/navigation";

interface INavbarMobile {
  openMenu: boolean;
  toggleMenu: () => void;
  communityNote?: boolean;
  renderMenu: (hideCommunityNoteFilter?: boolean) => ReactNode;
}

const NavbarMobile = ({
  openMenu,
  toggleMenu,
  communityNote,
  renderMenu,
}: INavbarMobile) => {
  const pathname = usePathname();
  const showMobileMenu = useMemo(() => {
    if (communityNote) {
      return [
        "/community-notes/need-rating",
        "/community-notes/helpful",
        "/community-notes/need-context",
        "/community-notes/explore",
        "/community-notes/contribute",
      ].includes(pathname);
    }
    return ["/home", "/insights", "/active", "/top"].includes(pathname);
  }, [communityNote, pathname]);
  if (!showMobileMenu) return null;
  return (
    <div
      className={`${styles["nav-mobile-wrap"]} ${
        openMenu ? styles["nav-mobile-wrap-on"] : ""
      }`}
    >
      <div className={styles["nav-mobile"]}>
        <Link
          className={styles["mobile-brand-wrap"]}
          href={communityNote ? "/community-notes" : "/home"}
        >
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 4,
              overflow: "hidden",
            }}
          >
            <IconBuidlerLogo size={30} />
          </div>
          <span style={{ margin: "0 10px" }}>Buidler</span>
          {communityNote && <div className={styles["beta-tag"]}>beta</div>}
        </Link>
        <div className={styles["side-menu"]} onClick={toggleMenu}>
          <div className={styles["line-1"]} />
          <div className={styles["line-2"]} />
        </div>
      </div>
      {renderMenu(true)}
    </div>
  );
};

export default memo(NavbarMobile);
