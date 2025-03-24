import dayjs from "dayjs";

/**
 * 获取错误信息
 * @param error 错误
 * @param prefix 错误前缀
 * @param fallback 错误默认值
 * @returns 错误信息
 * @example getErrorMsg(null) // '未知错误'
 * @example getErrorMsg(new Error('错误信息')) // '错误: 错误信息'
 * @example getErrorMsg(new Error('用户名或密码错误'), '登录失败') // '登录失败: 用户名或密码错误'
 */
export const getErrorMsg = (error: unknown, prefix: string = '', fallback: string = '未知错误') => {
    console.debug(prefix, 'error', error);

    if (error instanceof Error) {
        if (prefix) {
            return `${prefix}: ${error.message}`;
        }
        return error.message;
    }
    return fallback;
};

/**
 * 获取日期格式化字符串
 * @param date 日期
 * @param format 格式化字符串
 * @param fallback 格式化失败默认值
 * @returns 日期格式化字符串
 */
export const getDayjsFormat = (
    date: string | number | Date | undefined | null,
    format: string = 'YYYY-MM-DD HH:mm:ss',
    fallback: string = '-'
) => {
    if (!date) {
        return fallback;
    }

    if (dayjs(date).isValid()) {
        return dayjs(date).format(format);
    }

    return fallback;
};