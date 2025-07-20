/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SelfTransactionRecordData } from './SelfTransactionRecordData';
export type SelfTransactionListData = {
    /**
     * 总数量
     */
    total: number;
    /**
     * 当前页码
     */
    page: number;
    /**
     * 每页数量
     */
    pageSize: number;
    /**
     * 总页数
     */
    totalPages: number;
    /**
     * 交易记录列表
     */
    records: Array<SelfTransactionRecordData>;
};

