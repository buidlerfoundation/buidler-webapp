import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import styles from "./index.module.scss";
import IconDot from "shared/SVG/IconDot";
import useAppSelector from "hooks/useAppSelector";
import makeBlockie from "ethereum-blockies-base64";
import IconPlus from "shared/SVG/IconPlus";
import IconMenuExplore from "shared/SVG/FC/IconMenuExplore";
import ImageView from "shared/ImageView";
import { usePathname, useRouter } from "next/navigation";
import PopoverButton, { PopoverItem } from "shared/PopoverButton";
import { Route } from "next";
import Link from "next/link";
import IconMenuReport from "shared/SVG/IconMenuReport";
import IconMenuAddDiscussion from "shared/SVG/IconMenuAddDiscussion";

interface IBottomTabMobile {
  communityNote?: boolean;
  onUserTabClick: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  btnLoginRef: any;
  onWriteNote: () => void;
  onReportLink: () => void;
  onNewDiscussion: () => void;
}

const BottomTabMobile = ({
  communityNote,
  onUserTabClick,
  btnLoginRef,
  onWriteNote,
  onReportLink,
  onNewDiscussion,
}: IBottomTabMobile) => {
  const fcUser = useAppSelector((state) => state.fcUser?.data);
  const userAvatar = useMemo(
    () =>
      fcUser?.pfp?.url ||
      (fcUser?.address ? makeBlockie(fcUser.address) : undefined),
    [fcUser?.address, fcUser?.pfp?.url]
  );
  const pathname = usePathname();
  const router = useRouter();
  const popupMenuRef = useRef<any>();
  const popupMenuCreateRef = useRef<any>();
  const menuCreate = useMemo(() => {
    const res: PopoverItem[] = [
      {
        label: "Write a note",
        value: "write_a_note",
        type: "secondary",
        renderIcon: () => (
          <IconPlus
            fill="var(--color-secondary-text)"
            style={{ marginRight: 10, padding: 3 }}
            size={24}
          />
        ),
      },
      {
        label: "Report a link",
        value: "report_a_link",
        type: "secondary",
        renderIcon: () => (
          <IconMenuReport
            fill="var(--color-secondary-text)"
            style={{ marginRight: 10 }}
            size={24}
          />
        ),
      },
      // {
      //   label: "New discussion",
      //   value: "new_discussion",
      //   type: "secondary",
      //   renderIcon: () => (
      //     <IconMenuAddDiscussion
      //       style={{ marginRight: 10, padding: 3 }}
      //       size={24}
      //     />
      //   ),
      // },
    ];
    return res;
  }, []);
  const menu = useMemo(
    () => [
      {
        label: "Helpful context",
        value: "/community-notes/helpful",
        renderIcon: (marginRight = 10) => (
          <IconDot fill="var(--accent-blue)" styles={{ marginRight }} />
        ),
      },
      {
        label: "Needs more ratings",
        value: "/community-notes/need-rating",
        renderIcon: (marginRight = 10) => (
          <IconDot fill="var(--accent-yellow)" styles={{ marginRight }} />
        ),
      },
      {
        label: "Need context",
        value: "/community-notes/need-context",
        renderIcon: (marginRight = 10) => <IconDot styles={{ marginRight }} />,
      },
    ],
    []
  );
  const [prevActiveItem, setPrevActiveItem] = useState(menu[0]);
  const activeItem = useMemo(
    () => menu.find((el) => el.value === pathname),
    [menu, pathname]
  );
  const handleSelectedMenuCreate = useCallback(
    (item: PopoverItem) => {
      switch (item.value) {
        case "write_a_note":
          onWriteNote();
          break;
        case "report_a_link":
          onReportLink();
          break;
        case "new_discussion":
          onNewDiscussion();
          break;
        default:
          break;
      }
    },
    [onNewDiscussion, onReportLink, onWriteNote]
  );
  const handleSelectedMenu = useCallback(
    (item: PopoverItem) => {
      router.push(item.value as Route);
      popupMenuRef.current?.hide?.();
    },
    [router]
  );
  const onFeedClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      if (!activeItem) {
        router.push(prevActiveItem.value as Route);
      } else {
        popupMenuRef.current?.show(e.currentTarget);
      }
    },
    [activeItem, prevActiveItem.value, router]
  );
  const onAddClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      popupMenuCreateRef.current.show(e.currentTarget);
    },
    []
  );
  const noteFeedMenu = useMemo(
    () => activeItem || prevActiveItem || menu[0],
    [activeItem, menu, prevActiveItem]
  );
  useEffect(() => {
    if (activeItem) {
      setPrevActiveItem(activeItem);
    }
  }, [activeItem]);
  if (!communityNote) return null;
  return (
    <>
      <div className={styles["bottom-tab-mobile-wrap"]}>
        <div className={styles["tab-item"]} onClick={onFeedClick}>
          <div className={styles.icon}>{noteFeedMenu.renderIcon(0)}</div>
          <span className={styles.label}>{noteFeedMenu.label}</span>
        </div>
        <div className={styles["tab-item"]} onClick={onAddClick}>
          <div className={styles.icon}>
            <IconPlus
              size={20}
              fill="var(--color-mute-text)"
              style={{ padding: 3 }}
            />
          </div>
          <span className={styles.label}>Add new</span>
        </div>
        <Link className={styles["tab-item"]} href="/community-notes/explore">
          <div className={styles.icon}>
            <IconMenuExplore
              fill="var(--color-mute-text)"
              style={{ padding: 3 }}
            />
          </div>
          <span className={styles.label}>Search</span>
        </Link>
        <div
          className={styles["tab-item"]}
          onClick={onUserTabClick}
          ref={!fcUser ? btnLoginRef : undefined}
          id={!fcUser ? "btn-login" : undefined}
        >
          <div className={styles.icon}>
            <ImageView
              src={userAvatar}
              className={styles.avatar}
              alt="avatar"
            />
          </div>
          <span className={styles.label}>{fcUser?.display_name || "User"}</span>
        </div>
      </div>
      <PopoverButton
        ref={popupMenuRef}
        data={menu}
        popupOnly
        onSelected={handleSelectedMenu}
        itemWidth={275}
        popupStyle={{ marginTop: 0, padding: "5px 0" }}
      />
      <PopoverButton
        ref={popupMenuCreateRef}
        data={menuCreate}
        popupOnly
        onSelected={handleSelectedMenuCreate}
        itemWidth={275}
        popupStyle={{ marginTop: 0, padding: "5px 0" }}
      />
    </>
  );
};

export default memo(BottomTabMobile);
