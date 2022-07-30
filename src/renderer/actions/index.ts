import * as ConfigActions from "./ConfigActions";
import * as UserActions from "./UserActions";
import * as TaskActions from "./TaskActions";
import * as ReactActions from "./ReactActions";
import * as MessageActions from "./MessageActions";
import * as ActivityActions from "./ActivityActions";
import * as TransactionActions from "./TransactionActions";
import { ActionCreatorsMapObject } from "redux";

const actions: ActionCreatorsMapObject<any> = {
  ...ConfigActions,
  ...UserActions,
  ...TaskActions,
  ...ReactActions,
  ...MessageActions,
  ...ActivityActions,
  ...TransactionActions,
};

export default actions;
