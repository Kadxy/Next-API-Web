/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type BillingLogItemData = {
    /**
     * 请求ID
     */
    requestId: string;
    /**
     * 钱包UID
     */
    walletUid: string;
    /**
     * 用户UID
     */
    userUid: string;
    /**
     * 模型名称
     */
    model: string;
    /**
     * 开始时间
     */
    startTime: string;
    /**
     * 结束时间
     */
    endTime: string;
    /**
     * 耗时(毫秒)
     */
    durationMs: number;
    /**
     * 输入token数
     */
    inputToken: number;
    /**
     * 输出token数
     */
    outputToken: number;
    /**
     * 费用
     */
    cost: string;
    /**
     * 计费状态
     */
    billStatus: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
    /**
     * 错误信息
     */
    errorMessage?: string;
    /**
     * 创建时间
     */
    createdAt: string;
};

