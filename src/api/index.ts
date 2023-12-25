import * as User from "./User";
import * as Upload from "./Upload";
import * as Notification from "./Notification";
import * as Message from "./Message";
import * as Reaction from "./Reaction";
import * as Community from "./Community";
import * as FC from "./FC";
import * as CommunityNote from "./CommunityNote";

const api = {
  ...User,
  ...Upload,
  ...Notification,
  ...Message,
  ...Reaction,
  ...Community,
  ...FC,
  ...CommunityNote,
};

export default api;
