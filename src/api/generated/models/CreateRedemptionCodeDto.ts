/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type CreateRedemptionCodeDto = {
    /**
     * 充值金额，整数
     */
    amount: number;
    /**
     * 过期时间，默认 90 天后
     */
    expiredAt?: string;
    /**
     * 备注
     */
    remark?: string;
};

