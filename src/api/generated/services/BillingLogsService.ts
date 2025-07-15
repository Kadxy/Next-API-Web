/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BillingLogDetailResponseDto } from '../models/BillingLogDetailResponseDto';
import type { BillingLogListResponseDto } from '../models/BillingLogListResponseDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class BillingLogsService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * 查询自己的计费日志
     * @returns BillingLogListResponseDto
     * @throws ApiError
     */
    public billingLogControllerQuerySelfBillingLogs({
        memberUid,
        model,
        startTime,
        endTime,
        billStatus,
        page = 1,
        pageSize = 20,
    }: {
        /**
         * 成员UID（钱包owner查询特定成员时使用）
         */
        memberUid?: string,
        /**
         * 模型名称
         */
        model?: string,
        /**
         * 开始时间
         */
        startTime?: string,
        /**
         * 结束时间
         */
        endTime?: string,
        /**
         * 计费状态
         */
        billStatus?: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED',
        /**
         * 页码
         */
        page?: number,
        /**
         * 每页条数
         */
        pageSize?: number,
    }): CancelablePromise<BillingLogListResponseDto> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/billing-logs/self',
            query: {
                'memberUid': memberUid,
                'model': model,
                'startTime': startTime,
                'endTime': endTime,
                'billStatus': billStatus,
                'page': page,
                'pageSize': pageSize,
            },
        });
    }
    /**
     * 查询钱包的计费日志（成员只能看自己的，owner能看全部）
     * @returns BillingLogListResponseDto
     * @throws ApiError
     */
    public billingLogControllerQueryWalletBillingLogs({
        walletUid,
        memberUid,
        model,
        startTime,
        endTime,
        billStatus,
        page = 1,
        pageSize = 20,
    }: {
        walletUid: string,
        /**
         * 成员UID（钱包owner查询特定成员时使用）
         */
        memberUid?: string,
        /**
         * 模型名称
         */
        model?: string,
        /**
         * 开始时间
         */
        startTime?: string,
        /**
         * 结束时间
         */
        endTime?: string,
        /**
         * 计费状态
         */
        billStatus?: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED',
        /**
         * 页码
         */
        page?: number,
        /**
         * 每页条数
         */
        pageSize?: number,
    }): CancelablePromise<BillingLogListResponseDto> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/billing-logs/wallet/{walletUid}',
            path: {
                'walletUid': walletUid,
            },
            query: {
                'memberUid': memberUid,
                'model': model,
                'startTime': startTime,
                'endTime': endTime,
                'billStatus': billStatus,
                'page': page,
                'pageSize': pageSize,
            },
        });
    }
    /**
     * 获取计费日志详情
     * @returns BillingLogDetailResponseDto
     * @throws ApiError
     */
    public billingLogControllerGetBillingLogDetail({
        requestId,
    }: {
        requestId: string,
    }): CancelablePromise<BillingLogDetailResponseDto> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/billing-logs/detail/{requestId}',
            path: {
                'requestId': requestId,
            },
        });
    }
}
