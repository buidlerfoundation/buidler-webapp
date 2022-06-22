import React from "react";
import EmptyView from "renderer/pages/Home/container/EmptyView";
import "./index.scss";

const EmptyTeamView = () => {
  return (
    <div className="empty__container">
      <div className="page-body">
        <div className="side-bar-view" />
        <EmptyView />
      </div>
    </div>
  );
};

export default EmptyTeamView;
