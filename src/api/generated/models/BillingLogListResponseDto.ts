/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BillingLogListData } from './BillingLogListData';
export type BillingLogListResponseDto = {
    /**
     * Operation Success
     */
    success: boolean;
    /**
     * Error Message, only when success is false
     */
    msg: string;
    /**
     * Response data, only when success is true
     */
    data: BillingLogListData;
};

