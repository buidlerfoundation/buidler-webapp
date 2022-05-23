import * as User from './User';
import * as Team from './Team';
import * as Channel from './Channel';
import * as Task from './Task';
import * as Upload from './Upload';
import * as Reaction from './Reaction';
import * as Message from './Message';

export default {
  ...User,
  ...Team,
  ...Channel,
  ...Task,
  ...Upload,
  ...Reaction,
  ...Message,
};
