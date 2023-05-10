import { combineReducers } from "redux";
import LoadingReducer from "./loadingReducer";
import LoadMoreReducer from "./moreReducer";
import ErrorReducer from "./errorReducer";
import ConfigReducers from "./ConfigReducers";
import UserReducers from "./UserReducers";
import TaskReducers from "./TaskReducers";
import ReactReducers from "./ReactReducers";
import MessageReducer from "./MessageReducer";
import refreshReducer from "./refreshReducer";
import activityReducer from "./ActivityReducers";
import networkReducer from "./NetworkReducer";
import transactionReducer from "./TransactionReducer";
import toggleSidebarReducer from "./ToggleSidebarReducer";
import collectibleReducer from "./CollectibleReducers";
import notificationReducer from "./NotificationReducers";
import sideBarReducers from "./SideBarReducers";
import draftReducers from "./DraftReducers";

const appReducer = combineReducers({
  error: ErrorReducer,
  loading: LoadingReducer,
  configs: ConfigReducers,
  user: UserReducers,
  task: TaskReducers,
  reactReducer: ReactReducers,
  message: MessageReducer,
  loadMore: LoadMoreReducer,
  refresh: refreshReducer,
  activity: activityReducer,
  network: networkReducer,
  transaction: transactionReducer,
  toggleSidebar: toggleSidebarReducer,
  collectible: collectibleReducer,
  notification: notificationReducer,
  sideBar: sideBarReducers,
  draft: draftReducers,
});

const rootReducer = (state, action) => {
  return appReducer(state, action);
};

export default rootReducer;
