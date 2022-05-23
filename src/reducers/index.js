import { combineReducers } from 'redux';
import LoadingReducer from './loadingReducer';
import LoadMoreReducer from './loadMoreReducer';
import ErrorReducer from './errorReducer';
import ConfigReducers from './ConfigReducers';
import UserReducers from './UserReducers';
import TaskReducers from './TaskReducers';
import ReactReducers from './ReactReducers';
import MessageReducer from './MessageReducer';
import refreshReducer from './refreshReducer';
import activityReducer from './ActivityReducers';

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
});

const rootReducer = (state, action) => {
  // if (action.type === actions.userTypes.LOG_OUT) {
  //   state = undefined;
  // }
  return appReducer(state, action);
};

export default rootReducer;
