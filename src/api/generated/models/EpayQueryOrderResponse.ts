/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type EpayQueryOrderResponse = {
    /**
     * 返回状态码，1 为成功，其它值为失败
     */
    code: number;
    /**
     * 错误信息，失败时返回原因
     */
    msg: string;
    /**
     * 平台订单号
     */
    trade_no: string;
    /**
     * 商户订单号
     */
    out_trade_no: string;
    /**
     * 接口订单号，微信支付宝返回的单号
     */
    api_trade_no: string;
    /**
     * 支付方式
     */
    type: 'wxpay' | 'alipay' | 'qqpay';
    /**
     * 支付状态，0未支付，**1已支付**，2已退款，3已冻结，4预授权
     */
    status: 0 | 1 | 2 | 3 | 4;
    /**
     * 商户ID
     */
    pid: number;
    /**
     * 订单创建时间
     */
    addtime: string;
    /**
     * 订单完成时间，仅完成才返回
     */
    endtime: string;
    /**
     * 商品名称
     */
    name: string;
    /**
     * 商品金额
     */
    money: string;
    /**
     * 已退款金额，仅部分退款情况才返回
     */
    refundmoney: string;
    /**
     * 业务扩展参数
     */
    param: string;
    /**
     * 支付用户标识，一般为openid
     */
    buyer: string;
    /**
     * 支付用户IP
     */
    clientip: string;
    /**
     * 当前时间戳，10位整数，单位秒
     */
    timestamp: string;
    /**
     * 签名字符串
     */
    sign: string;
    /**
     * 签名类型，默认为RSA
     */
    sign_type: string;
};

