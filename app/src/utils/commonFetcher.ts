import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { FetcherProps } from "../models/request";

const fetcherBase = async <T>({
  url,
  method,
  postBody,
  ...props
}: FetcherProps): Promise<T> => {
  const config: AxiosRequestConfig<any> = {
    url: url,
    method: method,
    data: postBody || {},
    validateStatus: function (status) {
      return status >= 200 && status < 300;
    },
    ...props,
  };
  const res = await axios.request<T>(config);
  if (!res) {
    throw AxiosError.ERR_NETWORK;
  }
  return res as T;
};

export const transformToFormData = (data: any): FormData => {
  const formData = new FormData();

  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      formData.append(key, data[key]);
    }
  }

  return formData;
};

export const commonFetcher = <T>(props: FetcherProps) => {
  try {
    return fetcherBase<T>(props);
  } catch (ex: AxiosError | unknown) {
    throw ex;
  }
};
