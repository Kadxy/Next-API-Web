/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BillingLogItemData } from './BillingLogItemData';
export type BillingLogListData = {
    /**
     * 记录列表
     */
    items: Array<BillingLogItemData>;
    /**
     * 总记录数
     */
    total: number;
    /**
     * 当前页
     */
    page: number;
    /**
     * 每页条数
     */
    pageSize: number;
    /**
     * 总页数
     */
    totalPages: number;
};

