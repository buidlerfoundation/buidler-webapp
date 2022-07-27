import mixpanel from "mixpanel-browser";

class GoogleAnalytics {
  init() {
    mixpanel.init(process.env.REACT_APP_MIXPANEL_TOKEN, {
      debug: process.env.NODE_ENV === "development",
    });
  }

  pageView(path: string) {
    mixpanel.track("page_view", {
      path,
    });
  }

  modalView(name: string) {
    mixpanel.track("modal_view", {
      name,
    });
  }

  event(args: {
    category: string;
    action: string;
    label?: string;
    value?: number;
  }) {
    mixpanel.track(args.action, {
      category: args.category,
      label: args.label,
      value: args.value,
    });
  }
}

export default new GoogleAnalytics();
