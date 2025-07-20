/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApiKeyInfoData } from './ApiKeyInfoData';
import type { UserInfoData } from './UserInfoData';
export type WalletOwnerTransactionRecordData = {
    /**
     * 业务ID
     */
    businessId: string;
    /**
     * 交易类型
     */
    type: 'RECHARGE' | 'REDEMPTION' | 'CONSUME' | 'REFUND' | 'ADJUSTMENT';
    /**
     * 金额（Decimal类型）
     */
    amount: Record<string, any>;
    /**
     * 描述
     */
    description: string;
    /**
     * 状态
     */
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED' | 'FAILED';
    /**
     * 错误信息
     */
    errorMessage?: string;
    /**
     * 创建时间
     */
    createdAt: string;
    /**
     * 更新时间
     */
    updatedAt: string;
    /**
     * API Key信息
     */
    apiKey?: ApiKeyInfoData;
    /**
     * 用户信息
     */
    user: UserInfoData;
};

