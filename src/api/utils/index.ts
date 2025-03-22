import { ServerAPI } from "../generated";

type ServerResponse<D = unknown> =
    | { success: true; data?: D; msg: never }
    | { success: false, msg: string, data: never }

export const parseResponse = <T extends ServerResponse<D>, D = unknown>(
    response: T,
    options: {
        onSuccess?: (data: T["data"] | null) => void,
        onError?: (msg: string) => void,
    }
) => {
    const { success, msg = '', data = null } = response;

    if (success) {
        options.onSuccess?.(data);
        return data;
    }

    options.onError?.(msg);
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
