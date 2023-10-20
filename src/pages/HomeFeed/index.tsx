import React, { memo, useCallback, useMemo } from "react";
import styles from "./index.module.scss";
import { ICast, IFCFilterType } from "models/FC";
import FeedItem from "shared/FeedItem";
import Spinner from "shared/Spinner";
import useFeedFilters from "hooks/useFeedFilters";
import useFeedFilter from "hooks/useFeedFilter";
import useFeedData from "hooks/useFeedData";
import useAppDispatch from "hooks/useAppDispatch";
import { HOME_FEED_ACTIONS } from "reducers/HomeFeedReducers";
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
  const onLogin = useCallback(() => {
    const loginElement = document.getElementById("btn-login");
    loginElement?.click();
  }, []);
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
    (cast: ICast) => <FeedItem key={cast.hash} cast={cast} onLogin={onLogin} />,
    [onLogin]
  );
  const feedDataFiltered = useMemo(
    () => feedData?.data?.filter?.((el) => !!el.metadata?.url) || [],
    [feedData?.data]
  );
  const renderBody = useCallback(() => {
    if (feedDataFiltered.length > 0) {
      return (
        <ol className={styles.list}>
          {feedDataFiltered.map(renderFeed)}
          {feedData?.loadMore && <LoadingItem />}
        </ol>
      );
    }
    if (feedData?.loading) {
      return <Spinner size={30} />;
    }
    // empty
    return null;
  }, [feedDataFiltered, feedData?.loadMore, feedData?.loading, renderFeed]);
  return (
    <div className={styles.container}>
      <nav className={styles["filter-head"]}>{filters.map(renderFilter)}</nav>
      {renderBody()}
    </div>
  );
};

export default memo(HomeFeed);
