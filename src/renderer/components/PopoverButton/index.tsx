import React, {
  useState,
  forwardRef,
  useImperativeHandle,
  useCallback,
  useMemo,
} from "react";
import "./index.scss";
import Popover from "@material-ui/core/Popover";

export type PopoverItem = {
  label: string;
  value: string;
  shortcut?: string;
  type?: "default" | "destructive";
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
  onOpen?: () => void;
};

type PopupItemProps = {
  item: any;
  onSelected?: (item: PopoverItem) => void;
  onClose: () => void;
};

const PopupItem = ({ item, onSelected, onClose }: PopupItemProps) => {
  const handleItemClick = useCallback(() => {
    onSelected?.(item);
    onClose();
  }, [item, onClose, onSelected]);
  return (
    <div className="popup__item normal-button" onClick={handleItemClick}>
      <div style={{ display: "flex", alignItems: "center", flex: 1 }}>
        {item.icon && <img className="item__icon" src={item.icon} alt="" />}
        <span className={`item__name ${item.type || "default"}`}>
          {item.label}
        </span>
      </div>
      {item.shortcut && (
        <span className={`item__name ${item.type || "default"}`}>
          {item.shortcut}
        </span>
      )}
    </div>
  );
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
      onOpen,
    }: PopoverButtonProps,
    ref
  ) => {
    const [anchorReference, setAnchorReference] = useState<any>("anchorEl");
    const [anchorPosition, setAnchorPosition] = useState({ left: 0, top: 0 });
    const [anchorPopup, setPopup] = useState<any>(null);
    const idPopup = useMemo(
      () => (!!anchorPopup ? "cpn-button-popover" : undefined),
      [anchorPopup]
    );
    const handleOpenPopup = useCallback(
      (e: any) => {
        e.stopPropagation();
        setPopup(e.currentTarget);
        onOpen?.();
      },
      [onOpen]
    );
    const handleClick = useCallback((e: any) => e.stopPropagation(), []);
    const handleClose = useCallback(() => {
      setPopup(null);
      onClose?.();
    }, [onClose]);
    useImperativeHandle(ref, () => {
      return {
        show(target: any, pos: any) {
          if (!pos) {
            setAnchorReference("anchorEl");
          } else {
            setAnchorReference("anchorPosition");
            setAnchorPosition({ left: pos.x, top: pos.y });
          }
          setPopup(target);
        },
        isOpen: !!anchorPopup,
        hide() {
          setPopup(null);
        },
      };
    });
    const renderButton = useCallback(() => {
      if (popupOnly) return null;
      if (componentButton != null)
        return (
          <div className="normal-button" onClick={handleOpenPopup}>
            {componentButton}
          </div>
        );
      return (
        <div className="main-button normal-button" onClick={handleOpenPopup}>
          <span className="title-button">{title}</span>
          {icon && <div style={{ width: 8 }} />}
          {icon && <img src={icon} alt="" />}
        </div>
      );
    }, [componentButton, icon, popupOnly, title, handleOpenPopup]);
    const renderPopupItem = useCallback(
      (dt: any) => (
        <PopupItem
          item={dt}
          onSelected={onSelected}
          onClose={handleClose}
          key={dt.value}
        />
      ),
      [handleClose, onSelected]
    );
    return (
      <>
        {renderButton()}
        <Popover
          onClick={handleClick}
          elevation={0}
          id={idPopup}
          transitionDuration={200}
          open={!!anchorPopup}
          anchorEl={anchorPopup}
          anchorReference={anchorReference}
          anchorPosition={anchorPosition}
          onClose={handleClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "center",
          }}
        >
          {componentPopup != null ? (
            componentPopup
          ) : (
            <div className="popup__container">
              {data?.map?.(renderPopupItem)}
            </div>
          )}
        </Popover>
      </>
    );
  }
);

export default PopoverButton;
