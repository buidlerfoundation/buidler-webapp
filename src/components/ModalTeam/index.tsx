import React, { useState, useRef, useEffect } from "react";
import { Modal } from "@material-ui/core";
import "./index.scss";
import Dropzone from "react-dropzone";
import { getUniqueId } from "../../helpers/GenerateUUID";
import api from "../../api";
import CreateCommunityState from "./CreateCommunityState";
import JoinCommunityState from "./JoinCommunityState";
import toast from "react-hot-toast";
import { setCookie } from "common/Cookie";
import { AsyncKey } from "common/AppConfig";

type ModalTeamProps = {
  open: boolean;
  handleClose: () => void;
  onCreateTeam: (teamData: any) => void;
  onAcceptTeam: () => void;
};

const ModalTeam = ({
  open,
  handleClose,
  onCreateTeam,
  onAcceptTeam,
}: ModalTeamProps) => {
  const [tabIndex, setTabIndex] = useState(0);
  const tabs = [{ name: "Create Community" }, { name: "Join Community" }];
  const [teamData, setTeamData] = useState({
    name: "",
  });
  const [link, setLink] = useState("");
  const [file, setFile] = useState<any>(null);
  const inputFileRef = useRef<any>();
  const generateId = useRef<string>("");
  const onAddFile = (fs: any) => {
    if (fs == null) return;
    generateId.current = getUniqueId();
    const data = [...fs];
    const f = data?.[0];
    if (!f) return;
    const attachment = {
      file: URL.createObjectURL(f),
      randomId: Math.random(),
      loading: true,
      type: f.type,
      name: f.name,
    };
    setFile(attachment);
    api.uploadFile(generateId.current, generateId.current, f).then((res) => {
      if (res.statusCode === 200) {
        setFile((current: any) => ({
          ...current,
          loading: false,
          url: res.file_url,
          id: res.file.file_id,
        }));
      } else {
        setFile(null);
      }

      return null;
    });
  };

  const onPaste = (e: any) => {
    const fs = e.clipboardData.files;
    if (fs?.length > 0) {
      onAddFile(fs);
    }
  };

  useEffect(() => {
    generateId.current = "";
    setLink("");
    setFile(null);
    setTeamData({ name: "" });
    setTabIndex(0);
  }, [open]);

  return (
    <Dropzone onDrop={onAddFile} multiple={false}>
      {({ getRootProps, getInputProps }) => (
        <Modal
          open={open}
          onClose={handleClose}
          className="team-modal"
          style={{ backgroundColor: "var(--color-backdrop)" }}
        >
          <div className="team-view__container" {...getRootProps()}>
            <div className="label-wrapper">
              {tabs.map((tab, index) => {
                const isActive = index === tabIndex;
                return (
                  <div
                    className={`tab-item ${isActive ? "active" : ""}`}
                    key={tab.name}
                    onClick={() => setTabIndex(index)}
                  >
                    <span>{tab.name}</span>
                  </div>
                );
              })}
            </div>
            {tabIndex === 0 && (
              <CreateCommunityState
                onAvatarPress={() => inputFileRef.current?.click()}
                onChangeTeamName={(e) => setTeamData({ name: e.target.value })}
                onPaste={onPaste}
                file={file}
                teamName={teamData?.name || ""}
                handleClose={handleClose}
                onCreatePress={() => {
                  if (!teamData.name) return;
                  onCreateTeam({
                    ...teamData,
                    teamIcon: file,
                    teamId: generateId.current,
                  });
                }}
              />
            )}
            {tabIndex === 1 && (
              <JoinCommunityState
                onPaste={async () => {
                  const text = await navigator.clipboard.readText();
                  setLink(text);
                }}
                handleClose={handleClose}
                onJoinPress={async () => {
                  if (!link || !link.includes("invite.buidler")) {
                    toast.error("Invalid invitation link");
                    return;
                  }
                  const idx = link.lastIndexOf("/");
                  const invitationId = link.substring(idx + 1);
                  const res = await api.acceptInvitation(invitationId);
                  if (res.statusCode === 200) {
                    setCookie(AsyncKey.lastTeamId, res.team_id);
                    onAcceptTeam();
                  }
                }}
                link={link}
                onChange={(e) => setLink(e.target.value)}
              />
            )}
            <input
              {...getInputProps()}
              ref={inputFileRef}
              accept="image/*"
              onChange={(e: any) => {
                onAddFile(e.target.files);
                e.target.value = null;
              }}
            />
          </div>
        </Modal>
      )}
    </Dropzone>
  );
};

export default ModalTeam;
