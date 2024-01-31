import AppConfig from "common/AppConfig";
import { BaseDataApi } from "models/User";

const METHOD_GET = "get";
const METHOD_POST = "post";
const METHOD_PUT = "put";
const METHOD_DELETE = "delete";
const METHOD_PATCH = "patch";

async function requestAPI<T = any>(
  method: string,
  uri: string,
  body?: any,
  serviceBaseUrl?: string,
  controller?: AbortController,
  h?: any,
  withoutError?: boolean
): Promise<BaseDataApi<T>> {
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
  const fetchOptions: RequestInit = {
    method,
    headers,
    body: contentBody,
    next: { revalidate: 3600 },
  };
  if (!!controller) {
    fetchOptions.signal = controller.signal;
  }
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
      return {
        message: msg,
      };
    });
}

const CallerServer = {
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
};

export default CallerServer;
