/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type BillingLogDetailData = {
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
     * 钱包所有者UID
     */
    ownerUid: string;
    /**
     * API Key预览
     */
    apiKeyPreview: string;
    /**
     * 请求头
     */
    requestHeaders?: Record<string, any>;
    /**
     * 请求内容
     */
    requestBody?: Record<string, any>;
    /**
     * 响应头
     */
    responseHeaders?: Record<string, any>;
    /**
     * 响应内容
     */
    responseBody?: Record<string, any>;
    /**
     * 是否流式响应
     */
    responseStream: boolean;
    /**
     * 创建时间
     */
    createdAt: string;
};

