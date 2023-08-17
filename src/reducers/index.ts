import AnalyticReducers from "./AnalyticReducers";
import CollectibleReducers from "./CollectibleReducers";
import ConfigReducers from "./ConfigReducers";
import MessageReducers from "./MessageReducers";
import NetworkReducers from "./NetworkReducers";
import NotificationReducers from "./NotificationReducers";
import OutsideReducers from "./OutsideReducers";
import PinPostReducers from "./PinPostReducers";
import ReactReducers from "./ReactReducers";
import SessionReducers from "./SessionReducers";
import StoryReducers from "./StoryReducers";
import TransactionReducers from "./TransactionReducers";
import UserReducers from "./UserReducers";
import { combineReducers } from "redux";

const reducers = combineReducers({
  user: UserReducers,
  network: NetworkReducers,
  configs: ConfigReducers,
  collectible: CollectibleReducers,
  transaction: TransactionReducers,
  notification: NotificationReducers,
  message: MessageReducers,
  react: ReactReducers,
  session: SessionReducers,
  pinPost: PinPostReducers,
  outside: OutsideReducers,
  story: StoryReducers,
  analytic: AnalyticReducers,
});

export default reducers;
