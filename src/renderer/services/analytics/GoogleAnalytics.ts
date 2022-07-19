import ReactGA from "react-ga";

class GoogleAnalytics {
  init() {
    ReactGA.initialize(process.env.REACT_APP_GA_ID || "", {
      debug: process.env.NODE_ENV === "development",
      testMode: process.env.NODE_ENV === "development",
      alwaysSendToDefaultTracker: true,
    });
  }

  pageView(path: string) {
    ReactGA.pageview(path);
  }

  modalView(name: string) {
    ReactGA.modalview(name);
  }

  event(args: ReactGA.EventArgs) {
    ReactGA.event(args);
  }
}

export default new GoogleAnalytics();
