import React, { memo, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

interface IScrollRestoration {
  scrollElement: any;
}

const ScrollRestoration = ({ scrollElement }: IScrollRestoration) => {
  const location = useLocation();
  const timeoutScroll = useRef<any>();
  const previousPath = useRef(window.location.pathname);
  const lastScrollOffsetByPath = useRef<{ [path: string]: number }>({});
  useEffect(() => {
    const scrollEvent = (e: any) => {
      const { scrollTop } = e.target;
      if (timeoutScroll.current) {
        clearTimeout(timeoutScroll.current);
      }
      timeoutScroll.current = setTimeout(() => {
        lastScrollOffsetByPath.current[previousPath.current] = scrollTop;
      }, 300);
    };
    scrollElement?.addEventListener?.("scroll", scrollEvent);
    return () => {
      scrollElement?.removeEventListener?.("scroll", scrollEvent);
    };
  }, [scrollElement]);
  useEffect(() => {
    if (location.pathname && location.pathname !== previousPath.current) {
      if (lastScrollOffsetByPath.current[location.pathname]) {
        setTimeout(() => {
          scrollElement?.scrollTo?.({
            top: lastScrollOffsetByPath.current[location.pathname],
            behavior: "instant",
          });
        }, 0);
      }
      previousPath.current = location.pathname;
    }
  }, [location.pathname, scrollElement]);
  return null;
};

export default memo(ScrollRestoration);
