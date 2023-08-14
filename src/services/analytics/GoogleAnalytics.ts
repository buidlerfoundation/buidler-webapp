import mixpanel from "mixpanel-browser";
import { getCategoryByApi, getEventNameByApi } from "helpers/AnalyticHelper";
import { UserData } from "models/User";
import CryptoJS from "crypto-js";
import { getDeviceCode } from "common/Cookie";

class GoogleAnalytics {
  init() {
    mixpanel.init(process.env.REACT_APP_MIXPANEL_TOKEN, {
      debug: process.env.NODE_ENV === "development",
      opt_out_tracking_by_default: false,
    });
  }

  identify(user: UserData) {
    mixpanel.identify();
    mixpanel.people.set({ name: CryptoJS.SHA1(user.user_id).toString() });
  }

  async identifyByDeviceCode() {
    const deviceCode = await getDeviceCode();
    mixpanel.identify();
    mixpanel.people.set({ name: deviceCode });
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
