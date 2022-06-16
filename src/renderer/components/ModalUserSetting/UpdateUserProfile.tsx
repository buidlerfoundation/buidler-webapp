import React, { useCallback, useMemo, useRef, useState } from "react";
import api from "renderer/api";
import images from "renderer/common/images";
import Dropzone from "react-dropzone";
import { getUniqueId } from "renderer/helpers/GenerateUUID";
import { CircularProgress } from "@material-ui/core";
import ImageHelper from "renderer/common/ImageHelper";
import { UserData } from "renderer/models";
import AppInput from "../AppInput";

type NFTItemProps = {
  item: any;
  onUpdateNFT: (item: any) => void;
};

const NFTItem = ({ item, onUpdateNFT }: NFTItemProps) => {
  const handleClick = useCallback(() => {
    onUpdateNFT(item);
  }, [item, onUpdateNFT]);
  return (
    <div className="normal-button" onClick={handleClick}>
      <img src={item.image_thumbnail_url} alt="" className="ntf-avatar" />
    </div>
  );
};

type ENSItemProps = {
  item: any;
  onUpdateENS: (item: any) => void;
};

const ENSItem = ({ item, onUpdateENS }: ENSItemProps) => {
  const handleClick = useCallback(() => {
    onUpdateENS(item.name);
  }, [item.name, onUpdateENS]);
  return (
    <div className="ens-item normal-button" onClick={handleClick}>
      <span>{item.name}</span>
    </div>
  );
};

type UpdateUserProfileProps = {
  user?: UserData;
  userData?: any;
  onUpdateNFT: (nft: any) => void;
  onUpdateENS: (ens: any) => void;
  onUpdateAvatar: (url: string) => void;
  onUpdateUserName: (name: string) => void;
  collectibleData: { ens: Array<any>; nft: Array<any> };
  setUploading: (uploading: boolean) => void;
};

const UpdateUserProfile = ({
  user,
  userData,
  onUpdateNFT,
  onUpdateAvatar,
  onUpdateENS,
  onUpdateUserName,
  collectibleData,
  setUploading,
}: UpdateUserProfileProps) => {
  const inputRef = useRef() as React.MutableRefObject<HTMLInputElement>;
  const generateId = useRef<string>("");
  const [file, setFile] = useState<any>(null);
  const avatar = useMemo(
    () =>
      file?.attachment?.file ||
      ImageHelper.normalizeImage(
        userData?.nftAsset?.image_url || userData?.avatarUrl,
        user?.user_id
      ),
    [
      file?.attachment?.file,
      user?.user_id,
      userData?.avatarUrl,
      userData?.nftAsset?.image_url,
    ]
  );
  const handleAvatarClick = useCallback(() => inputRef.current?.click(), []);
  const handleUpdateNFT = useCallback(
    (item: any) => {
      setFile(null);
      onUpdateAvatar("");
      onUpdateNFT(item);
    },
    [onUpdateAvatar, onUpdateNFT]
  );
  const handleClearENS = useCallback(() => onUpdateENS(null), [onUpdateENS]);
  const handleChangeName = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (userData.ensAsset) {
        onUpdateENS(null);
      }
      onUpdateUserName(e.target.value);
    },
    [onUpdateENS, onUpdateUserName, userData.ensAsset]
  );
  const onAddFiles = useCallback(
    (files: any) => {
      if (files == null) return;
      if (generateId.current === "") {
        generateId.current = getUniqueId();
      }
      const data = [...files];
      if (data.length === 0) return;
      const f = data[0];
      const attachment = {
        file: URL.createObjectURL(f),
        randomId: Math.random(),
        loading: true,
        type: f.type,
      };
      setUploading(true);
      setFile({ attachment, loading: true });
      api
        .uploadFile(undefined, user?.user_id, f)
        .then((res) => {
          if (res.statusCode === 200) {
            onUpdateAvatar(res.data?.file_url || "");
            setFile({ attachment, loading: false, url: res.data?.file_url });
          } else {
            setFile(null);
          }
          setUploading(false);
          return null;
        })
        .catch((err) => console.log(err));
    },
    [onUpdateAvatar, setUploading, user?.user_id]
  );
  const handleChangeFile = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onAddFiles(e.target.files);
      e.target.value = "";
    },
    [onAddFiles]
  );
  return (
    <Dropzone onDrop={onAddFiles} multiple={false}>
      {({ getRootProps, getInputProps }) => (
        <div {...getRootProps()}>
          <span className="modal-label">User Profile</span>
          <div className="setting-avatar-view">
            <div className="user-avatar__wrapper" onClick={handleAvatarClick}>
              {avatar ? (
                <img className="user-avatar" src={avatar} alt="" />
              ) : (
                <div className="user-avatar" />
              )}
              {file?.loading && (
                <div className="attachment-loading">
                  <CircularProgress />
                </div>
              )}
              <img className="ic-camera" src={images.icCameraDark} alt="" />
            </div>
            {collectibleData.nft.length > 0 && (
              <div className="nft-avatar__wrapper">
                <span className="nft-avatar-des">
                  NFTs can be used as avatar in Buidler
                </span>
                <div className="nft-view">
                  {collectibleData.nft.map((el: any) => (
                    <NFTItem
                      item={el}
                      key={el.token_id}
                      onUpdateNFT={handleUpdateNFT}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="user-name-wrapper">
            {userData.ensAsset ? (
              <div className="ens-input">
                <div className="ens-signal">
                  <span>ENS</span>
                </div>
                <span className="ens-user-name">{userData.ensAsset}</span>
                <div
                  className="normal-button icon-clear"
                  onClick={handleClearENS}
                >
                  <img src={images.icCircleClose} alt="" />
                </div>
              </div>
            ) : (
              <AppInput
                className="app-input-highlight"
                placeholder="Enter your name"
                onChange={handleChangeName}
                value={userData?.userName}
              />
            )}
            {collectibleData.ens.length > 0 && (
              <>
                <div className="ens-view">
                  {collectibleData.ens.map((el: any) => (
                    <ENSItem
                      item={el}
                      key={el.name}
                      onUpdateENS={onUpdateENS}
                    />
                  ))}
                </div>
                <span className="ens-description">
                  ENS name can also be used in Buidler
                </span>
              </>
            )}
          </div>
          <input
            {...getInputProps()}
            ref={inputRef}
            accept="image/*"
            onChange={handleChangeFile}
          />
        </div>
      )}
    </Dropzone>
  );
};

export default UpdateUserProfile;
