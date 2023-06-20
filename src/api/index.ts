import * as User from "./User";
import * as Upload from "./Upload";
import * as Notification from "./Notification";
import * as Message from "./Message";

const api = {
  ...User,
  ...Upload,
  ...Notification,
  ...Message,
};

export default api;
