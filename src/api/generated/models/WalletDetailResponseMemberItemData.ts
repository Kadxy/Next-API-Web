/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { WalletDetailResponseMemberUserItemData } from './WalletDetailResponseMemberUserItemData';
export type WalletDetailResponseMemberItemData = {
    /**
     * 钱包成员别名
     */
    alias: string;
    /**
     * 钱包成员额度限制
     */
    creditLimit: string;
    /**
     * 钱包成员已使用额度
     */
    creditUsed: string;
    /**
     * 是否激活
     */
    isActive: string;
    /**
     * 用户信息
     */
    user: WalletDetailResponseMemberUserItemData;
};

