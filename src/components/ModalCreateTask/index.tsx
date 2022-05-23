import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import Modal from '@material-ui/core/Modal';
import './index.scss';
import CreateTaskView from './CreateTaskView';
import ModalCreateTaskFullScreen from '../ModalCreateTaskFullScreen';
import { ProgressStatus } from '../../common/AppConfig';
import api from '../../api';
import { getUniqueId } from '../../helpers/GenerateUUID';

type ModalCreateTaskProps = {
  open: boolean;
  handleClose: () => void;
  onCreateTask: (taskData: any, id: string) => void;
  currentTeam: any;
  currentChannel: any;
  currentTitle: string | null;
  channels: Array<any>;
};

const ModalCreateTask = ({
  open,
  handleClose,
  onCreateTask,
  currentTeam,
  currentChannel,
  currentTitle,
  channels,
}: ModalCreateTaskProps) => {
  const generateId = useRef<string>('');
  const initialState = useMemo(
    () => ({
      currentStatus: currentTitle
        ? ProgressStatus.find((el) => el.title === currentTitle)
        : ProgressStatus[0],
      assignee: currentChannel?.user,
      dueDate: '',
      channels:
        currentChannel?.user?.user_channels
          ?.filter((el: string) => !!channels.find((c) => c.channel_id === el))
          ?.map((el: string) => channels.find((c) => c.channel_id === el)) ||
        [],
      title: '',
      notes: '',
      attachments: [],
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentChannel?.user, currentTitle]
  );
  const [taskData, setTaskData] = useState<any>(initialState);
  const [isFullScreen, setFullScreen] = useState(false);
  const toggleFullScreen = () => {
    setFullScreen(true);
  };
  const createTask = useCallback(() => {
    if (taskData.title === '') return;
    onCreateTask(taskData, generateId.current);
  }, [taskData, onCreateTask]);
  useEffect(() => {
    if (open) {
      generateId.current = '';
      setTaskData(initialState);
    }
  }, [open, initialState]);
  useEffect(() => {
    const listener = (event: any) => {
      if (event.metaKey && event.key === 'Enter' && open) {
        event.preventDefault();
        createTask();
      }
    };
    document.addEventListener('keydown', listener);
    return () => {
      document.removeEventListener('keydown', listener);
    };
  }, [taskData, createTask, open]);
  if (!open) return null;
  if (isFullScreen) {
    return (
      <ModalCreateTaskFullScreen
        handleClose={() => {
          handleClose();
          setFullScreen(false);
        }}
        open={open}
        onCreateTask={createTask}
        taskData={taskData}
        update={(key, val) => {
          setTaskData((data: any) => ({ ...data, [key]: val }));
        }}
      />
    );
  }
  return (
    <Modal
      open={open}
      onClose={() => {
        handleClose();
        setTaskData(initialState);
      }}
      className="create-ticket-modal"
      BackdropProps={{
        style: {
          backgroundColor: 'var(--color-backdrop)',
        },
      }}
    >
      <div style={{ display: 'table' }}>
        <CreateTaskView
          currentChannel={currentChannel}
          onCancel={handleClose}
          onCreate={() => {
            if (taskData.title.trim() !== '')
              onCreateTask(taskData, generateId.current);
          }}
          toggleFullScreen={toggleFullScreen}
          taskData={taskData}
          update={(key, val) => {
            setTaskData((data: any) => ({ ...data, [key]: val }));
          }}
          onRemoveFile={(file) => {
            setTaskData((task: any) => ({
              ...task,
              attachments: task.attachments.filter(
                (att: any) => att.randomId !== file.randomId
              ),
            }));
          }}
          onAddFiles={(files) => {
            if (files == null) return;
            if (generateId.current === '') {
              generateId.current = getUniqueId();
            }
            const data = [...files];
            data.forEach((f) => {
              const attachment = {
                file: URL.createObjectURL(f),
                randomId: Math.random(),
                loading: true,
                type: f.type,
                name: f.name,
              };
              setTaskData((task: any) => ({
                ...task,
                attachments: [...task.attachments, attachment],
              }));
              api
                .uploadFile(currentTeam.team_id, generateId.current, f)
                .then((res) => {
                  setTaskData((task: any) => {
                    let newAttachments = [...task.attachments];
                    if (res.statusCode === 200) {
                      const index = newAttachments.findIndex(
                        (a: any) => a.randomId === attachment.randomId
                      );
                      newAttachments[index] = {
                        ...newAttachments[index],
                        loading: false,
                        url: res.file_url,
                        id: res.file.file_id,
                      };
                    } else {
                      newAttachments = newAttachments.filter(
                        (el) => el.randomId !== attachment.randomId
                      );
                    }

                    return {
                      ...task,
                      attachments: newAttachments,
                    };
                  });
                  return null;
                });
            });
          }}
        />
      </div>
    </Modal>
  );
};

export default ModalCreateTask;
