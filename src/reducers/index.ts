import CollectibleReducers from "./CollectibleReducers";
import ConfigReducers from "./ConfigReducers";
import MessageReducers from "./MessageReducers";
import NetworkReducers from "./NetworkReducers";
import NotificationReducers from "./NotificationReducers";
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
});

export default reducers;