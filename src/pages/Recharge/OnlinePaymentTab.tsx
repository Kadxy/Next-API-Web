import { FC } from 'react';
import {
    Typography,
    Radio,
    Space,
    Button,
    RadioGroup,
    InputNumber,
    Divider,
    Tag,
    Toast
} from '@douyinfe/semi-ui';
import { IconInfoCircle } from '@douyinfe/semi-icons';
// @ts-expect-error handle payment icons
import AlipayIcon from '@/assets/icons/alipay.svg?react';
// @ts-expect-error handle payment icons
import WechatPayIcon from '@/assets/icons/wechatpay.svg?react';
import { amountOptions, PaymentMethod, PaymentMethodKey } from './recharge.constants';

const { Text } = Typography;

interface PriceTier {
    min: number;
    rate: number;
}

export interface OnlinePaymentTabProps {
    selectedAmount: number | 'custom';
    setSelectedAmount: (value: number | 'custom') => void;
    customAmount: number;
    setCustomAmount: (value: number) => void;
    paymentMethod: PaymentMethodKey;
    setPaymentMethod: (value: PaymentMethodKey) => void;
    usdAmount: number;
    cnyAmount: string;
    discountPercentage: number;
    priceTier: PriceTier; // 包含 min 和 rate
    priceTiers: PriceTier[]; // 完整的 PRICE_TIERS 数组，用于显示原始汇率
    handleRecharge: () => void;
    loading: boolean;
}

const OnlinePaymentTab: FC<OnlinePaymentTabProps> = ({
    selectedAmount,
    setSelectedAmount,
    customAmount,
    setCustomAmount,
    paymentMethod,
    setPaymentMethod,
    usdAmount,
    cnyAmount,
    discountPercentage,
    priceTier,
    priceTiers,
    handleRecharge,
    loading,
}) => {
    return (
        <Space
            vertical
            align="start"
            style={{ width: '100%', maxWidth: '100%' }}
            spacing='loose'
        >
            {/* 充值金额 */}
            <Space vertical align="start" style={{ width: '100%' }}>
                <Text strong style={{ fontSize: 14, marginBottom: 8 }}>
                    金额
                </Text>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gridTemplateRows: 'repeat(2, 1fr)',
                    gap: '10px',
                    width: '100%',
                    maxWidth: '400px',
                    marginBottom: '16px'
                }}>
                    {amountOptions.map(option => (
                        <div
                            key={option.value}
                            style={{
                                border: `1px solid ${selectedAmount === option.value ? '#0052d9' : '#e0e0e0'}`,
                                borderRadius: '6px',
                                padding: '10px 0',
                                cursor: 'pointer',
                                backgroundColor: selectedAmount === option.value ? 'rgba(0, 82, 217, 0.05)' : 'white',
                                color: selectedAmount === option.value ? '#0052d9' : 'inherit',
                                fontWeight: selectedAmount === option.value ? 'bold' : 'normal',
                                textAlign: 'center',
                                transition: 'all 0.2s',
                                fontSize: '15px'
                            }}
                            onClick={() => {
                                if (option.value === 'custom') {
                                    setSelectedAmount('custom');
                                } else {
                                    setSelectedAmount(option.value as number);
                                }
                            }}
                        >
                            {option.label}
                        </div>
                    ))}
                </div>
                {selectedAmount === 'custom' && (
                    <InputNumber
                        size='large'
                        value={customAmount}
                        onChange={(value) => {
                            if (typeof value !== 'number') {
                                setCustomAmount(0);
                            } else if (value > 5000) {
                                Toast.warning('单次充值金额不能超过5000美元');
                                setCustomAmount(5000);
                            } else {
                                setCustomAmount(value);
                            }
                        }}
                        prefix='$'
                        style={{ width: 140 }}
                        validateStatus={customAmount < 0 ? 'error' : undefined}
                        hideButtons
                        min={0}
                        max={5000}
                    />
                )}
            </Space>

            {/* 支付方式 */}
            <Space vertical align="start" style={{ width: '100%' }}>
                <Text strong style={{ fontSize: 14, marginBottom: 8 }}>
                    支付方式
                </Text>
                <div style={{ overflowX: 'auto', width: '100%', paddingBottom: 8 }}>
                    <RadioGroup
                        type='pureCard'
                        buttonSize='large'
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value as PaymentMethodKey)}
                        style={{ whiteSpace: 'nowrap' }}
                    >
                        <Radio
                            value={PaymentMethod.WechatPay.key}
                            style={{
                                width: 150,
                                borderRadius: 8,
                                border: paymentMethod !== PaymentMethod.WechatPay.key ? '1px solid #e0e0e0' : undefined,
                                padding: '12px 16px',
                                display: 'inline-block'
                            }}
                        >
                            <Space align='center' spacing='medium'>
                                <WechatPayIcon />
                                <Text strong>微信支付</Text>
                            </Space>
                        </Radio>
                        <Radio
                            value={PaymentMethod.Alipay.key}
                            style={{
                                width: 150,
                                borderRadius: 8,
                                border: paymentMethod !== PaymentMethod.Alipay.key ? '1px solid #e0e0e0' : undefined,
                                padding: '12px 16px',
                                display: 'inline-block',
                            }}
                        >
                            <Space align='center' spacing='medium'>
                                <AlipayIcon />
                                <Text strong>支付宝</Text>
                            </Space>
                        </Radio>
                    </RadioGroup>
                </div>
            </Space>

            {/* 支付信息区域 */}
            <div
                style={{
                    width: '100%',
                    borderRadius: 8,
                    marginTop: 8,
                    padding: '24px',
                    background: 'linear-gradient(135deg, #f8fafb 0%, #f0f7ff 100%)',
                    boxShadow: '0 2px 8px rgba(0, 82, 217, 0.1)',
                    maxWidth: 'min(100%, 408px)',
                    boxSizing: 'border-box'
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
                            {discountPercentage > 0 && priceTiers[0] && ( // Ensure priceTiers[0] exists
                                <Text type="tertiary" delete>
                                    $1 = ¥{priceTiers[0].rate.toFixed(2)}
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

                    <Divider style={{ margin: '16px 0' }} />

                    <Space style={{ justifyContent: 'space-between', width: '100%' }}>
                        <Text strong style={{ fontSize: 16 }}>支付金额</Text>
                        <Space>
                            {discountPercentage > 0 && (
                                <Tag color="orange" size="small">
                                    省{discountPercentage}%
                                </Tag>
                            )}
                            <Text strong style={{ fontSize: 20, color: '#0052d9' }}>¥{cnyAmount}</Text>
                        </Space>
                    </Space>
                </Space>
            </div>

            {/* 提交按钮 */}
            <div style={{ marginTop: 8, width: '100%' }}>
                <Button
                    type="primary"
                    size='large'
                    theme="solid"
                    style={{
                        borderRadius: 8,
                        width: '100%',
                        maxWidth: 'min(100%, 408px)'
                    }}
                    onClick={handleRecharge}
                    disabled={usdAmount <= 0 || loading} // Added loading to disabled state
                    loading={loading} // Added loading prop
                >
                    确认支付
                </Button>
            </div>
        </Space>
    );
};

export default OnlinePaymentTab; 