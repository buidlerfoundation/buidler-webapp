import { Modal } from '@material-ui/core';
import React, { useMemo, useState, useCallback } from 'react';
import NormalButton from '../NormalButton';
import CreatePasswordState from './CreatePasswordState';
import './index.scss';
import { ethers } from 'ethers';
import StoreSeedPhraseState from './StoreSeedPhraseState';
import BackupSeedPhraseState from './BackupSeedPhraseState';
import { createConfirmSeedState } from '../../helpers/SeedHelper';
import toast from 'react-hot-toast';

type ModalCreatePasswordProps = {
  open: boolean;
  handleClose: () => void;
  loggedOn: (seed: string, password: string, backupLater?: boolean) => void;
};

type ModalState =
  | 'create-password'
  | 'store-seed-phrase'
  | 'backup-seed-phrase';

const ModalCreatePassword = ({
  open,
  handleClose,
  loggedOn,
}: ModalCreatePasswordProps) => {
  const [password, setPassword] = useState('');
  const seed = useMemo(() => ethers.Wallet.createRandom().mnemonic.phrase, []);
  const [confirmSeed, setConfirmSeed] = useState(createConfirmSeedState());
  const [modalState, setModalState] = useState<ModalState>('create-password');
  const buttonSubText = useMemo(() => {
    switch (modalState) {
      case 'create-password':
        return 'Cancel';
      case 'store-seed-phrase':
        return 'Do it later';
      case 'backup-seed-phrase':
        return 'Back';
      default:
        return '';
    }
  }, [modalState]);
  const renderBody = useMemo(() => {
    if (modalState === 'create-password')
      return (
        <CreatePasswordState
          password={password}
          onChangeText={(e) => setPassword(e.target.value)}
        />
      );
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
  }, [modalState, confirmSeed, password, seed]);
  const onCancelText = useCallback(() => {
    switch (modalState) {
      case 'create-password':
        handleClose();
        break;
      case 'store-seed-phrase':
        loggedOn(seed, password, true);
        break;
      case 'backup-seed-phrase':
        setModalState('store-seed-phrase');
        break;
      default:
        break;
    }
  }, [modalState, loggedOn, handleClose, seed, password]);
  const onNextPress = useCallback(() => {
    switch (modalState) {
      case 'create-password': {
        if (!password) {
          toast.error('Password can not be empty');
          return;
        }
        setModalState('store-seed-phrase');
        break;
      }
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
          toast.success('Your wallet was successfully created', {
            className: 'Success !',
          });
          loggedOn(seed, password);
        }
        break;
      }
      default:
        break;
    }
  }, [modalState, confirmSeed, seed, password, loggedOn]);
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

export default ModalCreatePassword;
