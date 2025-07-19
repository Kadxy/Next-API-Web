/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { TransactionDetailResponseDto } from '../models/TransactionDetailResponseDto';
import type { TransactionListResponseDto } from '../models/TransactionListResponseDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class TransactionService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * 查询当前用户的交易记录
     * @returns TransactionListResponseDto
     * @throws ApiError
     */
    public transactionControllerGetSelfTransactions({
        page,
        pageSize,
        startDate,
        endDate,
        type,
        status,
    }: {
        /**
         * 页码
         */
        page?: number,
        /**
         * 每页数量
         */
        pageSize?: number,
        /**
         * 开始日期
         */
        startDate?: string,
        /**
         * 结束日期
         */
        endDate?: string,
        /**
         * 交易类型
         */
        type?: 'RECHARGE' | 'REDEMPTION' | 'CONSUME' | 'REFUND' | 'ADJUSTMENT' | 'SUBSCRIPTION' | 'OTHER',
        /**
         * 交易状态
         */
        status?: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED',
    }): CancelablePromise<TransactionListResponseDto> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/transaction/self',
            query: {
                'page': page,
                'pageSize': pageSize,
                'startDate': startDate,
                'endDate': endDate,
                'type': type,
                'status': status,
            },
        });
    }
    /**
     * 查询钱包的交易记录（仅钱包所有者）
     * @returns TransactionListResponseDto
     * @throws ApiError
     */
    public transactionControllerGetWalletTransactions({
        walletUid,
        page,
        pageSize,
        startDate,
        endDate,
        type,
        status,
        userId,
    }: {
        walletUid: string,
        /**
         * 页码
         */
        page?: number,
        /**
         * 每页数量
         */
        pageSize?: number,
        /**
         * 开始日期
         */
        startDate?: string,
        /**
         * 结束日期
         */
        endDate?: string,
        /**
         * 交易类型
         */
        type?: 'RECHARGE' | 'REDEMPTION' | 'CONSUME' | 'REFUND' | 'ADJUSTMENT' | 'SUBSCRIPTION' | 'OTHER',
        /**
         * 交易状态
         */
        status?: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED',
        /**
         * 指定用户ID
         */
        userId?: number,
    }): CancelablePromise<TransactionListResponseDto> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/transaction/wallet/{walletUid}',
            path: {
                'walletUid': walletUid,
            },
            query: {
                'page': page,
                'pageSize': pageSize,
                'startDate': startDate,
                'endDate': endDate,
                'type': type,
                'status': status,
                'userId': userId,
            },
        });
    }
    /**
     * 查询交易详情
     * @returns TransactionDetailResponseDto
     * @throws ApiError
     */
    public transactionControllerGetTransactionDetail({
        businessId,
    }: {
        businessId: string,
    }): CancelablePromise<TransactionDetailResponseDto> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/transaction/detail/{businessId}',
            path: {
                'businessId': businessId,
            },
        });
    }
}
