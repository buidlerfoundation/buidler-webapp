import mixpanel from "mixpanel-browser";
import { getCategoryByApi, getEventNameByApi } from "helpers/AnalyticHelper";
import { UserData } from "models/User";

class GoogleAnalytics {
  init() {
    mixpanel.init(process.env.REACT_APP_MIXPANEL_TOKEN, {
      debug: process.env.NODE_ENV === "development",
      opt_out_tracking_by_default: true,
    });
  }

  identify(user: UserData) {
    mixpanel.identify();
    // mixpanel.people.set({ name: user.user_name });
  }

  tracking(eventName: string, props: { [key: string]: string }) {
    mixpanel.track(eventName, props);
  }

  trackingError(
    apiUrl: string,
    method: string,
    errorMessage: string,
    statusCode: number,
    reqBody?: any
  ) {
    this.tracking(getEventNameByApi(apiUrl, method, reqBody), {
      category: getCategoryByApi(apiUrl, method, reqBody),
      request_time: `${new Date().getTime()}`,
      url: apiUrl,
      error_code: `${statusCode}`,
      error_message: errorMessage,
    });
  }
}

export default new GoogleAnalytics();
