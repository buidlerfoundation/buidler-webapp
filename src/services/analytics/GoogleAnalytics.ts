import mixpanel from "mixpanel-browser";
import { getCategoryByApi, getEventNameByApi } from "helpers/AnalyticHelper";
import { IFCUser } from "models/FC";
import CryptoJS from "crypto-js";

class GoogleAnalytics {
  initial = false;
  init() {
    mixpanel.init(process.env.NEXT_PUBLIC_MIXPANEL_TOKEN, {
      debug: process.env.NODE_ENV === "development",
      opt_out_tracking_by_default: false,
    });
    this.initial = true;
  }

  identify(user: IFCUser) {
    if (!this.initial) {
      this.init();
    }
    mixpanel.identify(CryptoJS.SHA1(user.fid).toString());
    mixpanel.people.set({ name: CryptoJS.SHA1(user.fid).toString() });
  }

  async identifyByExtensionId(id: string) {
    if (!this.initial) {
      this.init();
    }
    mixpanel.identify(id);
    mixpanel.people.set({ name: id });
  }

  tracking(eventName: string, props: { [key: string]: string }) {
    if (!this.initial) {
      this.init();
    }
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
