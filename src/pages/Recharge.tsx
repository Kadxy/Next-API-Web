import { FC, useState, useMemo } from 'react';
import {
    Typography,
    Radio,
    Space,
    Button,
    RadioGroup,
    InputNumber,
    Card,
    Divider,
    Tag,
} from '@douyinfe/semi-ui';
import { IconInfoCircle } from '@douyinfe/semi-icons';
// @ts-expect-error handle payment icons
import AlipayIcon from '@/assets/icons/alipay.svg?react';
// @ts-expect-error handle payment icons
import WechatPayIcon from '@/assets/icons/wechatpay.svg?react';

const { Title, Text } = Typography;

// 价格梯度 - 减少档位
const PRICE_TIERS = [
    { min: 0, rate: 7.65 },
    { min: 20, rate: 6.85 },
    { min: 50, rate: 6.25 },
    { min: 100, rate: 5.80 },
    { min: 200, rate: 5.50 },
    { min: 500, rate: 5.20 },
    { min: 1000, rate: 4.80 },
];

// 充值金额选项
const amountOptions = [
    { value: 20, label: '$20' },
    { value: 50, label: '$50' },
    { value: 100, label: '$100' },
    { value: 200, label: '$200' },
    { value: 500, label: '$500' },
    { value: 'custom', label: '自定义' },
];

// 支付方式
const PaymentMethod = {
    Alipay: { key: 'alipay', label: '支付宝' },
    WechatPay: { key: 'wechatpay', label: '微信支付' }
} as const;

