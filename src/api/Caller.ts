import toast from "react-hot-toast";
import GlobalVariable from "services/GlobalVariable";
import AppConfig, {
  AsyncKey,
  ignoreMessageErrorApis,
  importantApis,
} from "../common/AppConfig";
import { clearData, getCookie } from "../common/Cookie";
import { BaseDataApi } from "models/User";
import { logoutAction } from "reducers/actions";

const METHOD_GET = "get";
const METHOD_POST = "post";
const METHOD_PUT = "put";
const METHOD_DELETE = "delete";
const METHOD_PATCH = "patch";

export const sleep = (timeout = 1000) => {
  return new Promise((resolve) => {
    setTimeout(resolve, timeout);
  });
};

const handleClearDataAndReload = () => {
  if (!GlobalVariable.sessionExpired) {
    GlobalVariable.sessionExpired = true;
    clearData(() => {
      if (typeof window !== "undefined") {
        const path = window.location.pathname;
        if (!path.includes("/plugin-fc")) {
          toast.error("Session expired");
          // comment out reload
          // window.location.reload();
        } else {
          GlobalVariable.sessionExpired = false;
          window.parent.postMessage("session-expired", "*");
        }
      }
    });
  }
};

const handleError = (message: string, apiData: any, withoutError?: boolean) => {
  if (message.includes("Failed to authenticate token")) {
    handleClearDataAndReload();
    return;
  }
  const { uri, fetchOptions } = apiData;
  const compareUri = `${fetchOptions.method}-${uri}`;
  const importantApi = importantApis.find((el) => {
    if (el.exact) {
      return compareUri === el.uri;
    }
    return compareUri.includes(el.uri);
  });
  if (importantApi) {
    // store dispatch something wrong
    throw new Error("Something wrong");
  } else if (
    !ignoreMessageErrorApis.includes(compareUri) &&
    !withoutError &&
    message !== "Failed to fetch"
  ) {
    toast.error(message);
  }
};

const fetchWithRetry: any = (
  uri: string,
  fetchOptions: any = {},
  retries = 0,
  serviceBaseUrl?: string,
  withoutError?: boolean
) => {
  let apiUrl = "";
  if (serviceBaseUrl) {
    apiUrl = serviceBaseUrl + uri;
  } else {
    apiUrl = AppConfig.apiBaseUrl + uri;
  }
  return fetch(apiUrl, fetchOptions)
    .then((res) => {
      return res
        .json()
        .then(async (data) => {
          if (res.status !== 200) {
            handleError(
              data.message || data,
              { uri, fetchOptions },
              withoutError
            );
            return { ...data, statusCode: res.status };
          }
          if (data.data) {
            return { ...data, statusCode: res.status };
          }
          if (data.success || data.message) {
            return {
              data: data.data,
              success: data.success,
              message: data.message,
              statusCode: res.status,
            };
          }
          return { data, statusCode: res.status };
        })
        .catch((err) => {
          return { message: err, statusCode: res.status };
        });
    })
    .catch(async (err) => {
      const msg = err.message || err || "";
      if (msg === "Failed to fetch") {
        if (retries > 0) {
          await sleep();
          return fetchWithRetry(
            uri,
            fetchOptions,
            retries - 1,
            serviceBaseUrl,
            withoutError
          );
        }
      }
      if (!msg.includes("aborted")) {
        handleError(msg, { uri, fetchOptions }, withoutError);
      }
      return {
        message: msg,
      };
    });
};

// function isWhiteList(method: string, uri: string) {
//   return (
//     whiteListRefreshTokenApis.includes(`${method}-${uri}`) ||
//     /authentication\/ott\/.*/.test(`${method}-${uri}`) ||
//     /get-external\?url=.*/.test(`${method}-${uri}`) ||
//     /signers/.test(`${method}-${uri}`) ||
//     /users/.test(`${method}-${uri}`)
//   );
// }

