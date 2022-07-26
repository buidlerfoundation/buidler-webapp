import { gtag, install } from "ga-gtag";

class GoogleAnalytics {
  init() {
    install(process.env.REACT_APP_GA_ID);
  }

  pageView(path: string) {
    gtag("event", "page_view", {
      page_path: path,
    });
  }

  modalView(name: string) {
    gtag("event", "modal_view", {
      name,
    });
  }

  event(args: {
    category: string;
    action: string;
    label?: string;
    value?: number;
  }) {
    gtag("event", args.action, {
      event_category: args.category,
      event_label: args.label,
      value: args.value,
    });
  }
}

export default new GoogleAnalytics();
