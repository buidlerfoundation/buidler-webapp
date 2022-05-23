import React, { useRef, useState } from 'react';
import api from 'api';
import images from 'common/images';
import AppInput from '../AppInput';
import Dropzone from 'react-dropzone';
import { getUniqueId } from 'helpers/GenerateUUID';
import { CircularProgress } from '@material-ui/core';
import ImageHelper from 'common/ImageHelper';

type UpdateUserProfileProps = {
  user?: any;
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
  const inputRef = useRef<any>();
  const generateId = useRef<string>('');
  const [file, setFile] = useState<any>(null);
  const avatar =
    file?.attachment?.file ||
    ImageHelper.normalizeImage(
      userData?.nftAsset?.image_url || userData?.avatarUrl,
      user?.user_id
    );
  const onAddFiles = (files: any) => {
    if (files == null) return;
    if (generateId.current === '') {
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
    api.uploadFile(undefined, user?.user_id, f).then((res) => {
      if (res.statusCode === 200) {
        onUpdateAvatar(res.file_url);
        setFile({ attachment, loading: false, url: res.file_url });
      } else {
        setFile(null);
      }
      setUploading(false);
      return null;
    });
  };
  return (
    <Dropzone onDrop={onAddFiles} multiple={false}>
      {({ getRootProps, getInputProps }) => (
        <div {...getRootProps()}>
          <span className="modal-label">User Profile</span>
          <div className="avatar-view">
            <div
              className="user-avatar__wrapper"
              onClick={() => inputRef.current?.click()}
            >
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
                    <div
                      className="normal-button"
                      onClick={() => {
                        setFile(null);
                        onUpdateAvatar('');
                        onUpdateNFT(el);
                      }}
                      key={el.token_id}
                    >
                      <img
                        src={el.image_thumbnail_url}
                        alt=""
                        className="ntf-avatar"
                      />
                    </div>
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
                  onClick={() => onUpdateENS(null)}
                >
                  <img src={images.icCircleClose} alt="" />
                </div>
              </div>
            ) : (
              <AppInput
                className="app-input-highlight"
                placeholder="Enter your name"
                onChange={(e) => {
                  if (userData.ensAsset) {
                    onUpdateENS(null);
                  }
                  onUpdateUserName(e.target.value);
                }}
                value={userData?.userName}
              />
            )}
            {collectibleData.ens.length > 0 && (
              <>
                <div className="ens-view">
                  {collectibleData.ens.map((el: any) => (
                    <div
                      className="ens-item normal-button"
                      onClick={() => {
                        onUpdateENS(el.name);
                      }}
                      key={el.token_id}
                    >
                      <span>{el.name}</span>
                    </div>
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
            onChange={(e: any) => {
              onAddFiles(e.target.files);
              e.target.value = null;
            }}
          />
        </div>
      )}
    </Dropzone>
  );
};

export default UpdateUserProfile;
