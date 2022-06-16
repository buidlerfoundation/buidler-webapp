import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import "./index.scss";
import { Emoji } from "emoji-mart";
import { normalizeUserName } from "renderer/helpers/MessageHelper";
import { ReactReducerData, ReactUserApiData, UserData } from "renderer/models";
import Popper from "@material-ui/core/Popper";
import AvatarView from "../AvatarView";
import api from "../../api";

type ReactItemProps = {
  emoji: ReactReducerData;
  onClick: (name: string) => void;
  onMouseLeave: () => void;
  onMouseEnter: (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    emoji: ReactReducerData
  ) => void;
};

const ReactItem = ({
  emoji,
  onClick,
  onMouseLeave,
  onMouseEnter,
}: ReactItemProps) => {
  const handleMouseEnter = useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      onMouseEnter(e, emoji);
    },
    [emoji, onMouseEnter]
  );
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      e.stopPropagation();
      onClick(emoji.reactName);
    },
    [emoji.reactName, onClick]
  );
  return (
    <div
      className={`react-item__view ${
        emoji.isReacted ? "react-item__highlight" : ""
      }`}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <Emoji emoji={emoji.reactName} set="apple" size={18} />
      <span className="react-item__count">{emoji.count}</span>
    </div>
  );
};

type ReactViewProps = {
  reacts: Array<ReactReducerData>;
  onClick: (name: string) => void;
  teamUserData: Array<UserData>;
  parentId: string;
};

const ReactView = ({
  reacts,
  onClick,
  teamUserData,
  parentId,
}: ReactViewProps) => {
  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
  const [reactDetail, setReactDetail] = useState<Array<ReactUserApiData>>([]);
  const currentId = useRef<string>("");
  const handlePopoverOpen = useCallback(
    async (
      evt: React.MouseEvent<HTMLDivElement, MouseEvent>,
      emj: ReactReducerData
    ) => {
      currentId.current = emj.reactName;
      setAnchorEl(evt.currentTarget);
      const res = await api.getReactionDetail(parentId, emj.reactName);
      setReactDetail(res.data || []);
    },
    [parentId]
  );

  const handlePopoverClose = useCallback(() => {
    currentId.current = "";
    setAnchorEl(null);
    setReactDetail([]);
  }, []);

  const currentReact = useMemo(
    () => reacts?.find((el) => el.reactName === currentId.current),
    [reacts]
  );

  useEffect(() => {
    if (!currentReact) {
      setAnchorEl(null);
    }
  }, [currentReact]);

  const open = useMemo(
    () => !!anchorEl && reactDetail.length > 0,
    [anchorEl, reactDetail.length]
  );
  const handleClick = useCallback(
    (name: string) => {
      setAnchorEl(null);
      onClick(name);
    },
    [onClick]
  );
  const renderReactItem = useCallback(
    (emj: ReactReducerData) => (
      <ReactItem
        key={emj.reactName}
        emoji={emj}
        onClick={handleClick}
        onMouseLeave={handlePopoverClose}
        onMouseEnter={handlePopoverOpen}
      />
    ),
    [handleClick, handlePopoverClose, handlePopoverOpen]
  );
  const renderReactDetail = useCallback(
    (el: ReactUserApiData) => {
      const user = teamUserData.find((u) => u.user_id === el.user_id);
      if (!user) return null;
      return (
        <div className="react-item" key={el.emoji_id + el.user_id}>
          <AvatarView user={user} />
          <span className="user-name">
            {normalizeUserName(user?.user_name)}
          </span>
          <Emoji emoji={el.emoji_id} set="apple" size={18} />
        </div>
      );
    },
    [teamUserData]
  );
  return (
    <div>
      <div
        className="react-view__container"
        aria-describedby={open ? "react-detail-popover" : undefined}
      >
        {reacts?.map(renderReactItem)}
      </div>
      <Popper
        id="react-detail-popover"
        open={open}
        anchorEl={anchorEl}
        style={{ zIndex: 1000 }}
      >
        <div className="react-detail__container">
          {reactDetail.map(renderReactDetail)}
        </div>
      </Popper>
    </div>
  );
};

export default ReactView;
