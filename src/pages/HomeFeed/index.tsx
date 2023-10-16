import React, { memo, useCallback } from "react";
import styles from "./index.module.scss";
import { ICast, IFCFilterType } from "models/FC";
import FeedItem from "shared/FeedItem";
import Spinner from "shared/Spinner";
import useFeedFilters from "hooks/useFeedFilters";
import useFeedFilter from "hooks/useFeedFilter";
import useFeedData from "hooks/useFeedData";
import useAppDispatch from "hooks/useAppDispatch";
import { HOME_FEED_ACTIONS, getFeed } from "reducers/HomeFeedReducers";
import LoadingItem from "shared/LoadingItem";

interface IFilterItem {
  item: IFCFilterType;
  onClick: (item: IFCFilterType) => void;
  active: boolean;
}

const FilterItem = ({ item, onClick, active }: IFilterItem) => {
  const handleClick = useCallback(() => onClick(item), [item, onClick]);
  return (
    <div
      className={`${styles["filter-item"]} ${
        active ? styles["filter-active"] : ""
      }`}
      onClick={handleClick}
    >
      {item.label}
    </div>
  );
};

const FilterItemMemo = memo(FilterItem);

const HomeFeed = () => {
  const dispatch = useAppDispatch();
  const filters = useFeedFilters();
  const filter = useFeedFilter();
  const feedData = useFeedData();
  const onUpdateFilter = useCallback(
    (item: IFCFilterType) => {
      dispatch(HOME_FEED_ACTIONS.updateFilter(item));
    },
    [dispatch]
  );
  const renderFilter = useCallback(
    (item: IFCFilterType) => (
      <FilterItemMemo
        item={item}
        key={item.id}
        onClick={onUpdateFilter}
        active={filter.id === item.id}
      />
    ),
    [filter.id, onUpdateFilter]
  );
  const renderFeed = useCallback(
    (cast: ICast) => <FeedItem key={cast.hash} cast={cast} />,
    []
  );
  const onMoreFeed = useCallback(() => {
    dispatch(
      getFeed({
        type: filter.label,
        page: (feedData?.currentPage || 1) + 1,
        limit: 20,
      })
    );
  }, [dispatch, feedData?.currentPage, filter.label]);
  const onScroll = useCallback(
    (e: any) => {
      const { scrollTop, scrollHeight, clientHeight } = e.target;
      const compare = Math.round(scrollTop + clientHeight);
      if (
        (compare === scrollHeight + 1 || compare === scrollHeight) &&
        feedData?.canMore &&
        !feedData?.loadMore
      ) {
        onMoreFeed();
      }
    },
    [feedData?.canMore, feedData?.loadMore, onMoreFeed]
  );
  const renderBody = useCallback(() => {
    if (feedData?.data?.length > 0) {
      return (
        <div className={styles.list} onScroll={onScroll}>
          {feedData?.data?.map(renderFeed)}
          {feedData.loadMore && <LoadingItem />}
        </div>
      );
    }
    if (feedData?.loading) {
      return <Spinner size={30} />;
    }
    // empty
    return null;
  }, [
    feedData?.data,
    feedData?.loadMore,
    feedData?.loading,
    onScroll,
    renderFeed,
  ]);
  return (
    <div className={styles.container}>
      <div className={styles["filter-head"]}>{filters.map(renderFilter)}</div>
      {renderBody()}
    </div>
  );
};

export default memo(HomeFeed);
