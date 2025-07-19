import {CancelablePromise, ServerAPI} from "../generated";
import {STORE_KEYS} from "../../lib/constants/store.ts";

// 定义API响应的通用接口
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    msg?: string;
}

// 响应类型特征提取工具类型
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ExtractResponseData<T> = T extends ApiResponse<infer D> ? D : any;

export const handleResponse = async <T, D = ExtractResponseData<T>>(
    controller: CancelablePromise<T>,
    options: {
        onSuccess?: (data: D) => void | Promise<void>,
        onError?: (msg: string) => void | Promise<void>,
        onFinally?: () => void | Promise<void>,
    }
) => {
    const response = await controller;
    const {success, msg, data = null} = response as unknown as ApiResponse<D>;

    if (success) {
        if (options.onSuccess) {
            const result = options.onSuccess(data!);
            if (result instanceof Promise) {
                await result;
            }
        }

        if (options.onFinally) {
            const result = options.onFinally();
            if (result instanceof Promise) {
                await result;
            }
        }

        return data;
    }

    if (options.onError) {
        const result = options.onError(msg || '');
        if (result instanceof Promise) {
            await result;
        }
    }

    if (options.onFinally) {
        const result = options.onFinally();
        if (result instanceof Promise) {
            await result;
        }
    }

    return null;
}

/** 获取服务器API实例 */
export const getServerApi = () => {
    // 使用 Vite 内置的 MODE 环境变量，而不是自定义的 VITE_NODE_ENV
    const isDev = import.meta.env.MODE === 'development';
    const serverBase = isDev ?
        import.meta.env.VITE_SERVER_BASE_URL_DEV :
        import.meta.env.VITE_SERVER_BASE_URL_PROD;
    const token = localStorage.getItem(STORE_KEYS.TOKEN) || '';

    const config = {
        BASE: serverBase,
        HEADERS: {
            ...(token && {Authorization: `Bearer ${token}`}),
        },
    };

    return new ServerAPI(config);
};
