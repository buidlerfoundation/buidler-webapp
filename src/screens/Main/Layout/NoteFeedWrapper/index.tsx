"use client";

import React, { memo, useCallback, useMemo, useRef } from "react";
import styles from "./index.module.scss";
import PopoverButton, { PopoverItem } from "shared/PopoverButton";
import IconDot from "shared/SVG/IconDot";
import { usePathname, useRouter } from "next/navigation";
import { Route } from "next";
import IconCaretDown from "shared/SVG/FC/IconCaretDown";

interface INoteFeedWrapper {
  children: React.ReactNode;
}

const NoteFeedWrapper = ({ children }: INoteFeedWrapper) => {
  const pathname = usePathname();
  const router = useRouter();
  const popupMenuRef = useRef<any>();
  const menu = useMemo(
    () => [
      {
        label: "Helpful Context",
        value: "/community-notes/helpful",
        renderIcon: () => (
          <IconDot fill="var(--accent-blue)" styles={{ marginRight: 10 }} />
        ),
      },
      {
        label: "Need more rating",
        value: "/community-notes/need-rating",
        renderIcon: () => (
          <IconDot fill="var(--accent-yellow)" styles={{ marginRight: 10 }} />
        ),
      },
      {
        label: "Need add context",
        value: "/community-notes/need-context",
        renderIcon: () => <IconDot styles={{ marginRight: 10 }} />,
      },
    ],
    []
  );
  const activeItem = useMemo(
    () => menu.find((el) => el.value === pathname),
    [menu, pathname]
  );
  const handleSelectedMenu = useCallback(
    (item: PopoverItem) => {
      router.push(item.value as Route);
      popupMenuRef.current?.hide?.();
    },
    [router]
  );
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={`${styles.title} hide-xs`}>
          Community Notes for the internet.
        </div>
        <div className="hide-desktop">
          <PopoverButton
            ref={popupMenuRef}
            data={menu}
            onSelected={handleSelectedMenu}
            itemWidth={220}
            componentButton={
              <div className={styles["btn-filter"]}>
                {activeItem?.renderIcon()}
                <span>{activeItem?.label}</span>
                <IconCaretDown size={25} style={{ marginLeft: 5 }} />
              </div>
            }
            popupStyle={{ marginTop: 0 }}
          />
        </div>
      </div>
      {children}
    </div>
  );
};

export default memo(NoteFeedWrapper);
