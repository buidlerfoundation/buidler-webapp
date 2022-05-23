import React, { useState, useEffect } from 'react';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import Modal from '@material-ui/core/Modal';
import images from '../../common/images';
import './index.scss';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    modal: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
  })
);

type ImgLightBoxProps = {
  children: any;
  originalSrc: any;
};

const ImgLightBox = ({ children, originalSrc }: ImgLightBoxProps) => {
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const handleOpen = (e: any) => {
    e.stopPropagation();
    setOpen(true);
  };

  const handleClose = (e: any) => {
    e.stopPropagation();
    setOpen(false);
  };
  useEffect(() => {
    const keyDownListener = (e: any) => {
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    if (open) {
      window.addEventListener('keydown', keyDownListener);
    }

    if (!open) {
      window.removeEventListener('keydown', keyDownListener);
    }
  }, [open]);
  return (
    <>
      <div
        className="normal-button"
        onClick={handleOpen}
        style={{ display: 'inline-block' }}
      >
        {children}
      </div>
      <Modal
        className={classes.modal}
        open={open}
        onClose={handleClose}
        onClick={(e) => e.stopPropagation()}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        BackdropProps={{ style: { backgroundColor: 'rgba(0,0,0,.9)' } }}
      >
        <>
          <div
            className="normal-button"
            onClick={handleClose}
            style={{ position: 'absolute', top: 50, right: 50, padding: 10 }}
          >
            <img alt="" src={images.icCircleClose} />
          </div>
          <img className="img-light-box" src={originalSrc} alt="" />
        </>
      </Modal>
    </>
  );
};

export default ImgLightBox;
