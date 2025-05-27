export const amountOptions = [
    { value: 10, label: '$10' },
    { value: 20, label: '$20' },
    { value: 50, label: '$50' },
    { value: 100, label: '$100' },
    { value: 500, label: '$500' },
    { value: 1000, label: '$1000' },
    { value: 2000, label: '$2000' },
    { value: 'custom', label: '自定义' },
];

export const PaymentMethod = {
    Alipay: { key: 'alipay', label: '支付宝' },
    WechatPay: { key: 'wechatpay', label: '微信支付' },
} as const;

export type PaymentMethodKey = typeof PaymentMethod[keyof typeof PaymentMethod]['key']; 