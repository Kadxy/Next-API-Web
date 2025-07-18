/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type EpayPriceResponseData = {
    /**
     * 充值美元额度, 2位小数
     */
    quota: string;
    /**
     * 人民币价格, 2位小数
     */
    amount: string;
    /**
     * 美元兑换人民币汇率, 2位小数
     */
    exchangeRate: string;
    /**
     * 原始汇率, 2位小数
     */
    originalExchangeRate: string;
    /**
     * 原始金额, 2位小数
     */
    originalAmount: string;
};

