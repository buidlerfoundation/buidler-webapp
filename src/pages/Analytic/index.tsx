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
        fid: "2",
        name: "Varun Srinivasan",
        username: "v",
        avatar:
          "https://i.seadn.io/gae/sYAr036bd0bRpj7OX6B-F-MqLGznVkK3--DSneL_BT5GX4NZJ3Zu91PgjpD9-xuVJtHq0qirJfPZeMKrahz8Us2Tj_X8qdNPYC-imqs?w=500&auto=format",
      },
      {
        fid: "576",
        name: "Jonny Mack",
        username: "nonlinear.eth",
        avatar:
          "https://i.seadn.io/gae/oeyOFjLzIVCMec49KdmBp24ZHL82XXqLLDlLRuvUR8InycSpmf9ZtSCfN69lgojeOoucD7fU9cjxAt4raFBTTgSo34gD5lSZ83Klb1k?w=500&auto=format",
      },
      {
        fid: "617",
        name: "Cameron Armstrong",
        username: "cameron",
        avatar:
          "https://i.seadn.io/gae/2DuTQOaL5nJjMrA1tmfo8rjMwt7_0d04uj8nZgPnsEfpFsyNQh_s8qVDZHrpztpTCV67EvAE9b95zJYa1fRdjOpr-KeIAPGhoztP?w=500&auto=format",
      },
      {
        fid: "99",
        name: "Jesse Pollak 🔵",
        username: "jessepollak.eth",
        avatar:
          "https://i.seadn.io/gae/GFkg_668tE-YxTKPt_XcZdL_xKMQ2CitZKR2L7dJoLoMXH4hUFXHv3Tzes-2hZWiyTEACe6AvutNqBpNbN_WS3b25g?w=500&auto=format",
      },
      {
        fid: "239",
        name: "ted (not lasso)",
        username: "ted",
        avatar:
          "https://openseauserdata.com/files/fd28c65d9b5192168fb259009a3afd36.png",
      },
      {
        fid: "557",
        name: "pugson",
        username: "pugson",
        avatar:
          "https://i.seadn.io/gae/5hjYfRyqiRJV4EQ7ieSJrmb1LtO_vcAvREXSqnlY4HXXBsvgh1vumOwj5e4GwGhppEU2jLC9qJHEgEkaJ9V_B02jIFY9XmzgK1_F?w=500&auto=format",
      },
      {
        fid: "373",
        name: "Jayme Hoffman",
        username: "jayme",
        avatar:
          "https://lh3.googleusercontent.com/kXfYD6XCiZZz5I2lHu_00NfDS-TAzJ700i_pK7RfJiPoyR7LQLJe0S1AfHLAHUgrO4tZtDSn-XpHttdWz5YYt-Ok5E9jai6_wA6gP3Q",
      },
      {
        fid: "194",
        name: "rish",
        username: "rish",
        avatar:
          "https://res.cloudinary.com/merkle-manufactory/image/fetch/c_fill,f_png,w_256/https://lh3.googleusercontent.com/MEaRCAMdER6MKcvmlfN1-0fVxOGz6w98R8CrP_Rpzse9KZudgn95frTd0L0ZViWVklBj9fuAcJuM6tt7P-BRN0ouAR87NpzZeh2DGw",
      },
      {
        fid: "1325",
        name: "Cassie Heart",
        username: "cassie",
        avatar:
          "https://openseauserdata.com/files/494817402e92be3ce3f419788c8dc737.svg",
      },
      {
        fid: "12",
        name: "Linda Xie",
        username: "linda",
        avatar:
          "https://i.seadn.io/gae/r6CW_kgQygQhI7-4JdWt_Nbf_bjFNnEM7dSns1nZGrijJvUMaLnpAFuBLwjsHXTkyX8zfgpRJCYibtm7ojeA2_ASQwSJgh7yKEFVMOI?w=500&auto=format",
      },
      {
        fid: "680",
        name: "woj — q/dau",
        username: "woj.eth",
        avatar: "https://i.imgur.com/UIqZP1q.png",
      },
      {
        fid: "124",
        name: "Giuliano Giacaglia",
        username: "giu",
        avatar:
          "https://res.cloudinary.com/merkle-manufactory/image/fetch/c_fill,f_png,w_256/https://lh3.googleusercontent.com/5IBmao06AhDg3PqXjNi1vm6D-HXDGXtkK8qk9vASUqGuJ4AHo2_p23QmyREZJjfzD9MzzAaHSOE2MWGIAwXGZjYnmTwvaDyz57As",
      },
      {
        fid: "602",
        name: "Jason Goldberg ",
        username: "betashop.eth",
        avatar:
          "https://i.seadn.io/gae/L6orcQneNpLm3BYUN1cDsOAalQdWtWPPEUAMuQzpqNzH1hgQMDom79OBfDC8JI7oPlRoZX_ie_CkBxIqxNeTOo8IiGo0iSwkvUhgIFo?w=500&auto=format",
      },
      {
        fid: "1356",
        name: "borodutch 👈👈😎 q/bangers",
        username: "borodutch",
        avatar:
          "https://i.seadn.io/gae/lizxqvPI1NTC-DrZSEbN95B0dUgngbdsZmILXF8YeQq-v1EmuzImHa0HmVMwdsNrGjN2Yn64v3mYv9e7-kqJuOHmO4op5v_zwPKxWWo?w=500&auto=format",
      },
      {
        fid: "6806",
        name: "dawufigpt - mid/MAU",
        username: "dawufi",
        avatar: "https://i.imgur.com/E51kh9y.gif",
      },
      {
        fid: "378",
        name: "Colin Armstrong",
        username: "colin",
        avatar:
          "https://lh3.googleusercontent.com/Bi85y1_3rVxhL-x8O4QSfSAL27fvgDNmjQ-RH05uuIIGI4i-LsS5TWBTStkYZgL2422kVvLoJ2O5FGWEijOGMQFTi_CvEdsotr6t5A",
      },
      {
        fid: "534",
        name: "mike rainbow (rainbow mike)",
        username: "mikedemarais.eth",
        avatar: "https://i.imgur.com/nqy5Wsi.gif",
      },
      {
        fid: "129",
        name: "phil",
        username: "phil",
        avatar: "https://i.imgur.com/sx6qqM7.jpg",
      },
      {
        fid: "4163",
        name: "KMac🟪⏩",
        username: "kmacb.eth",
        avatar:
          "https://openseauserdata.com/files/12cc9c02bf8d37d0a097745d9e39ae7b.svg",
      },
      {
        fid: "20071",
        name: "Edric",
        username: "edricnguyen.eth",
        avatar: "https://i.imgur.com/t2mJvYg.jpg",
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
