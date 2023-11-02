import { ApiResponseData as ApiResponseDataData } from "@/interfaces";
import { AxiosRequestConfig, AxiosResponseHeaders, InternalAxiosRequestConfig, RawAxiosResponseHeaders } from 'axios'

export type ApiResponseData<T = any> = {
    success: boolean,
    message: string,
    data: T,
}

type AxiosResponseData<T = any> = {
    data: ApiResponseDataData<T>;
    status: number;
    statusText: string;
    headers: RawAxiosResponseHeaders | AxiosResponseHeaders;
    config: InternalAxiosRequestConfig;
    request?: any;
}

export interface CustomAxiosInstance {
    request<T = any> (config: AxiosRequestConfig): Promise<AxiosResponseData<T>>;
    get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponseData<T>>;
    delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponseData<T>>;
    head<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponseData<T>>;
    post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponseData<T>>;
    put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponseData<T>>;
    patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponseData<T>>;
}

export default interface IQuestion {
    [x: "Câu hỏi" | "Đáp án 1 ( Đáp án đúng)" | "Đáp án 2" | "Đáp án 3" | "Đáp án 4" | "question" | "answers" | "correctAnswer" | string] : string | number | Array<string> | null;
}