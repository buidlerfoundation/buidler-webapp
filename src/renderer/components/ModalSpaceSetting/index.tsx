import { Modal } from "@material-ui/core";
import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { updateSpaceChannel } from "renderer/actions/UserActions";
import api from "renderer/api";
import { SpaceBadge } from "renderer/common/AppConfig";
import ImageHelper from "renderer/common/ImageHelper";
import images from "renderer/common/images";
import { getSpaceBackgroundColor } from "renderer/helpers/SpaceHelper";
import useAppDispatch from "renderer/hooks/useAppDispatch";
import useAppSelector from "renderer/hooks/useAppSelector";
import { CreateSpaceData, Space, UserNFTCollection } from "renderer/models";
import SpaceConfig from "../ModalCreateSpace/SpaceConfig";
import SpaceInformation from "../ModalCreateSpace/SpaceInformation";
import NormalButton from "../NormalButton";
import "./index.scss";

type ModalSpaceSettingProps = {
  open: boolean;
  handleClose: () => void;
  onDeleteClick: () => void;
  space?: Space | null;
};

const ModalSpaceSetting = ({
  open,
  handleClose,
  onDeleteClick,
  space,
}: ModalSpaceSettingProps) => {
  const dispatch = useAppDispatch();
  const currentTeam = useAppSelector((state) => state.user.currentTeam);
  const [loading, setLoading] = useState(false);
  const [spaceData, setSpaceData] = useState<CreateSpaceData>({
    name: "",
    description: "",
    attachment: null,
    emoji: null,
    spaceType: "Exclusive",
    condition: null,
  });
  const [nftCollections, setNFTCollections] = useState<
    Array<UserNFTCollection>
  >([]);
  const [currentPageId, setCurrentPageId] = useState("space_display");
  const fetchNFTCollections = useCallback(async () => {
    const res = await api.getNFTCollection();
    setNFTCollections(res?.data || []);
  }, []);
  const initSpaceData = useCallback(async () => {
    if (space) {
      const res = await api.getSpaceCondition(space?.space_id);
      const conditions = res.data || [];
      setSpaceData({
        name: space?.space_name,
        description: space?.space_description || "",
        attachment: null,
        emoji: space?.space_emoji,
        spaceType: space?.space_type === "Public" ? "Public" : "Exclusive",
        url: space?.space_image_url,
        condition:
          conditions?.length > 0
            ? {
                address: conditions?.[0]?.contract_address,
                amountInput: conditions?.[0]?.amount?.toString() || "",
                amount: 0,
                name: conditions?.[0]?.nft_collection?.name,
                image_url: conditions?.[0]?.nft_collection?.image_url,
              }
            : null,
        spaceBadgeId: SpaceBadge.find((el) => el.color === space.icon_color)
          ?.id,
      });
    }
  }, [space]);
  const settings = useRef([
    {
      id: "1",
      groupLabel: "Space",
      items: [
        {
          label: "Space display",
          icon: images.icSettingSpaceDisplay,
          id: "space_display",
        },
        {
          label: "Space access",
          icon: images.icSettingSpaceAccess,
          id: "space_access",
        },
      ],
    },
  ]);
  const handleDeleteClick = useCallback(() => {
    onDeleteClick();
  }, [onDeleteClick]);
  useEffect(() => {
    if (open) {
      initSpaceData();
      fetchNFTCollections();
      setCurrentPageId("space_display");
    }
  }, [open, initSpaceData, fetchNFTCollections]);
  const onSave = useCallback(async () => {
    if (spaceData.attachment?.loading) {
      toast.error("Waiting for upload attachment");
    } else if (space?.space_id) {
      const badge = SpaceBadge.find((el) => el.id === spaceData.spaceBadgeId);
      setLoading(true);
      const body: any = {
        space_name: spaceData.name,
        space_type: spaceData.spaceType === "Exclusive" ? "Private" : "Public",
        space_emoji: spaceData.emoji,
        space_image_url: spaceData.url,
        space_description: spaceData.description,
      };
      if (spaceData.url) {
        const url = ImageHelper.normalizeImage(
          spaceData.url,
          currentTeam.team_id
        );
        const colorAverage = await getSpaceBackgroundColor(url);
        body.space_background_color = colorAverage;
      }
      if (spaceData.spaceType === "Exclusive") {
        body.icon_color = badge?.color;
        body.icon_sub_color = badge?.backgroundColor;
        if (spaceData.condition) {
          body.space_conditions = [
            {
              network: spaceData.condition?.network,
              contract_address: spaceData.condition?.address,
              amount:
                spaceData.condition?.amount || spaceData.condition?.amountInput,
              token_type: spaceData.condition?.token_type,
            },
          ];
        }
      }
      await dispatch(updateSpaceChannel(space?.space_id, body));
      setLoading(false);
      handleClose();
    }
  }, [
    currentTeam?.team_id,
    handleClose,
    space?.space_id,
    spaceData.attachment?.loading,
    spaceData.condition,
    spaceData.description,
    spaceData.emoji,
    spaceData.name,
    spaceData.spaceBadgeId,
    spaceData.spaceType,
    spaceData.url,
    dispatch,
  ]);
  return (
    <Modal
      open={open}
      onClose={handleClose}
      className="setting-modal"
      style={{ backgroundColor: "var(--color-backdrop)" }}
    >
      <div className="setting-modal__container">
        <div className="left-side">
          {settings.current.map((group) => {
            return (
              <div key={group.id}>
                <div className="group-setting-title" style={{ marginTop: 10 }}>
                  <span>{group.groupLabel}</span>
                </div>
                {group.items.map((el) => {
                  const isActive = currentPageId === el.id;
                  return (
                    <div
                      className={`setting-item ${isActive && "active"}`}
                      key={el.label}
                      onClick={() => setCurrentPageId(el.id)}
                    >
                      <img alt="" src={el.icon} />
                      <span className="setting-label">{el.label}</span>
                    </div>
                  );
                })}
              </div>
            );
          })}
          <div className="delete-space__wrapper" onClick={handleDeleteClick}>
            <img alt="" src={images.icSettingChannelDelete} />
            <span className="delete-space-text">Delete space</span>
          </div>
        </div>
        <div className="body">
          <span className="modal-label">{currentPageId.replace("_", " ")}</span>
          {currentPageId === "space_display" && (
            <SpaceInformation
              spaceData={spaceData}
              setSpaceData={setSpaceData}
              spaceId={space?.space_id}
            />
          )}
          {currentPageId === "space_access" && (
            <SpaceConfig
              spaceData={spaceData}
              setSpaceData={setSpaceData}
              nftCollections={nftCollections}
            />
          )}
          <div className="bottom">
            <NormalButton title="Cancel" onPress={handleClose} type="normal" />
            <div style={{ width: 10 }} />
            <NormalButton
              title="Save"
              onPress={onSave}
              type="main"
              loading={loading}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default memo(ModalSpaceSetting);
