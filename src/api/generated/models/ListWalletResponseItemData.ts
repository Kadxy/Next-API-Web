/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ListWalletOwnerItemData } from './ListWalletOwnerItemData';
export type ListWalletResponseItemData = {
    /**
     * 是否所有者
     */
    isOwner: boolean;
    /**
     * 钱包唯一标识符
     */
    uid: string;
    /**
     * 钱包余额
     */
    balance: string;
    /**
     * 钱包名称
     */
    displayName: string;
    /**
     * 钱包成员额度限制, isOwner=false 时展示
     */
    creditLimit: string;
    /**
     * 钱包成员已使用额度, isOwner=false 时展示
     */
    creditUsed: string;
    /**
     * 钱包所有者信息
     */
    owner: ListWalletOwnerItemData;
};

