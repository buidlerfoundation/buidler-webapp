import React, { memo, useEffect, useMemo, useRef } from "react";
import styles from "./index.module.scss";
import { IFCUser, IPagingData } from "models/FC";
import TopInteractionTable from "./TopInteractionTable";
import GoogleAnalytics from "services/analytics/GoogleAnalytics";

interface ITopInteractions {
  data?: IPagingData<IFCUser>;
}

const TopInteractions = ({ data }: ITopInteractions) => {
  const users = useMemo(() => data?.data || [], [data?.data]);
  const rendered = useMemo(() => users.length > 0, [users.length]);
  const ref = useRef<any>();
  const timeoutTracking = useRef<any>();
  useEffect(() => {
    if (rendered) {
      const handleIntersection = (entries: any, observer: any) => {
        entries.forEach((entry: any) => {
          if (entry.isIntersecting) {
            timeoutTracking.current = setTimeout(() => {
              GoogleAnalytics.tracking("Top Interaction Viewed", {
                category: "Insights",
              });
            }, 2000);
          } else {
            if (timeoutTracking.current) {
              clearTimeout(timeoutTracking.current);
            }
          }
        });
      };
      const observer = new IntersectionObserver(handleIntersection, {
        threshold: 0.8,
      });
      const topInteractionEl = ref.current;
      if (topInteractionEl) {
        observer.observe(topInteractionEl);
      }
    }
  }, [rendered]);
  if (users.length === 0) return null;
  return (
    <div className={styles["top-interaction-wrap"]} ref={ref}>
      <span className={styles.label}>Top interactions</span>
      <TopInteractionTable data={users} />
    </div>
  );
};

export default memo(TopInteractions);
