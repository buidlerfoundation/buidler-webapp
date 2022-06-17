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
});

const rootReducer = (state, action) => {
  return appReducer(state, action);
};

export default rootReducer;
