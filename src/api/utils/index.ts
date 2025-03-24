import { CancelablePromise, ServerAPI } from "../generated";

// 定义API响应的通用接口
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    msg?: string;
}

// 响应类型特征提取工具类型
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ExtractResponseData<T> = T extends ApiResponse<infer D> ? D : any;

/**
 * 解析API响应
 * @param response API响应对象
 * @param options 处理选项
 * @returns 成功时返回data字段，失败时返回null
 * @deprecated 使用`handleResponse`替代
 */
export const parseResponse = <T, D = ExtractResponseData<T>>(
    response: T,
    options: {
        onSuccess?: (data: D) => void,
        onError?: (msg: string) => void,
    }
) => {
    // 将响应转换为ApiResponse类型
    const { success, msg, data=null } = response as unknown as ApiResponse<D>;

    if (success) {
        options.onSuccess?.(data!);
        return data;
    }

    options.onError?.(msg || '');
    return null;
}

export const handleResponse = async <T, D = ExtractResponseData<T>>(
    controller: CancelablePromise<T>,
    options: {
        onSuccess?: (data: D) => void | Promise<void>,
        onError?: (msg: string) => void | Promise<void>,
    }
) => {
    const response = await controller;
    const { success, msg, data = null } = response as unknown as ApiResponse<D>;

    if (success) {
        if (options.onSuccess) {
            const result = options.onSuccess(data!);
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
    
    return null;
}

/** 获取服务器API实例 */
export const getServerApi = () => {
    const token = localStorage.getItem('token') || '';

    const config = {
        BASE: import.meta.env.VITE_SERVER_BASE_URL,
        HEADERS: {
            ...(token && {Authorization: `Bearer ${token}`}),
        },
    };

    return new ServerAPI(config);
};
