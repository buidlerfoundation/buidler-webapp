import { Grid } from '@material-ui/core';
import React from 'react';
import images from '../../common/images';
import toast from 'react-hot-toast';

type StoreSeedPhraseStateProps = {
  seed: string;
};

const StoreSeedPhraseState = ({ seed }: StoreSeedPhraseStateProps) => {
  const seedData = seed.split(' ');
  return (
    <div className="modal-state__container">
      <span className="title">Store seed phrase</span>
      <span className="description">
        The only way to import/ recover your wallet. Note down in safe place and
        never share to anyone
      </span>
      <Grid container spacing={2} className="seed-container">
        {seedData.map((el, index) => (
          <Grid item xs={3} key={el}>
            <div className="seed-item">
              {index + 1}. {el}
            </div>
          </Grid>
        ))}
      </Grid>
      <div
        className="copy-button"
        onClick={async () => {
          await navigator.clipboard.writeText(seed);
          toast.success('Seed phrased is copied', {
            className: 'Copied !',
          });
        }}
      >
        <img src={images.icCopy} alt="" className="ml5" />
        <span className="copy-text">Copy to clipboard</span>
      </div>
    </div>
  );
};

export default StoreSeedPhraseState;
