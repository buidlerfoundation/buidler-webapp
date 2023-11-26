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
import FCUserReducers from "./FCUserReducers";
import { combineReducers } from "redux";
import FCCastReducers from "./FCCastReducers";
import HomeFeedReducers from "./HomeFeedReducers";
import InsightReducers from "./InsightReducers";

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
  fcUser: FCUserReducers,
  fcCast: FCCastReducers,
  homeFeed: HomeFeedReducers,
  insights: InsightReducers,
});

export default reducers;
