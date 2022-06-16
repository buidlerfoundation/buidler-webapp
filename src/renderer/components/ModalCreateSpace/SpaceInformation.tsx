import React, { memo, useCallback, useRef } from "react";
import AppConfig from "renderer/common/AppConfig";
import { CreateSpaceData } from "renderer/models";
import api from "renderer/api";
import { getUniqueId } from "renderer/helpers/GenerateUUID";
import ContentEditable, { ContentEditableEvent } from "react-contenteditable";
import GlobalVariable from "renderer/services/GlobalVariable";
import EmojiAndAvatarPicker from "../EmojiAndAvatarPicker";
import PopoverButton from "../PopoverButton";
import "./index.scss";
import AppInput from "../AppInput";
import SpaceIcon from "./SpaceIcon";
import useAppSelector from "renderer/hooks/useAppSelector";

type SpaceInformationProps = {
  setSpaceData: React.Dispatch<React.SetStateAction<CreateSpaceData>>;
  spaceData: CreateSpaceData;
  spaceId?: string;
};

const SpaceInformation = ({
  spaceData,
  setSpaceData,
  spaceId,
}: SpaceInformationProps) => {
  const currentTeam = useAppSelector((state) => state.user.currentTeam);
  const popupSpaceIconRef = useRef<any>();
  const handleEmojiPickerClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => e.stopPropagation(),
    []
  );
  const handleFocus = useCallback(() => {
    GlobalVariable.isInputFocus = true;
  }, []);
  const handleBlur = useCallback(() => {
    GlobalVariable.isInputFocus = false;
  }, []);
  const onAddFiles = useCallback(
    async (fs: any) => {
      if (fs == null || fs.length === 0) return;
      const id = spaceData.spaceId || getUniqueId();
      const file = [...fs][0];
      const attachment = {
        file: URL.createObjectURL(file),
        loading: true,
        type: file.type,
      };
      setSpaceData((current) => ({
        ...current,
        spaceId: id,
        attachment,
        emoji: null,
      }));
      const res = await api.uploadFile(currentTeam?.team_id, id, file);
      setSpaceData((current) => ({
        ...current,
        spaceId: id,
        attachment: {
          ...current.attachment,
          loading: false,
        },
        emoji: null,
        url: res.data?.file_url,
      }));
      popupSpaceIconRef.current?.hide();
    },
    [currentTeam?.team_id, setSpaceData, spaceData.spaceId]
  );
  const onAddEmoji = useCallback(
    async (emoji: any) => {
      setSpaceData((current) => ({
        ...current,
        attachment: null,
        emoji: emoji.id,
        url: null,
      }));
      popupSpaceIconRef.current?.hide();
    },
    [setSpaceData]
  );
  const onSelectRecentFile = useCallback(
    async (file: any) => {
      setSpaceData((current) => ({
        ...current,
        attachment: null,
        emoji: null,
        url: file.file_url,
      }));
    },
    [setSpaceData]
  );
  const handleUpdateName = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) =>
      setSpaceData((current) => ({
        ...current,
        name: e.target.value.toUpperCase(),
      })),

    [setSpaceData]
  );
  const handleUpdateDescription = useCallback(
    (e: ContentEditableEvent) => {
      if (e.target.value.length >= AppConfig.maxLengthSpaceDescription) return;
      setSpaceData((current) => ({ ...current, description: e.target.value }));
    },
    [setSpaceData]
  );
  return (
    <div className="space-information__container">
      <div className="title__wrap">
        <PopoverButton
          ref={popupSpaceIconRef}
          componentButton={<SpaceIcon spaceData={spaceData} showDefault />}
          componentPopup={
            <div
              className="emoji-picker__container"
              onClick={handleEmojiPickerClick}
            >
              <EmojiAndAvatarPicker
                onAddFiles={onAddFiles}
                onAddEmoji={onAddEmoji}
                spaceId={spaceId}
                onSelectRecentFile={onSelectRecentFile}
              />
            </div>
          }
        />
        <AppInput
          style={{ marginLeft: 15 }}
          className="app-input-highlight"
          placeholder="Space name"
          onChange={handleUpdateName}
          value={spaceData?.name}
          autoFocus
        />
      </div>
      <div className="space-description__wrap">
        <ContentEditable
          id="space-description-input"
          style={{ height: 370 }}
          html={spaceData.description || ""}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder="Description"
          className="space-description hide-scroll-bar"
          onChange={handleUpdateDescription}
        />
        <div className="description-limit">
          <span>
            {AppConfig.maxLengthSpaceDescription -
              (spaceData.description?.length || 0)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default memo(SpaceInformation);
