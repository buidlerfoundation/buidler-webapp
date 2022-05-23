import images from './images';

const Prefix = 'Buidler';

const AppConfig = {
  baseUrl: 'https://api.remotetoday.app/',
  stagingBaseUrl: 'https://testnet.buidler.app/',
  // baseUrl: 'http://127.0.0.1:8888/',
};

export default AppConfig;

export const AsyncKey = {
  accessTokenKey: `${Prefix}_access_token`,
  lastChannelId: `${Prefix}_last_channel_id`,
  lastTeamId: `${Prefix}_last_team_id`,
  ivKey: `${Prefix}_iv_key`,
  encryptedDataKey: `${Prefix}_encrypted_data_key`,
  encryptedSeedKey: `${Prefix}_encrypted_seed_key`,
  channelPrivateKey: `${Prefix}_channel_private_key`,
  deviceCode: `${Prefix}_device_code`,
  lastTimeFocus: `${Prefix}_last_time_focus`,
};

export const ProgressStatus = [
  {
    title: 'Pinned',
    type: 'pinned',
    icon: images.icStatusPinned,
    id: 'pinned',
  },
  { title: 'Todo', type: 'todo', icon: images.icCheckOutline, id: 'todo' },
  { title: 'Doing', type: 'doing', icon: images.icCheckDoing, id: 'doing' },
  { title: 'Done', type: 'done', icon: images.icCheckDone, id: 'done' },
  {
    title: 'Archived',
    type: 'archived',
    icon: images.icCheckArchived,
    id: 'archived',
  },
];

export const seedExample =
  'sadness neither jungle loyal swarm cigar horror choice joy brick ill pen';
