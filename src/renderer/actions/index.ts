import * as UserActions from "./UserActions";
import * as TaskActions from "./TaskActions";
import * as ReactActions from "./ReactActions";
import * as MessageActions from "./MessageActions";
import * as ActivityActions from "./ActivityActions";
import * as TransactionActions from "./TransactionActions";
import * as CollectibleActions from "./CollectibleActions";
import { ActionCreatorsMapObject } from "redux";

const actions: ActionCreatorsMapObject<any> = {
  ...UserActions,
  ...TaskActions,
  ...ReactActions,
  ...MessageActions,
  ...ActivityActions,
  ...TransactionActions,
  ...CollectibleActions,
};

export default actions;
