import React, { useCallback } from "react";
import { connect } from "react-redux";
import { normalizeUserName } from "renderer/helpers/MessageHelper";
import useAppSelector from "renderer/hooks/useAppSelector";
import images from "../../common/images";
import { activityFromNow, dateFormatted } from "../../utils/DateUtils";
import AvatarView from "../AvatarView";
import "./index.scss";

type ActivityBodyProps = {
  activities: Array<any>;
};

const ActivityBody = ({ activities }: ActivityBodyProps) => {
  const teamUserData = useAppSelector((state) => state.user.teamUserData);
  const renderTitleUpdateValue = useCallback((item: any) => {
    if (item.updated_key.includes("status")) {
      return (
        <div className="status-container">
          <span className={`${item.updated_value}`}>{item.updated_value}</span>
        </div>
      );
    }
    if (item.updated_key.includes("channel")) {
      return (
        <div className="channel-container">
          <span># {item.updated_value}</span>
        </div>
      );
    }
    return null;
  }, []);
  const renderUpdatedValue = useCallback(
    (item: any) => {
      if (
        item.updated_key.includes("title") ||
        item.updated_key.includes("notes")
      ) {
        return (
          <div className="text-container">
            <span className="prev-value">{item.previous_value}</span>
            <span className="update-value" style={{ marginTop: 5 }}>
              {item.updated_value}
            </span>
          </div>
        );
      }
      if (item.updated_key.includes("due_date")) {
        return (
          <div className="date-container">
            <span className="prev-date">
              {dateFormatted(item.previous_value, "DD/MM/YYYY")}
            </span>
            <img
              src={images.icArrowForward}
              alt=""
              style={{ margin: "0 12px" }}
            />
            <span className="update-date">
              {dateFormatted(item.updated_value, "DD/MM/YYYY")}
            </span>
          </div>
        );
      }
      if (item.updated_key.includes("assignee")) {
        const assignee = teamUserData?.find?.(
          (u) => u.user_id === item.updated_value
        );
        if (!assignee) return null;
        return (
          <div className="assignee-container">
            <AvatarView user={assignee} />
            <span className="assignee-name">{assignee.user_name}</span>
          </div>
        );
      }
      return null;
    },
    [teamUserData]
  );
  const renderActivity = useCallback(
    (item: any) => {
      const updater = teamUserData?.find?.((u) => u.user_id === item?.user_id);
      if (!updater) return null;
      return (
        <div className="activity-item__container" key={item.task_activity_id}>
          <AvatarView user={updater} size={35} />
          <div className="activity-action__container">
            <div className="action-row">
              <span className="action-title">
                {normalizeUserName(updater.user_name)}
                {item.action}
              </span>
              {renderTitleUpdateValue(item)}
            </div>
            <span className="action-date">
              {activityFromNow(item.createdAt)}
            </span>
            {renderUpdatedValue(item)}
          </div>
        </div>
      );
    },
    [renderTitleUpdateValue, renderUpdatedValue, teamUserData]
  );
  return (
    <div className="activity-body__container">
      {activities.map(renderActivity)}
    </div>
  );
};

export default ActivityBody;
