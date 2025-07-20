export const MY_WALLET_UID = 'SELF';


// 交易类型映射
export const TRANSACTION_TYPE_MAP = {
    RECHARGE: {text: '充值', color: 'green'},
    REDEMPTION: {text: '兑换', color: 'blue'},
    CONSUME: {text: '消费', color: 'orange'},
    REFUND: {text: '退款', color: 'cyan'},
    ADJUSTMENT: {text: '调整', color: 'purple'},
    SUBSCRIPTION: {text: '订阅', color: 'indigo'},
    OTHER: {text: '其他', color: 'grey'}
} as const;

export const TRANSACTION_TYPE_OPTIONS = Object.keys(TRANSACTION_TYPE_MAP).map(key => ({
    label: TRANSACTION_TYPE_MAP[key as keyof typeof TRANSACTION_TYPE_MAP].text,
    value: key,
}));

// 交易状态映射
export const TRANSACTION_STATUS_MAP = {
    PENDING: {text: '待处理', color: 'amber'},
    PROCESSING: {text: '处理中', color: 'blue'},
    COMPLETED: {text: '已完成', color: 'green'},
    FAILED: {text: '失败', color: 'red'},
    CANCELLED: {text: '已取消', color: 'grey'}
} as const;

export const TRANSACTION_STATUS_OPTIONS = Object.keys(TRANSACTION_STATUS_MAP).map(key => ({
    label: TRANSACTION_STATUS_MAP[key as keyof typeof TRANSACTION_STATUS_MAP].text,
    value: key,
}));

export interface TransactionQueryParams {
    type: 'RECHARGE' | 'REDEMPTION' | 'CONSUME' | 'REFUND' | 'ADJUSTMENT' | 'SUBSCRIPTION' | 'OTHER' | undefined;
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | undefined;
    startTime: string | undefined;
    endTime: string | undefined;
    walletUid: string | undefined;
    memberUid: string | undefined;
}

export const DEFAULT_TRANSACTION_QUERY_PARAMS: TransactionQueryParams = {
    type: undefined,
    status: undefined,
    startTime: undefined,
    endTime: undefined,
    walletUid: MY_WALLET_UID,
    memberUid: undefined,
}

export const DEFAULT_PAGINATION_STATE = {
    current: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0,
}