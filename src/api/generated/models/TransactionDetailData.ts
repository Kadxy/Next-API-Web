/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type TransactionDetailData = {
    /**
     * 业务ID
     */
    businessId: string;
    /**
     * 客户端IP
     */
    clientIp: string;
    /**
     * 用户代理
     */
    userAgent: string;
    /**
     * 外部追踪ID
     */
    externalTraceId: string;
    /**
     * 开始时间
     */
    startTime: string;
    /**
     * 结束时间
     */
    endTime: string;
    /**
     * 持续时间(毫秒)
     */
    durationMs: number;
    /**
     * 上游ID
     */
    upstreamId: number;
    /**
     * 模型名称
     */
    model: string;
    /**
     * 服务提供商
     */
    provider: string;
    /**
     * 计费类型
     */
    billingType: string;
    /**
     * 计费数据
     */
    billingData: Record<string, any>;
    /**
     * 创建时间
     */
    createdAt: string;
};

