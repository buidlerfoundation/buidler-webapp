import * as ConfigActions from './ConfigActions';
import * as UserActions from './UserActions';
import * as TaskActions from './TaskActions';
import * as ReactActions from './ReactActions';
import * as MessageActions from './MessageActions';
import * as ActivityActions from './ActivityActions';
import { ActionCreatorsMapObject } from 'redux';

const actions: ActionCreatorsMapObject<any> = {
  ...ConfigActions,
  ...UserActions,
  ...TaskActions,
  ...ReactActions,
  ...MessageActions,
  ...ActivityActions,
};

export default actions;
