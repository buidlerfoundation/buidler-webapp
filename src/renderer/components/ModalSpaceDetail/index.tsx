import React, { useCallback, useEffect, useState } from "react";
import ImageHelper from "renderer/common/ImageHelper";
import useAppSelector from "renderer/hooks/useAppSelector";
import { Space, SpaceCollectionData, SpaceMember } from "renderer/models";
import { normalizeMessageText } from "renderer/helpers/MessageHelper";
import { Emoji } from "emoji-mart";
import api from "renderer/api";
import { formatNumber } from "renderer/helpers/StringHelper";
import ModalFullScreen from "../ModalFullScreen";
import "./index.scss";
import DefaultSpaceIcon from "../DefaultSpaceIcon";
import ConditionItem from "./ConditionItem";
import SpaceMemberItem from "./SpaceMemberItem";

type ModalSpaceDetailProps = {
  open: boolean;
  handleClose: () => void;
  space?: Space | null;
};

const ModalSpaceDetail = ({
  open,
  handleClose,
  space,
}: ModalSpaceDetailProps) => {
  const currentTeam = useAppSelector((state) => state.user.currentTeam);
  const [loading, setLoading] = useState(false);
  const [spaceMembers, setSpaceMembers] = useState<Array<SpaceMember>>([]);
  const [totalMember, setTotalMember] = useState("");
  const [spaceCondition, setSpaceCondition] = useState<
    Array<SpaceCollectionData>
  >([]);
  const fetchSpaceCondition = useCallback(async () => {
    if (space?.space_id) {
      const res = await api.getSpaceCondition(space.space_id);
      setSpaceCondition(res?.data || []);
    }
  }, [space?.space_id]);
  const fetchSpaceMember = useCallback(async () => {
    if (space?.space_id) {
      const res = await api.getSpaceMembers(space?.space_id);
      setSpaceMembers(res.data || []);
      setTotalMember(res.total?.toString() || "");
    }
  }, [space?.space_id]);
  const fetchData = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchSpaceCondition(), fetchSpaceMember()]);
    setLoading(false);
  }, [fetchSpaceCondition, fetchSpaceMember]);

  useEffect(() => {
    if (open) {
      setSpaceMembers([]);
      setTotalMember("");
      setSpaceCondition([]);
      fetchData();
    }
  }, [fetchData, open]);
  const renderSpaceIcon = useCallback(() => {
    if (space?.space_image_url) {
      return (
        <img
          className="space-icon"
          src={ImageHelper.normalizeImage(
            space.space_image_url,
            currentTeam.team_id
          )}
          alt=""
        />
      );
    }
    if (space?.space_emoji) {
      return null;
    }
    return (
      <DefaultSpaceIcon
        name={space?.space_name || ""}
        size={110}
        fontSize={50}
        fontMarginTop={17}
      />
    );
  }, [
    currentTeam?.team_id,
    space?.space_emoji,
    space?.space_image_url,
    space?.space_name,
  ]);
  const renderNFTCondition = useCallback((item: SpaceCollectionData) => {
    return <ConditionItem item={item} key={item.space_condition_id} />;
  }, []);
  const renderSpaceMember = useCallback(
    (item: SpaceMember) => <SpaceMemberItem key={item.user_id} item={item} />,
    []
  );
  if (loading) return null;
  return (
    <ModalFullScreen
      open={open && !!space}
      onClosed={handleClose}
      position="right"
    >
      <div className="space-detail__container">
        <div className="space-info__wrap">
          <div
            className="cover"
            style={{
              backgroundColor:
                space?.space_background_color || "var(--color-stroke)",
            }}
          />
          <div
            className={`space-avatar__wrap ${
              space?.space_emoji ? "avatar_off" : ""
            }`}
          >
            {renderSpaceIcon()}
          </div>
          <div
            className={`space-name__wrap ${
              space?.space_emoji ? "no-avatar" : ""
            }`}
          >
            {space?.space_emoji && (
              <Emoji emoji={space?.space_emoji} set="apple" size={30} />
            )}
            <span className="space-name" style={{ color: space?.icon_color }}>
              {space?.space_name}
            </span>
          </div>
          <div
            className={`space-member__wrap ${
              space?.space_emoji ? "no-avatar" : ""
            }`}
          >
            <span className="member-label">Members</span>
            <span className="member-count">{formatNumber(totalMember)}</span>
          </div>
        </div>
        {spaceCondition.length > 0 && (
          <div className="space-condition__wrap">
            <span className="condition-label">Entry requirements</span>
            {spaceCondition.map(renderNFTCondition)}
          </div>
        )}
        {space?.space_description && (
          <div className="space-description__wrap">
            <div
              className="space-description"
              dangerouslySetInnerHTML={{
                __html: normalizeMessageText(space?.space_description),
              }}
            />
          </div>
        )}
        {spaceMembers.length > 0 && (
          <div className="space-member__wrap">
            {spaceMembers.map(renderSpaceMember)}
          </div>
        )}
      </div>
    </ModalFullScreen>
  );
};

export default ModalSpaceDetail;
