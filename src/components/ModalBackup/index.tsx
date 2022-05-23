import { Modal } from '@material-ui/core';
import React, { useMemo, useState, useCallback } from 'react';
import NormalButton from '../NormalButton';
import './index.scss';
import { createConfirmSeedState } from '../../helpers/SeedHelper';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import StoreSeedPhraseState from '../ModalCreatePassword/StoreSeedPhraseState';
import BackupSeedPhraseState from '../ModalCreatePassword/BackupSeedPhraseState';
import actionTypes from 'actions/ActionTypes';

type ModalBackupProps = {
  open: boolean;
  handleClose: () => void;
};

type ModalState = 'store-seed-phrase' | 'backup-seed-phrase';

const ModalBackup = ({ open, handleClose }: ModalBackupProps) => {
  const dispatch = useDispatch();
  const seed = useSelector((state: any) => state.configs.seed);
  const [confirmSeed, setConfirmSeed] = useState(createConfirmSeedState());
  const [modalState, setModalState] = useState<ModalState>('store-seed-phrase');
  const buttonSubText = useMemo(() => {
    switch (modalState) {
      case 'store-seed-phrase':
        return 'Do it later';
      case 'backup-seed-phrase':
        return 'Back';
      default:
        return '';
    }
  }, [modalState]);
  const renderBody = useMemo(() => {
    if (modalState === 'store-seed-phrase')
      return <StoreSeedPhraseState seed={seed} />;
    if (modalState === 'backup-seed-phrase')
      return (
        <BackupSeedPhraseState
          seed={seed}
          confirmSeed={confirmSeed}
          setConfirmSeed={setConfirmSeed}
          onClear={() => setConfirmSeed(createConfirmSeedState())}
        />
      );
    return null;
  }, [modalState, confirmSeed, seed]);
  const onCancelText = useCallback(() => {
    switch (modalState) {
      case 'store-seed-phrase':
        handleClose();
        break;
      case 'backup-seed-phrase':
        setModalState('store-seed-phrase');
        break;
      default:
        break;
    }
  }, [modalState, handleClose]);
  const onNextPress = useCallback(() => {
    switch (modalState) {
      case 'store-seed-phrase':
        setModalState('backup-seed-phrase');
        break;
      case 'backup-seed-phrase': {
        const compareSeed = confirmSeed
          .map((el) => el.title)
          .join(' ')
          .trim();
        if (compareSeed !== seed) {
          toast.error('Seed phrase was incorrect.', {
            className: 'Failed !',
          });
        } else {
          toast.success('Seed phrase was correct.', {
            className: 'Success !',
          });
          dispatch({ type: actionTypes.REMOVE_SEED_PHRASE });
          handleClose();
        }
        break;
      }
      default:
        break;
    }
  }, [modalState, seed, dispatch, handleClose, confirmSeed]);
  return (
    <Modal
      open={open}
      className="create-password-modal"
      BackdropProps={{
        style: {
          backgroundColor: 'var(--color-backdrop)',
        },
      }}
    >
      <div style={{ display: 'table' }}>
        <div className="modal__container">
          {renderBody}
          <div className="password__bottom">
            <NormalButton
              title={buttonSubText}
              onPress={onCancelText}
              type="normal"
            />
            <div style={{ width: 10 }} />
            <NormalButton title="Next" onPress={onNextPress} type="main" />
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ModalBackup;
