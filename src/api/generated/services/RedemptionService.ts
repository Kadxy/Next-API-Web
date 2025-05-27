/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateRedemptionCodeDto } from '../models/CreateRedemptionCodeDto';
import type { CreateRedemptionCodeResponseDto } from '../models/CreateRedemptionCodeResponseDto';
import type { GetAllRedemptionCodesResponseDto } from '../models/GetAllRedemptionCodesResponseDto';
import type { RedeemCodeDto } from '../models/RedeemCodeDto';
import type { RedeemCodeResponseDto } from '../models/RedeemCodeResponseDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class RedemptionService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * 获取所有兑换码
     * @returns GetAllRedemptionCodesResponseDto
     * @throws ApiError
     */
    public redemptionControllerGetAllRedemptionCodes(): CancelablePromise<GetAllRedemptionCodesResponseDto> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/redemption',
        });
    }
    /**
     * 创建兑换码
     * @returns CreateRedemptionCodeResponseDto
     * @throws ApiError
     */
    public redemptionControllerCreateCode({
        requestBody,
    }: {
        requestBody: CreateRedemptionCodeDto,
    }): CancelablePromise<CreateRedemptionCodeResponseDto> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/redemption',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * 兑换
     * @returns RedeemCodeResponseDto
     * @throws ApiError
     */
    public redemptionControllerRedeem({
        requestBody,
    }: {
        requestBody: RedeemCodeDto,
    }): CancelablePromise<RedeemCodeResponseDto> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/redemption/redeem',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
