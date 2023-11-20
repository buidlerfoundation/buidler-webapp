import useFeedFilters from "hooks/useFeedFilters";
import React, { memo, useEffect, useMemo, useRef } from "react";
import { useLocation } from "react-router-dom";

const ScrollRestoration = () => {
  const location = useLocation();
  const timeoutScroll = useRef<any>();
  const previousPath = useRef(window.location.pathname);
  const filters = useFeedFilters();
  const lastScrollOffsetByPath = useRef<{ [path: string]: number }>({});
  const saveScrollOffset = useMemo(
    () => filters.find((el) => el.path === location.pathname),
    [filters, location.pathname]
  );
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
    if (
      location.pathname &&
      location.pathname !== previousPath.current &&
      saveScrollOffset
    ) {
      if (lastScrollOffsetByPath.current[location.pathname] >= 0) {
        setTimeout(() => {
          window?.scrollTo?.({
            top: lastScrollOffsetByPath.current[location.pathname],
            behavior: "auto",
          });
        }, 0);
      }
      previousPath.current = location.pathname;
    } else {
      window?.scrollTo?.({
        top: 0,
        behavior: "auto",
      });
    }
  }, [location.pathname, saveScrollOffset]);
  useEffect(() => {
    lastScrollOffsetByPath.current = {};
  }, []);
  return null;
};

export default memo(ScrollRestoration);
