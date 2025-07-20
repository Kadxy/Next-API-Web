/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SelfTransactionListResponseDto } from '../models/SelfTransactionListResponseDto';
import type { TransactionDetailResponseDto } from '../models/TransactionDetailResponseDto';
import type { WalletTransactionListResponseDto } from '../models/WalletTransactionListResponseDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class TransactionService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * 查询当前用户的交易记录
     * @returns SelfTransactionListResponseDto
     * @throws ApiError
     */
    public transactionControllerGetSelfTransactions({
        page,
        pageSize,
        startTime,
        endTime,
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
         * 开始时间
         */
        startTime?: string,
        /**
         * 结束时间
         */
        endTime?: string,
        /**
         * 交易类型
         */
        type?: 'RECHARGE' | 'REDEMPTION' | 'CONSUME' | 'REFUND' | 'ADJUSTMENT',
        /**
         * 交易状态
         */
        status?: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED' | 'FAILED',
    }): CancelablePromise<SelfTransactionListResponseDto> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/transaction/self',
            query: {
                'page': page,
                'pageSize': pageSize,
                'startTime': startTime,
                'endTime': endTime,
                'type': type,
                'status': status,
            },
        });
    }
    /**
     * 查询钱包的交易记录（成员查询自己，所有者可指定用户）
     * @returns WalletTransactionListResponseDto
     * @throws ApiError
     */
    public transactionControllerGetWalletTransactions({
        walletUid,
        page,
        pageSize,
        startTime,
        endTime,
        type,
        status,
        memberUid,
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
         * 开始时间
         */
        startTime?: string,
        /**
         * 结束时间
         */
        endTime?: string,
        /**
         * 交易类型
         */
        type?: 'RECHARGE' | 'REDEMPTION' | 'CONSUME' | 'REFUND' | 'ADJUSTMENT',
        /**
         * 交易状态
         */
        status?: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED' | 'FAILED',
        /**
         * 指定成员用户UID（仅钱包所有者可用）
         */
        memberUid?: string,
    }): CancelablePromise<WalletTransactionListResponseDto> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/transaction/wallet/{walletUid}',
            path: {
                'walletUid': walletUid,
            },
            query: {
                'page': page,
                'pageSize': pageSize,
                'startTime': startTime,
                'endTime': endTime,
                'type': type,
                'status': status,
                'memberUid': memberUid,
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
