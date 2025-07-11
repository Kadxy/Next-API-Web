/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ListApiKeyResponseItemWalletItemData } from './ListApiKeyResponseItemWalletItemData';
export type ListApiKeyResponseItemData = {
    /**
     * 哈希密钥
     */
    hashKey: string;
    /**
     * 是否有效
     */
    isActive: boolean;
    /**
     * 前4位和后4位拼接的字符串, 如abc123xy即rawKey为sk-abc1**...**23xy
     */
    preview: string;
    /**
     * 显示名称
     */
    displayName: string;
    /**
     * 最后使用时间
     */
    lastUsedAt: string;
    /**
     * 创建时间
     */
    createdAt: string;
    /**
     * 更新时间
     */
    updatedAt: string;
    /**
     * 钱包
     */
    wallet: ListApiKeyResponseItemWalletItemData;
};

