import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Modal } from '@material-ui/core';
import './index.scss';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';
import { isValidPrivateKey } from 'renderer/helpers/SeedHelper';
import NormalButton from '../NormalButton';
import ImportState from './ImportState';
import CreatePasswordState from '../ModalCreatePassword/CreatePasswordState';

type ModalImportSeedPhraseProps = {
  open: boolean;
  handleClose: () => void;
  loggedOn: (seed: string, password: string) => void;
};

type ModalState = 'import' | 'create-password';

const ModalImportSeedPhrase = ({
  open,
  handleClose,
  loggedOn,
}: ModalImportSeedPhraseProps) => {
  const [password, setPassword] = useState('');
  const [seed, setSeed] = useState('');
  const [modalState, setModalState] = useState<ModalState>('import');
  const renderBody = useMemo(() => {
    if (modalState === 'import')
      return <ImportState seed={seed} setSeed={setSeed} />;
    if (modalState === 'create-password')
      return (
        <CreatePasswordState
          password={password}
          onChangeText={(e) => setPassword(e.target.value)}
        />
      );

    return null;
  }, [modalState, password, seed]);
  const onNextPress = useCallback(() => {
    switch (modalState) {
      case 'import': {
        if (ethers.utils.isValidMnemonic(seed) || isValidPrivateKey(seed)) {
          setModalState('create-password');
        } else {
          toast.error('Invalid seed phrase', { className: 'Failed !' });
        }

        break;
      }
      case 'create-password': {
        if (!password) {
          toast.error('Password can not be empty');
          return;
        }
        loggedOn(seed, password);
        break;
      }
      default:
        break;
    }
  }, [modalState, seed, password, loggedOn]);
  useEffect(() => {
    setModalState('import');
    setSeed('');
    setPassword('');
  }, [open]);
  return (
    <Modal
      open={open}
      className="import-seed-modal"
      BackdropProps={{
        style: {
          backgroundColor: 'var(--color-backdrop)',
        },
      }}
    >
      <div style={{ display: 'table' }}>
        <div className="modal__container">
          {renderBody}
          <div className="import__bottom">
            <NormalButton title="Cancel" onPress={handleClose} type="normal" />
            <div style={{ width: 10 }} />
            <NormalButton title="Next" onPress={onNextPress} type="main" />
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ModalImportSeedPhrase;