async function requestAPI<T = any>(
  method: string,
  uri: string,
  body?: any,
  serviceBaseUrl?: string,
  controller?: AbortController,
  h?: any,
  withoutError?: boolean
): Promise<BaseDataApi<T>> {
  if (GlobalVariable.sessionExpired) {
    return {
      success: false,
      statusCode: 403,
    };
  }
  // if (!isWhiteList(method, uri)) {
  //   const expireTokenTime = await getCookie(AsyncKey.tokenExpire);
  //   if (expireTokenTime && new Date().getTime() / 1000 > expireTokenTime) {
  //     const { success, message } = await store
  //       .dispatch(refreshTokenAction())
  //       .unwrap();
  //     if (!success) {
  //       if (
  //         message === "Failed to authenticate refresh token" ||
  //         message === "Failed to authenticate token"
  //       ) {
  //         handleClearDataAndReload();
  //       } else {
  //         toast.error(message);
  //       }
  //       return {
  //         success: false,
  //         statusCode: 403,
  //       };
  //     }
  //     // re init socket
  //   }
  // }
  // Build API header
  let headers: any = {
    Accept: "*/*",
    "Access-Control-Allow-Origin": "*",
  };
  if (body instanceof FormData) {
    // headers['Content-Type'] = 'multipart/form-data';
    // headers = {};
  } else {
    headers["Content-Type"] = "application/json";
  }

  // Get access token and attach it to API request's header
  try {
    const accessToken = await getCookie(AsyncKey.accessTokenKey);
    if (accessToken != null) {
      headers.Authorization = `Bearer ${accessToken}`;
    }
  } catch (e: any) {
    console.log(e);
  }

  if (h) {
    headers = {
      ...headers,
      ...h,
    };
  }

  // Build API body
  let contentBody: any = null;
  if (
    method.toLowerCase() === METHOD_POST ||
    method.toLowerCase() === METHOD_PUT ||
    method.toLowerCase() === METHOD_DELETE ||
    method.toLowerCase() === METHOD_PATCH
  ) {
    if (body) {
      if (body instanceof FormData) {
        contentBody = body;
      } else {
        contentBody = JSON.stringify(body);
      }
    }
  }
  // Construct fetch options
  const fetchOptions: RequestInit = { method, headers, body: contentBody };
  if (!!controller) {
    fetchOptions.signal = controller.signal;
  }
  // Run the fetching
  if (!navigator.onLine) {
    return Promise.reject(Error("No internet connection"));
  }
  const compareUri = `${method}-${uri}`;
  const importantApi = importantApis.find((el) => {
    if (el.exact) {
      return compareUri === el.uri;
    }
    return compareUri.includes(el.uri);
  });
  return fetchWithRetry(
    uri,
    fetchOptions,
    importantApi ? 5 : 0,
    serviceBaseUrl,
    withoutError
  );
}

const timeRequestMap: { [key: string]: any } = {};

const Caller = {
  get<T>(
    url: string,
    baseUrl?: string,
    controller?: AbortController,
    withoutError?: boolean
  ) {
    return requestAPI<T>(
      METHOD_GET,
      url,
      undefined,
      baseUrl,
      controller,
      undefined,
      withoutError
    );
  },

  post<T>(
    url: string,
    data?: any,
    baseUrl?: string,
    controller?: AbortController,
    h?: any
  ) {
    return requestAPI<T>(METHOD_POST, url, data, baseUrl, controller, h);
  },

  patch<T>(
    url: string,
    data?: any,
    baseUrl?: string,
    controller?: AbortController
  ) {
    return requestAPI<T>(METHOD_PATCH, url, data, baseUrl, controller);
  },

  put<T>(
    url: string,
    data?: any,
    baseUrl?: string,
    controller?: AbortController
  ) {
    return requestAPI<T>(METHOD_PUT, url, data, baseUrl, controller);
  },

  delete<T>(
    url: string,
    data?: any,
    baseUrl?: string,
    controller?: AbortController
  ) {
    return requestAPI<T>(METHOD_DELETE, url, data, baseUrl, controller);
  },

  getWithLatestResponse(url: string, baseUrl?: string): Promise<any> {
    const currentTime = new Date().getTime();
    if (!timeRequestMap[url]) {
      timeRequestMap[url] = {
        requestTime: currentTime,
      };
    } else {
      timeRequestMap[url].requestTime = currentTime;
    }
    return new Promise((resolve) => {
      return requestAPI(METHOD_GET, url, undefined, baseUrl).then(
        (res: any) => {
          const { requestTime } = timeRequestMap[url] || {};
          if (requestTime !== currentTime) {
            return resolve({ statusCode: 400, cancelled: true });
          }
          delete timeRequestMap[url];
          return resolve(res);
        }
      );
    });
  },

  postWithLatestResponse(
    url: string,
    data?: any,
    baseUrl?: string
  ): Promise<any> {
    const currentTime = new Date().getTime();
    if (!timeRequestMap[url]) {
      timeRequestMap[url] = {
        requestTime: currentTime,
      };
    } else {
      timeRequestMap[url].requestTime = currentTime;
    }
    return new Promise((resolve) => {
      return requestAPI(METHOD_POST, url, data, baseUrl).then((res: any) => {
        const { requestTime } = timeRequestMap[url] || {};
        if (requestTime !== currentTime) {
          return resolve({ statusCode: 400, cancelled: true });
        }
        delete timeRequestMap[url];
        return resolve(res);
      });
    });
  },
};

export default Caller;
