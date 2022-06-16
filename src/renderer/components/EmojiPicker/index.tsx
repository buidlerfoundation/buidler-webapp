import React from 'react';
import { EmojiData, Picker } from 'emoji-mart';

type EmojiPickerProps = {
  onClick: (
    emoji: EmojiData,
    event: React.MouseEvent<HTMLElement, MouseEvent>
  ) => void;
  style?: React.CSSProperties | undefined;
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
