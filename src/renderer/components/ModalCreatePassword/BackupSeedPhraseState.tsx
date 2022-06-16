import { Grid } from '@material-ui/core';
import { shuffle } from 'lodash';
import React, { useMemo } from 'react';

type BackupSeedPhraseStateProps = {
  seed: string;
  confirmSeed: Array<{ index: number; title: string }>;
  setConfirmSeed: any;
  onClear: () => void;
};

const BackupSeedPhraseState = ({
  seed,
  confirmSeed,
  setConfirmSeed,
  onClear,
}: BackupSeedPhraseStateProps) => {
  const shuffleSeedData = useMemo(() => shuffle(seed.split(' ')), [seed]);
  return (
    <div className="modal-state__container">
      <span className="title">Confirm seed phrase</span>
      <div className="normal-button clear-button" onClick={onClear}>
        <span>clear</span>
      </div>
      <Grid container spacing={2} style={{ marginTop: 35 }}>
        {confirmSeed.map((el, index) => (
          <Grid item xs={3} key={el.index + el.title}>
            {!!el.title ? (
              <div
                className="seed-item normal-button"
                onClick={() =>
                  setConfirmSeed((current: Array<any>) =>
                    current.map((item, idx) => {
                      if (idx === index) {
                        item.title = '';
                      }
                      return item;
                    })
                  )
                }
              >
                {index + 1}. {el.title}
              </div>
            ) : (
              <div className="seed-item-empty">{index + 1}</div>
            )}
          </Grid>
        ))}
      </Grid>
      <Grid container spacing={2} style={{ marginTop: 40 }}>
        {shuffleSeedData.map((str) => {
          const isSelected = !!confirmSeed.find((el) => el.title === str);
          return (
            <Grid item xs={3} key={str}>
              <div
                className={`seed-item-confirm ${
                  isSelected ? 'selected' : 'normal-button'
                }`}
                onClick={() => {
                  if (isSelected) return;
                  setConfirmSeed((current: Array<any>) => {
                    const emptyIndex = current.findIndex((el) => !el.title);
                    return current.map((el, index) => {
                      if (index === emptyIndex) {
                        el.title = str;
                      }
                      return el;
                    });
                  });
                }}
              >
                {str}
              </div>
            </Grid>
          );
        })}
      </Grid>
    </div>
  );
};

export default BackupSeedPhraseState;
