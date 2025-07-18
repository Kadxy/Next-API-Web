/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type EpayCreateOrderResponseV1 = {
    /**
     * 返回状态码，1 为成功，其它值为失败
     */
    code: number;
    /**
     * 错误信息，失败时返回原因
     */
    msg: string;
    /**
     * 支付订单号
     */
    trade_no: string;
    /**
     * 支付跳转url, 与qrcode/urlscheme三选一
     */
    payurl: string;
    /**
     * 二维码链接, 与payurl/urlscheme三选一
     */
    qrcode: string;
    /**
     * 小程序跳转url, 与payurl/qrcode三选一
     */
    urlscheme: string;
};

