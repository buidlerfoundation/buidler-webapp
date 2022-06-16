import React from "react";
import AppInput from "../AppInput";
import TagView from "../TagView";

type UpdateDefaultChannelProps = {
  user?: any;
  currentChannel?: any;
  updateUserChannel?: (channels: Array<any>) => any;
  channels?: Array<any>;
};

const UpdateDefaultChannel = ({
  user,
  channels,
  currentChannel,
  updateUserChannel,
}: UpdateDefaultChannelProps) => {
  return (
    <div>
      <span className="modal-label">Default channel</span>
      <div style={{ height: 30 }} />
      <TagView
        isUserChannel
        channels={
          user?.user_channels
            ?.map?.((el: any) => channels?.find((c) => c.channel_id === el))
            .filter((el: any) => !!el) || []
        }
        currentChannel={currentChannel}
        onChange={(c) => {
          updateUserChannel?.(c.filter((el) => el.channel_type !== "Direct"));
        }}
      />
      <div style={{ height: 25 }} />
      <span className="user-channel-des">
        Your task will be automatically added to channels default when a task
        has been created in a direct message.
      </span>
    </div>
  );
};

export default UpdateDefaultChannel;
