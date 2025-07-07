/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { WalletDetailResponseMemberItemData } from './WalletDetailResponseMemberItemData';
export type WalletDetailResponseItemData = {
    /**
     * 钱包唯一标识符
     */
    uid: string;
    /**
     * 钱包名称
     */
    displayName: string;
    /**
     * 钱包余额
     */
    balance: string;
    /**
     * 创建时间
     */
    createdAt: string;
    /**
     * 更新时间
     */
    updatedAt: string;
    /**
     * 钱包成员
     */
    members: Array<WalletDetailResponseMemberItemData>;
};

