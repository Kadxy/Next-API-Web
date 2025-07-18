/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type EpayRechargeRequestDto = {
    /**
     * 充值美元额度
     */
    quota: string;
    /**
     * 支付方式
     */
    paymentMethod: 'wxpay' | 'alipay' | 'qqpay';
};

