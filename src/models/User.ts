import { ethers } from "ethers";

export interface TransactionApiData {
  block_number: string;
  time_stamp: string;
  hash: string;
  nonce: string;
  block_hash: string;
  from: string;
  contract_address: string;
  to: string;
  value: string;
  token_name: string;
  token_symbol: string;
  token_decimal: string;
  transaction_index: string;
  gas: string;
  gas_price: string;
  gas_used: string;
  cumulative_gas_used: string;
  input: string;
  confirmations: string;
  receipt_status: string;
}

export interface Contract {
  contract_address: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  owner: string;
  is_potential: boolean;
  is_supported: boolean;
  logo: string;
  network: string;
}

export interface TokenPrice {
  current_price: number;
  id: string;
  image: string;
}

export interface Token {
  contract: Contract;
  balance: number;
  price?: TokenPrice;
}

export interface BalanceApiData {
  address: string;
  tokens: Array<Token>;
  coins: Array<Token>;
}

export type AssetTypeItem = {
  label: string;
  id: string;
};

export type SendData = {
  recipientAddress?: string;
  asset?: Token | null;
  nft?: UserNFTCollection | null;
  amount?: number | string;
  amountUSD?: number | string;
  gasPrice?: ethers.BigNumber;
  gasLimit: ethers.BigNumber;
  recipientENS?: string | null;
  recipientUser?: UserData | null;
};

export interface ENSAsset {
  token_id: string;
  value: string;
  can_set_username: boolean;
  can_set_team_namespace: boolean;
  contract_address: string;
  network: string;
}

export interface SettingItem {
  label: string;
  icon: string;
  id: string;
}

export interface GroupSettingItem {
  id: string;
  groupLabel: string;
  items: Array<SettingItem>;
}

export type UserRoleType = "owner" | "admin" | "member";

export interface BaseDataApi<T> {
  success: boolean;
  data?: T;
  statusCode: number;
  message?: string;
  total?: number;
  token?: string;
  metadata?: {
    total?: number;
    encrypt_message_key?: string;
    can_loadmore_message_after?: boolean;
    can_loadmore_message_before?: boolean;
    is_new_team_member?: boolean;
  };
  refresh_token?: string;
  token_expire_at?: number;
  refresh_token_expire_at?: number;
}

export interface NFTCollectionDataApi {
  name: string;
  description?: string;
  contract_address: string;
  token_type: string;
  image_url: string;
  background_image_url: string;
  external_url: string;
  symbol: string;
  network: string;
  nfts: Array<UserNFTCollection>;
  slug: string;
  marketplaces: {
    [key: string]: {
      marketplace: string;
      last_ingested_at: string;
      name: string;
      safelist_request_status: string;
      slug?: string;
      floor_price?: number;
      external_url?: string;
    };
  };
}

export interface NFTCollection {
  name: string;
  description: string;
  contract_address: string;
  token_type: string;
  image_url: string;
  background_image_url: string;
  external_url: string;
  symbol: string;
  network: string;
  slug: string;
}

export type NFTDetailDataApi = {
  _id: string;
  contract_address: string;
  token_id: string;
  user_id: string;
  name: string;
  token_type: string;
  display_name: string;
  image_url: string;
  background_image_url: string;
  network: string;
  attributes: {
    _id: string;
    contract_address: string;
    token_id: string;
    trait_type: string;
    value: string;
    network: string;
  }[];
  collection: NFTCollectionDataApi;
  media: {
    bytes: number;
    format: string;
    gateway: string;
    raw: string;
    thumbnail: string;
  }[];
};

export interface UserNFTCollection {
  _id: string;
  name: string;
  description: string;
  contract_address: string;
  token_type: string;
  image_url: string;
  background_image_url: string;
  external_url: string;
  symbol: string;
  network: string;
  token_id: string;
  nft_collection?: NFTCollection;
  can_set_username?: boolean;
  can_set_avatar?: boolean;
  media: {
    bytes: number;
    format: string;
    gateway: string;
    raw: string;
    thumbnail: string;
  }[];
}

export interface UserData {
  avatar_url: string;
  encrypt_message_key?: string;
  is_verified_avatar?: boolean;
  is_verified_username?: boolean;
  nonce?: string;
  user_id: string;
  user_name: string;
  role?: string;
  status?: string;
  direct_channel?: string;
  user_channels?: Array<string>;
  user_bio?: string;
  address?: string;
  verified_avatar_asset_collection?: NFTCollectionDataApi;
  verified_username_asset_collection?: NFTCollectionDataApi;
  is_deleted?: boolean;
  total_unread_notifications?: number;
  direct_channel_id?: string;
  fetching?: boolean;
  public_key?: string;
}

export interface InitialApiData {
  force_update: boolean;
  img_domain: string;
  version: string;
  imgproxy: {
    bucket_name: string;
    domain: string;
  };
}

export interface ProfileApiData {
  profile: {
    user_id?: string;
    team_id?: string;
  };
}

export interface FileApiData {
  file_url: string;
  file: {
    attachment_id: string;
    createdAt: string;
    file_id: string;
    mimetype: string;
    original_name: string;
    team_id: string;
    updatedAt: string;
  };
}