const Recharge: FC = () => {
    // 充值金额
    const [selectedAmount, setSelectedAmount] = useState<number | 'custom'>(20);

    // 自定义金额
    const [customAmount, setCustomAmount] = useState<number>(0);

    // 支付方式
    const [paymentMethod, setPaymentMethod] = useState<typeof PaymentMethod[keyof typeof PaymentMethod]['key']>(PaymentMethod.WechatPay.key);

    // 美元金额
    const usdAmount = useMemo(() => {
        return selectedAmount === 'custom' ? customAmount : selectedAmount;
    }, [selectedAmount, customAmount]);

    // 获取适用价格梯度（按照金额找到对应区间）
    const priceTier = useMemo(() => {
        // 找到最大的满足条件的价格梯度
        for (let i = PRICE_TIERS.length - 1; i >= 0; i--) {
            if (usdAmount >= PRICE_TIERS[i].min) {
                return PRICE_TIERS[i];
            }
        }
        return PRICE_TIERS[0];
    }, [usdAmount]);

    // 计算人民币金额
    const cnyAmount = useMemo(() => {
        return (usdAmount * priceTier.rate).toFixed(2);
    }, [usdAmount, priceTier]);

    // 计算折扣百分比
    const discountPercentage = useMemo(() => {
        if (priceTier.min === 0) return 0;
        return Math.round((PRICE_TIERS[0].rate - priceTier.rate) / PRICE_TIERS[0].rate * 100);
    }, [priceTier]);

    // 处理充值请求
    const handleRecharge = () => {
        // TODO: 处理充值逻辑
        console.log('充值金额:', usdAmount);
        console.log('支付方式:', paymentMethod);
    };

    return (
        <Space
            vertical
            align="start"
            style={{ width: '100%', padding: "48px 0 0 48px" }}
        >
            <Title
                heading={2}
                style={{ marginBottom: 24 }}
            >
                充值
            </Title>

            <Space
                vertical
                align="start"
                style={{ width: '100%' }}
                spacing='loose'
            >

                {/* 充值金额 */}
                <Space vertical align="start" style={{ width: '100%' }}>
                    <Text type='secondary' style={{ fontSize: 14 }}>
                        金额
                    </Text>
                    <RadioGroup
                        type='button'
                        value={selectedAmount}
                        onChange={(e) => setSelectedAmount(e.target.value)}
                    >
                        {amountOptions.map(option => (
                            <Radio key={option.value} value={option.value}>
                                {option.label}
                            </Radio>
                        ))}
                    </RadioGroup>
                    {selectedAmount === 'custom' && (
                        <InputNumber
                            value={customAmount}
                            onChange={(value) => setCustomAmount(value as number || 0)}
                            prefix='$'
                            style={{ width: 100 }}
                            validateStatus={customAmount < 0 ? 'error' : undefined}
                            hideButtons
                            min={0}
                            max={2000}
                        />
                    )}
                </Space>

                {/* 支付方式 */}
                <Space vertical align="start" style={{ width: '100%' }}>
                    <Text type='secondary' style={{ fontSize: 14 }}>
                        支付方式
                    </Text>
                    <RadioGroup
                        type='pureCard'
                        buttonSize='large'
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                    >
                        <Radio
                            value={PaymentMethod.WechatPay.key}
                            style={{
                                width: 160,
                                borderRadius: 8,
                                border: paymentMethod !== PaymentMethod.WechatPay.key ? '1px solid #e0e0e0' : undefined
                            }}
                        >
                            <Space align='center' spacing='medium'>
                                <WechatPayIcon />
                                <Text>微信支付</Text>
                            </Space>
                        </Radio>
                        <Radio
                            value={PaymentMethod.Alipay.key}
                            style={{
                                width: 160,
                                borderRadius: 8,
                                border: paymentMethod !== PaymentMethod.Alipay.key ? '1px solid #e0e0e0' : undefined
                            }}
                        >
                            <Space align='center' spacing='medium'>
                                <AlipayIcon />
                                <Text>支付宝</Text>
                            </Space>
                        </Radio>
                    </RadioGroup>
                </Space>

                {/* 支付人民币金额 */}
                <Card
                    style={{
                        width: '100%',
                        maxWidth: 380,
                        borderRadius: 8,
                        marginTop: 24,
                        background: 'linear-gradient(135deg, #f8fafb 0%, #f0f7ff 100%)',
                        boxShadow: '0 2px 12px rgba(0, 82, 217, 0.1)'
                    }}
                >
                    <Space vertical style={{ width: '100%' }}>
                        <Space style={{ justifyContent: 'space-between', width: '100%' }}>
                            <Text strong>充值额度</Text>
                            <Text strong>${usdAmount.toString()}</Text>
                        </Space>

                        <Space style={{ justifyContent: 'space-between', width: '100%', marginTop: 4, alignItems: 'center' }}>
                            <Space>
                                <Text type="tertiary">转换比例</Text>
                                <IconInfoCircle size="small" style={{ color: '#777', cursor: 'pointer' }} />
                            </Space>
                            <Space align="center">
                                {discountPercentage > 0 && (
                                    <Text type="tertiary" delete>
                                        $1 = ¥{PRICE_TIERS[0].rate.toFixed(2)}
                                    </Text>
                                )}
                                <Text
                                    strong
                                    style={{ color: discountPercentage > 0 ? '#52AA58' : undefined }}
                                >
                                    $1 = ¥{priceTier.rate.toFixed(2)}
                                </Text>
                            </Space>
                        </Space>

                        <Divider style={{ margin: '12px 0' }} />

                        <Space style={{ justifyContent: 'space-between', width: '100%' }}>
                            <Text strong style={{ fontSize: 16 }}>支付金额</Text>
                            <Space>
                                {discountPercentage > 0 && (
                                    <Tag color="orange" size="small">
                                        省{discountPercentage}%
                                    </Tag>
                                )}
                                <Text strong style={{ fontSize: 18 }}>¥{cnyAmount}</Text>
                            </Space>
                        </Space>
                    </Space>
                </Card>

                {/* 提交按钮 */}
                <div style={{ marginTop: 24, width: '100%', maxWidth: 380 }}>
                    <Button
                        type="primary"
                        size='large'
                        theme="solid"
                        style={{ width: '100%', borderRadius: 8 }}
                        onClick={handleRecharge}
                        disabled={usdAmount <= 0}
                    >
                        确认支付
                    </Button>
                </div>
            </Space>
        </Space>
    );
};

export default Recharge; 