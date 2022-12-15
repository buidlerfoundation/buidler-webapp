import { UserData, UserRoleType } from "renderer/models";
import images from "./images";

const Prefix = "Buidler";

const AppConfig = {
  apiBaseUrl: process.env.REACT_APP_API_BASE_URL,
  maxLengthSpaceDescription: 450,
  maxLengthCommunityDescription: 1000,
  maximumFileSize: 100000000,
  etherscanUrl:
    process.env.REACT_APP_DEFAULT_CHAIN_ID === "4"
      ? "https://rinkeby.etherscan.io"
      : "https://etherscan.io",
  buidlerCommunityId: "c9097f50-9f0b-4e0a-a042-ab7790aff3b0",
  estimateGasRecipientAddress: "0x1908bf9Dae06BB1F6E4C7eE0f7B5D4c82D1Ba6ad",
};

export default AppConfig;

export const AsyncKey = {
  accessTokenKey: `${Prefix}_access_token`,
  refreshTokenKey: `${Prefix}_refresh_token`,
  lastChannelId: `${Prefix}_last_channel_id`,
  lastTeamId: `${Prefix}_last_team_id`,
  ivKey: `${Prefix}_iv_key`,
  encryptedDataKey: `${Prefix}_encrypted_data_key`,
  encryptedSeedKey: `${Prefix}_encrypted_seed_key`,
  channelPrivateKey: `${Prefix}_channel_private_key`,
  deviceCode: `${Prefix}_device_code`,
  lastTimeFocus: `${Prefix}_last_time_focus`,
  generatedPrivateKey: `${Prefix}_generated_private_key`,
  loginType: `${Prefix}_login_key`,
  socketConnectKey: `${Prefix}_socket_connect_key`,
  tokenExpire: `${Prefix}_token_expire_key`,
  refreshTokenExpire: `${Prefix}_refresh_token_expire_key`,
  spaceToggleKey: `${Prefix}_space_toggle_key`,
};

export const ProgressStatus = [
  {
    title: "Pinned",
    type: "pinned",
    icon: images.icStatusPinned,
    id: "pinned",
  },
  { title: "Todo", type: "todo", icon: images.icCheckOutline, id: "todo" },
  { title: "Doing", type: "doing", icon: images.icCheckDoing, id: "doing" },
  { title: "Done", type: "done", icon: images.icCheckDone, id: "done" },
  {
    title: "Archived",
    type: "archived",
    icon: images.icCheckArchived,
    id: "archived",
  },
];

export const seedExample =
  "sadness neither jungle loyal swarm cigar horror choice joy brick ill pen";

export const LoginType = {
  WalletConnect: "WalletConnect",
  WalletImport: "WalletImport",
  Metamask: "Metamask",
};

export const SpaceBadge = [
  { id: 1, color: "#56C195", backgroundColor: "#56C1951A" },
  { id: 2, color: "#6DC8EF", backgroundColor: "#6DC8EF1A" },
  { id: 3, color: "#8A8FFF", backgroundColor: "#8A8FFF1A" },
  { id: 4, color: "#B950F2", backgroundColor: "#A245D41A" },
  { id: 5, color: "#ED474D", backgroundColor: "#E3454B1A" },
  { id: 6, color: "#ED6217", backgroundColor: "#ED62171A" },
  { id: 7, color: "#F19B91", backgroundColor: "#F19B911A" },
  { id: 8, color: "#FCB828", backgroundColor: "#FCB8281A" },
];

export const UserRole: {
  Owner: UserRoleType;
  Admin: UserRoleType;
  Member: UserRoleType;
} = {
  Owner: "owner",
  Admin: "admin",
  Member: "member",
};

export const importantApis = [
  { uri: "get-space", exact: false },
  { uri: "get-channel", exact: false },
  { uri: "get-user/team", exact: true },
  { uri: "get-user", exact: true },
  { uri: "post-user/refresh", exact: true },
];

export const whiteListRefreshTokenApis = [
  "get-initial",
  "post-user/refresh",
  "post-user/address",
  "post-user",
  "delete-user/device",
];

export const DeletedUser: UserData = {
  user_id: "",
  user_name: "Deleted User",
  avatar_url: "",
};
