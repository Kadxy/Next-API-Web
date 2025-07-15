import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/zh-cn";
import { Avatar, Popover, Typography } from "@douyinfe/semi-ui";
import { AvatarProps } from "@douyinfe/semi-ui/lib/es/avatar";


// 注册插件
dayjs.extend(relativeTime);
// 设置语言为中文
dayjs.locale("zh-cn");

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
        const { name, message } = error;

        if (prefix) {
            return `${prefix}: ${name} ${message}`;
        }
        return `${name} ${message}`;
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
    format: string = 'YYYY-MM-DD',
    fallback: string = '-'
) => {
    if (!date) {
        return fallback;
    }

    const dateObj = dayjs(date);
    if (!dateObj.isValid()) {
        return fallback;
    }

    const result = dateObj.format(format);
    if (result === 'Invalid Date') {
        return fallback;
    }
    return result;
};

/**
 * 格式化相对时间
 * @param date 日期
 * @param fallback 格式化失败默认值
 * @returns 相对时间或格式化后的日期
 */
export const formatRelativeTime = (
    date: string | number | Date | undefined | null,
    fallback: string = '-'
) => {
    if (!date) {
        return fallback;
    }

    const dateObj = dayjs(date);
    if (!dateObj.isValid()) {
        return fallback;
    }

    // 如果日期在未来，返回 fallback
    if (dateObj.isAfter(dayjs())) {
        return fallback;
    }

    const diff = dayjs().diff(dateObj, "day");

    // 如果时间差小于7天，使用相对时间，否则显示具体日期
    if (diff < 7) {
        return dateObj.fromNow();
    } else {
        return dateObj.format('YYYY-MM-DD HH:mm');
    }
};

// 为了向后兼容，保留旧函数名称但调用新函数
export const getDayjsEasyRead = formatRelativeTime;

export const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// 格式化额度
export const formatCredit = (creditDecimalString: string, inactivated = false, isZeroUnlimited = false) => {
    if (!creditDecimalString) {
        return <Typography.Text strong type="secondary">
            -
        </Typography.Text>
    }
    const NEGATIVE_COLOR = 'var(--semi-color-danger)';

    const credit = parseFloat(creditDecimalString);
    const isNegative = credit < 0;
    const absolute = Math.abs(credit);

    if (isZeroUnlimited && absolute === 0) {
        return <Typography.Text strong>
            无限制
        </Typography.Text>
    }

    const string = {
        2: `${isNegative ? '-$' : '$'}${absolute.toFixed(2)}`,
        6: `${isNegative ? '-$' : '$'}${absolute.toFixed(6)}`,
    }
    const color = isNegative ? NEGATIVE_COLOR : undefined;

    return (
        <Popover
            style={{ ...inactivated ? { display: 'none' } : {}, padding: '6px 8px' }}
            content={
                <Typography.Text strong style={{ color }}>
                    {string["6"]}
                </Typography.Text>
            }
            position={'topRight'}
        >
            <Typography.Text {...inactivated ? { type: 'tertiary', delete: true } : { style: { color } }} strong>
                {string["2"]}
            </Typography.Text>
        </Popover>
    )
};

// 获取默认头像
export const getDefaultAvatar = (displayName: string, size?: AvatarProps['size']) => {
    let nameStr = displayName.trim();
    if (nameStr.length >= 4) {
        nameStr = nameStr.substring(0, 1).toUpperCase()
    }

    return (
        <Avatar size={size} color='amber'>
            {nameStr}
        </Avatar>
    )
};
