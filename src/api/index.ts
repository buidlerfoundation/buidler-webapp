import * as User from "./User";
import * as Upload from "./Upload";
import * as Notification from "./Notification";
import * as Message from "./Message";
import * as Reaction from "./Reaction"

const api = {
  ...User,
  ...Upload,
  ...Notification,
  ...Message,
  ...Reaction,
};

export default api;
