import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import styles from "./index.module.scss";
import { Link, useNavigate } from "react-router-dom";
import IconMenuExplore from "shared/SVG/FC/IconMenuExplore";
import { Popper } from "@mui/material";
import MentionItem from "shared/MentionPicker/MentionItem";
import { IFCUser } from "models/FC";
import api from "api";
import ImageView from "shared/ImageView";

const Analytic = () => {
  const navigate = useNavigate();
  const [loadingDataUser, setLoadingDataUser] = useState(false);
  const timeOutGetUser = useRef<any>();
  const inputRef = useRef<any>();
  const [dataUsers, setDataUsers] = useState<IFCUser[]>([]);
  const [anchorPopup, setPopup] = useState<any>(null);
  const [value, setValue] = useState("");
  const suggestedUsers = useMemo(
    () => [
      {
        fid: "3",
        name: "Dan Romero",
        username: "dwr.eth",
        avatar:
          "https://res.cloudinary.com/merkle-manufactory/image/fetch/c_fill,f_png,w_256/https://lh3.googleusercontent.com/MyUBL0xHzMeBu7DXQAqv0bM9y6s4i4qjnhcXz5fxZKS3gwWgtamxxmxzCJX7m2cuYeGalyseCA2Y6OBKDMR06TWg2uwknnhdkDA1AA",
      },
      {
        fid: "5650",
        name: "Vitalik Buterin",
        username: "vitalik.eth",
        avatar: "https://i.imgur.com/gF9Yaeg.jpg",
      },
      {
        fid: "617",
        name: "Cameron Armstrong",
        username: "cameron",
        avatar:
          "https://i.seadn.io/gae/2DuTQOaL5nJjMrA1tmfo8rjMwt7_0d04uj8nZgPnsEfpFsyNQh_s8qVDZHrpztpTCV67EvAE9b95zJYa1fRdjOpr-KeIAPGhoztP?w=500&auto=format",
      },
      {
        fid: "880",
        name: "accountless.eth",
        username: "accountless.eth",
        avatar: "https://i.imgur.com/AFv9wdm.jpg",
      },
      {
        fid: "6806",
        name: "dawufigpt - mid/MAU",
        username: "dawufi",
        avatar: "https://i.imgur.com/E51kh9y.gif",
      },
      {
        fid: "472",
        name: "ccarella",
        username: "ccarella.eth",
        avatar: "https://i.imgur.com/RO9s06A.jpg",
      },
      {
        fid: "5818",
        name: "adrienne",
        username: "ccarella.eth",
        avatar:
          "https://i.seadn.io/gae/fHFhEyRAWUv3GGEhSdD9fMQ8D9mdNcSPh2CrhTIqqQuXM62gAGclA5co44eUB-p-WP7zOC9opPTCtZYPvr4C9joBLVxMhhLFdjUH?w=500&auto=format",
      },
      {
        fid: "2588",
        name: "Connor McCormick q/dau",
        username: "nor",
        avatar: "https://i.imgur.com/1JjZFIB.png",
      },
    ],
    []
  );
  const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  }, []);
  const onBlur = useCallback(() => {
    setTimeout(() => {
      setPopup(null);
    }, 100);
  }, []);
  const onFocus = useCallback(() => {
    if (dataUsers.length > 0) setPopup(inputRef.current);
  }, [dataUsers.length]);
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0);
  const handleMentionEnter = useCallback(
    (index: number) => setSelectedMentionIndex(index),
    []
  );
  const mentionSelected = useCallback(() => {
    const user = dataUsers[selectedMentionIndex];
    setValue("");
    navigate(`${user.fid}`);
  }, [dataUsers, navigate, selectedMentionIndex]);
  const renderMentionItem = useCallback(
    (item: IFCUser, index: number) => (
      <MentionItem
        key={item.fid}
        url={item.pfp?.url}
        name={item.username}
        displayName={item.display_name}
        index={index}
        fid={item.fid}
        selectedMentionIndex={selectedMentionIndex}
        onEnter={handleMentionEnter}
        enterMention={mentionSelected}
      />
    ),
    [handleMentionEnter, mentionSelected, selectedMentionIndex]
  );
  useEffect(() => {
    if (value) {
      if (timeOutGetUser.current) {
        clearTimeout(timeOutGetUser.current);
      }
      timeOutGetUser.current = setTimeout(() => {
        setLoadingDataUser(true);
        api
          .getFCUsersByName(value)
          .then((res) => {
            setDataUsers(res?.data || []);
            setPopup(inputRef.current);
          })
          .finally(() => {
            setLoadingDataUser(false);
          });
      }, 200);
    } else {
      setPopup(null);
      setDataUsers([]);
    }
  }, [value]);
  return (
    <div className={styles.container}>
      <nav className={styles.head} ref={inputRef}>
        <div className={styles.search}>
          <input
            className={styles.input}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            onFocus={onFocus}
          />
          {!value && (
            <div className={styles.placeholder}>
              <IconMenuExplore size={18} fill="var(--color-mute-text)" />
              <span style={{ marginLeft: 10 }}>Search by username</span>
            </div>
          )}
        </div>
      </nav>
      <div className={styles.body}>
        <span className={styles.title}>Suggested users</span>
        <div className={styles.list}>
          {suggestedUsers.map((el) => (
            <Link className={styles["user-item"]} key={el.fid} to={el.fid}>
              <ImageView
                alt="avatar"
                src={el.avatar}
                className={styles.avatar}
              />
              <div className={styles["user-info"]}>
                <span className={`${styles.name} truncate`}>{el.name}</span>
                <span className={`${styles.username} truncate`}>
                  @{el.username}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <Popper
        id="popup-mention"
        open={!!anchorPopup}
        anchorEl={anchorPopup}
        style={{ zIndex: 1000 }}
        placement="bottom"
      >
        <div
          className={`${styles["popup-mention__container"]} hide-scroll-bar`}
        >
          {dataUsers.map(renderMentionItem)}
        </div>
      </Popper>
    </div>
  );
};

export default memo(Analytic);
