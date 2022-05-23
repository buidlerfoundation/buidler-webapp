import React, { CSSProperties } from "react";
import { Picker } from "emoji-mart";

type EmojiPickerProps = {
  onClick: (emoji: any, event: any) => void;
  style?: CSSProperties | undefined;
};

const EmojiPicker = ({ onClick, style }: EmojiPickerProps) => {
  return (
    <Picker
      set="apple"
      theme="dark"
      onClick={onClick}
      emojiTooltip={false}
      showPreview={false}
      showSkinTones={false}
      style={style}
    />
  );
};

export default EmojiPicker;
