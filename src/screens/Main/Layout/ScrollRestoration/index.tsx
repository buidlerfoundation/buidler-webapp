import { usePathname } from "next/navigation";
import React, { memo, useEffect, useMemo, useRef } from "react";

const ScrollRestoration = () => {
  const pathname = usePathname();
  const timeoutScroll = useRef<any>();
  const previousPath = useRef("");
  const lastScrollOffsetByPath = useRef<{ [path: string]: number }>({});
  // const saveScrollOffset = useMemo(
  //   () =>
  //     [
  //       "/home",
  //       "/active",
  //       "/top",
  //       "/community-notes",
  //       "/community-notes/helpful",
  //       "/community-notes/need-rating",
  //       "/community-notes/need-context",
  //     ].includes(pathname),
  //   [pathname]
  // );
  useEffect(() => {
    const scrollEvent = () => {
      if (timeoutScroll.current) {
        clearTimeout(timeoutScroll.current);
      }
      timeoutScroll.current = setTimeout(() => {
        lastScrollOffsetByPath.current[previousPath.current] =
          document.documentElement.scrollTop;
      }, 300);
    };
    window?.addEventListener?.("scroll", scrollEvent);
    return () => {
      window?.removeEventListener?.("scroll", scrollEvent);
    };
  }, []);
  useEffect(() => {
    if (pathname && pathname !== previousPath.current) {
      if (lastScrollOffsetByPath.current[pathname] >= 0) {
        setTimeout(() => {
          window?.scrollTo?.({
            top: lastScrollOffsetByPath.current[pathname],
            behavior: "auto",
          });
        }, 0);
      }
      previousPath.current = pathname;
    } else {
      window?.scrollTo?.({
        top: 0,
        behavior: "auto",
      });
    }
  }, [pathname]);
  useEffect(() => {
    lastScrollOffsetByPath.current = {};
  }, []);
  return null;
};

export default memo(ScrollRestoration);
