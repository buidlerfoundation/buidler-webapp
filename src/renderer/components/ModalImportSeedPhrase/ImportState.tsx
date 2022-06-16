import React from 'react';
import AppInput from '../AppInput';
import AppTextArea from '../AppTextArea';
import './index.scss';

type ImportStateProps = {
  seed: string;
  setSeed: (seed: string) => void;
};

const ImportState = ({ seed, setSeed }: ImportStateProps) => {
  const onPaste = async () => {
    const text = await navigator.clipboard.readText();
    setSeed(text);
  };
  return (
    <div className="modal-state__container">
      <span className="title">Add seed phrase</span>
      <div className="input-wrapper">
        <AppTextArea
          className="app-input-highlight"
          placeholder="Your seed phrase (12 words)"
          value={seed}
          style={{ height: 110 }}
          onChange={(e) => setSeed(e.target.value)}
          autoFocus
        />
        <div className="button-paste normal-button" onClick={onPaste}>
          <span>Paste</span>
        </div>
      </div>
      <div style={{ height: 36 }} />
    </div>
  );
};

export default ImportState;
