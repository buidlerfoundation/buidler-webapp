import React, { useState, forwardRef, useImperativeHandle } from 'react';
import './index.scss';
import Popover from '@material-ui/core/Popover';

export type PopoverItem = {
  label: string;
  value: string;
  shortcut?: string;
  type?: 'default' | 'destructive';
  icon?: any;
};

type PopoverButtonProps = {
  title?: string;
  componentButton?: any;
  componentPopup?: any;
  icon?: any;
  data?: Array<PopoverItem>;
  onSelected?: (data: PopoverItem) => void;
  onClose?: () => void;
  popupOnly?: boolean;
};

const PopoverButton = forwardRef(
  (
    {
      title,
      componentButton,
      icon,
      data,
      onSelected,
      onClose,
      componentPopup,
      popupOnly,
    }: PopoverButtonProps,
    ref
  ) => {
    const [anchorReference, setAnchorReference] = useState<any>('anchorEl');
    const [anchorPosition, setAnchorPosition] = useState({ left: 0, top: 0 });
    const [anchorPopup, setPopup] = useState<any>(null);
    const open = Boolean(anchorPopup);
    const idPopup = open ? 'cpn-button-popover' : undefined;
    useImperativeHandle(ref, () => {
      return {
        show(target: any, pos: any) {
          if (!pos) {
            setAnchorReference('anchorEl');
          } else {
            setAnchorReference('anchorPosition');
            setAnchorPosition({ left: pos.x, top: pos.y });
          }
          setPopup(target);
        },
        isOpen: open,
        hide() {
          setPopup(null);
        },
      };
    });
    const renderButton = () => {
      if (popupOnly) return null;
      if (componentButton != null)
        return (
          <div
            className="normal-button"
            onClick={(e) => {
              e.stopPropagation();
              setPopup(e.currentTarget);
            }}
          >
            {componentButton}
          </div>
        );
      return (
        <div
          className="main-button normal-button"
          onClick={(e) => setPopup(e.currentTarget)}
        >
          <span className="title-button">{title}</span>
          {icon && <div style={{ width: 8 }} />}
          {icon && <img src={icon} alt="" />}
        </div>
      );
    };
    return (
      <>
        {renderButton()}
        <Popover
          onClick={(e) => e.stopPropagation()}
          elevation={0}
          id={idPopup}
          transitionDuration={200}
          open={open}
          anchorEl={anchorPopup}
          anchorReference={anchorReference}
          anchorPosition={anchorPosition}
          onClose={() => {
            setPopup(null);
            onClose?.();
          }}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
        >
          {componentPopup != null ? (
            componentPopup
          ) : (
            <div className="popup__container">
              {data?.map?.((dt) => (
                <div
                  className="popup__item normal-button"
                  key={dt.value}
                  onClick={() => {
                    onSelected?.(dt);
                    setPopup(null);
                  }}
                >
                  <div
                    style={{ display: 'flex', alignItems: 'center', flex: 1 }}
                  >
                    {dt.icon && (
                      <img className="item__icon" src={dt.icon} alt="" />
                    )}
                    <span className={`item__name ${dt.type || 'default'}`}>
                      {dt.label}
                    </span>
                  </div>
                  {dt.shortcut && (
                    <span className={`item__name ${dt.type || 'default'}`}>
                      {dt.shortcut}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </Popover>
      </>
    );
  }
);

export default PopoverButton;
