/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { EpayPriceResponseDto } from '../models/EpayPriceResponseDto';
import type { EpayRechargeRequestDto } from '../models/EpayRechargeRequestDto';
import type { QueryOrderResponseDto } from '../models/QueryOrderResponseDto';
import type { RechargeResponseV1Dto } from '../models/RechargeResponseV1Dto';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class EpayService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * 传入充值美元额度, 获取充值价格、人民币价格、汇率
     * @returns EpayPriceResponseDto
     * @throws ApiError
     */
    public epayControllerGetPrice({
        quota,
    }: {
        /**
         * 充值美元额度
         */
        quota: string,
    }): CancelablePromise<EpayPriceResponseDto> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/epay/price',
            query: {
                'quota': quota,
            },
        });
    }
    /**
     * 传入充值美元额度、支付方式, 创建充值订单
     * @returns RechargeResponseV1Dto
     * @throws ApiError
     */
    public epayControllerHandleRecharge({
        walletUid,
        requestBody,
    }: {
        walletUid: string,
        requestBody: EpayRechargeRequestDto,
    }): CancelablePromise<RechargeResponseV1Dto> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/epay/recharge/wallet/{walletUid}',
            path: {
                'walletUid': walletUid,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * 传入trade_no, 查询订单状态
     * @returns QueryOrderResponseDto
     * @throws ApiError
     */
    public epayControllerHandleQueryOrder({
        tradeNo,
    }: {
        tradeNo: string,
    }): CancelablePromise<QueryOrderResponseDto> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/epay/query/{trade_no}',
            path: {
                'trade_no': tradeNo,
            },
        });
    }
    /**
     * 处理易支付平台回调, 返回成功状态
     * @returns any
     * @throws ApiError
     */
    public epayControllerHandleNotify(): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/epay/notify',
        });
    }
}
