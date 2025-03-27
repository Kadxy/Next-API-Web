/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type ListApiKeyResponseItemData = {
    /**
     * 哈希密钥
     */
    hashKey: string;
    /**
     * 前4位和后4位拼接的字符串, 如asidewsk即rawKey为asid***ewsk, 如果rawKey不足8位，则显示为rawKey的前4位
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
};

