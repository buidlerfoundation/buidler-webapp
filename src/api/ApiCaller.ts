import AppConfig, { AsyncKey } from '../common/AppConfig';
import { getCookie } from '../common/Cookie';
import toast from 'react-hot-toast';

const METHOD_GET = 'get';
const METHOD_POST = 'post';
const METHOD_PUT = 'put';
const METHOD_DELETE = 'delete';
const METHOD_PATCH = 'patch';

async function requestAPI(
  method: string,
  uri: string,
  body?: any,
  serviceBaseUrl?: string
) {
  // Build API header
  const headers: any = {
    Accept: '*/*',
    'Access-Control-Allow-Origin': '*',
  };
  if (body instanceof FormData) {
    // headers['Content-Type'] = 'multipart/form-data';
    // headers = {};
  } else {
    headers['Content-Type'] = 'application/json';
  }

  // Build API url
  let apiUrl = '';
  if (serviceBaseUrl) {
    apiUrl = serviceBaseUrl + uri;
  } else {
    // apiUrl = AppConfig.baseUrl + uri;
    apiUrl = AppConfig.stagingBaseUrl + uri;
  }

  // Get access token and attach it to API request's header
  try {
    const accessToken = getCookie(AsyncKey.accessTokenKey);
    if (accessToken != null) {
      headers.Authorization = `Bearer ${accessToken}`;
    } else {
      console.log('No token is stored');
    }
  } catch (e: any) {
    console.log(e);
  }

  // Build API body
  let contentBody = null;
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
  const fetchOptions = { method, headers, body: contentBody };
  // Run the fetching
  return fetch(apiUrl, fetchOptions)
    .then((res) => {
      return res.json().then((data) => {
        if (res.status !== 200) {
          toast.error(data.message || data);
        }
        if (data.length >= 0) {
          return { data, statusCode: res.status };
        }
        return { ...data, statusCode: res.status };
      });
    })
    .catch((err) => {
      return {
        message: err,
      };
    });
}

const timeRequestMap: { [key: string]: any } = {};

const ApiCaller = {
  get(url: string, baseUrl?: string): Promise<any> {
    return requestAPI(METHOD_GET, url, undefined, baseUrl);
  },

  post(url: string, data?: any, baseUrl?: string): Promise<any> {
    return requestAPI(METHOD_POST, url, data, baseUrl);
  },

  patch(url: string, data?: any, baseUrl?: string): Promise<any> {
    return requestAPI(METHOD_PATCH, url, data, baseUrl);
  },

  put(url: string, data?: any, baseUrl?: string): Promise<any> {
    return requestAPI(METHOD_PUT, url, data, baseUrl);
  },

  delete(url: string, data?: any, baseUrl?: string): Promise<any> {
    return requestAPI(METHOD_DELETE, url, data, baseUrl);
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

export default ApiCaller;
