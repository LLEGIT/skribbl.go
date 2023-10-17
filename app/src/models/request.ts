import { AxiosRequestConfig, Method as AxiosMethod } from "axios";

export enum Method {
    POST = "post",
    GET = "get",
    PUT = "put",
    PATCH = "patch",
    DELETE = "delete",
}

export interface CommonApiResponse<T> {
  data: T;
}

export interface FetcherProps extends AxiosRequestConfig {
  url: string;
  method: AxiosMethod;
  postBody?: any;
}
