import React, { useRef } from "react";
import Dropzone from "react-dropzone";
import ImageHelper from "renderer/common/ImageHelper";
import images from "renderer/common/images";
import "./index.scss";

type AvatarUploadProps = {
  onAddFiles: (fs: any) => void;
  recentFiles: Array<any>;
  onSelectRecentFile?: (file: any) => void;
};

const AvatarUpload = ({
  onAddFiles,
  recentFiles,
  onSelectRecentFile,
}: AvatarUploadProps) => {
  const inputFileRef = useRef<any>();
  const openFile = () => {
    inputFileRef.current?.click();
  };
  return (
    <Dropzone onDrop={onAddFiles} multiple={false}>
      {({ getRootProps, getInputProps }) => (
        <div className="avatar-upload__container" {...getRootProps()}>
          <div className="button-upload normal-button" onClick={openFile}>
            <div className="icon-camera">
              <img src={images.icCameraDark} alt="" />
            </div>
            <span className="upload-label">Upload icon</span>
          </div>
          {recentFiles.length > 0 && (
            <div className="recent__wrapper">
              <span className="recent-label">Recent use</span>
              <div className="recent-photos hide-scroll-bar">
                {recentFiles.map((el) => (
                  <div
                    className="photo-item normal-button"
                    key={el.file_id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectRecentFile?.(el);
                    }}
                  >
                    <img
                      src={ImageHelper.normalizeImage(el.file_url, el.team_id, {
                        w: 91,
                        h: 91,
                        radius: 12,
                      })}
                      alt=""
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
          <input
            {...getInputProps()}
            ref={inputFileRef}
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

export default AvatarUpload;
