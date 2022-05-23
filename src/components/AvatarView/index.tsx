import React from "react";
import ImageHelper from "common/ImageHelper";
import images from "common/images";
import "./index.scss";
// import Blockies from "react-blockies";

type AvatarViewProps = {
  user: any;
  size?: number;
};

const AvatarView = ({ user, size = 25 }: AvatarViewProps) => {
  return (
    <div className="avatar-view">
      {/* <Blockies
        seed="Jeremy"
        size={10}
        scale={3}
        color="#dfe"
        bgColor="red"
        spotColor="#abc"
        className="identicon"
      /> */}
      <img
        className="avatar-image"
        alt=""
        src={ImageHelper.normalizeImage(user?.avatar_url, user?.user_id)}
        style={{ width: size, height: size }}
        referrerPolicy="no-referrer"
        onError={({ currentTarget }) => {
          currentTarget.onerror = null; // prevents looping
          currentTarget.src = images.icImageDefault;
        }}
      />
      {user?.status && <div className={`status ${user.status}`} />}
    </div>
  );
};

export default AvatarView;
