import { FC, useState, useMemo } from 'react';
import {
    Typography,
    Tabs,
    TabPane,
    Toast,
} from '@douyinfe/semi-ui';
import { getServerApi, handleResponse } from '../../api/utils';
import QrCodeScanner from './QrCodeScanner';
import { PaymentMethod, PaymentMethodKey } from './recharge.constants';
import OnlinePaymentTab from './OnlinePaymentTab';
import RedeemCodeTab from './RedeemCodeTab';
import BankTransferTab from './BankTransferTab';


// 折扣梯度 - 减少档位
const PRICE_TIERS = [
    { min: 0, rate: 7.50 },
    { min: 10, rate: 7.00 },
    { min: 20, rate: 6.75 },
    { min: 50, rate: 6.50 },
    { min: 100, rate: 6.25 },
    { min: 500, rate: 5.75 },
    { min: 1000, rate: 5.25 },
    { min: 2000, rate: 4.75 },
    { min: 3000, rate: 4.25 },
    { min: 5000, rate: 4.00 },
];

// 充值方式标签
const RECHARGE_TABS = {
    NORMAL: 'normal',
    BANK: 'bank',
    REDEEM: 'redeem',
};

const Recharge: FC = () => {
    // 充值方式标签
    const [activeTab, setActiveTab] = useState<string>(RECHARGE_TABS.NORMAL);

    // 支付相关 loading 状态
    const [loading, setLoading] = useState<boolean>(false);

    // 扫码弹窗显示状态
    const [showScanner, setShowScanner] = useState<boolean>(false);

    // 充值金额
    const [selectedAmount, setSelectedAmount] = useState<number | 'custom'>(10);

    // 自定义金额
    const [customAmount, setCustomAmount] = useState<number>(1);

    // 支付方式
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethodKey>(PaymentMethod.WechatPay.key);

    // 兑换码
    const [redeemCode, setRedeemCode] = useState<string>('');

    // 美元金额
    const usdAmount = useMemo(() => {
        return selectedAmount === 'custom' ? customAmount : selectedAmount;
    }, [selectedAmount, customAmount]);

    // 获取适用价格梯度（按照金额找到对应区间）
    const priceTier = useMemo(() => {
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
        console.log('充值金额:', usdAmount);
        console.log('支付方式:', paymentMethod);
    };

    // 处理兑换码兑换请求
    const handleRedeem = async () => {
        if (!redeemCode) {
            Toast.warning('请输入兑换码');
            return;
        }
        setLoading(true);
        try {
            await handleResponse(
                getServerApi().redemption.redemptionControllerRedeem({
                    requestBody: { code: redeemCode }
                }), {
                onSuccess: () => {
                    Toast.success("兑换成功");
                    setRedeemCode('');
                },
                onError: (msg) => {
                    Toast.error({ content: msg, stack: true });
                }
            });
        } catch (error) {
            Toast.error('请求兑换接口失败');
            console.error("Redeem error:", error);
        }
        setLoading(false);
    };

    // 处理扫码结果
    const handleScanResult = (code: string) => {
        setRedeemCode(code);
        Toast.success("成功识别兑换码");
    };

    return (
        <div style={{ width: '100%', height: '100%', overflowX: 'hidden' }}>
            <Typography.Title heading={2} style={{ marginBottom: 16 }}>
                充值
            </Typography.Title>

            <Tabs
                size="large"
                type="card"
                activeKey={activeTab}
                onChange={setActiveTab}
                style={{ width: '100%' }}
            >
                <TabPane
                    tab="在线支付"
                    itemKey={RECHARGE_TABS.NORMAL}
                    style={{ padding: '20px' }}
                >
                    <OnlinePaymentTab
                        selectedAmount={selectedAmount}
                        setSelectedAmount={setSelectedAmount}
                        customAmount={customAmount}
                        setCustomAmount={setCustomAmount}
                        paymentMethod={paymentMethod}
                        setPaymentMethod={setPaymentMethod}
                        usdAmount={usdAmount}
                        cnyAmount={cnyAmount}
                        discountPercentage={discountPercentage}
                        priceTier={priceTier}
                        priceTiers={PRICE_TIERS}
                        handleRecharge={handleRecharge}
                        loading={loading}
                    />
                </TabPane>

                <TabPane
                    tab="兑换码"
                    itemKey={RECHARGE_TABS.REDEEM}
                    style={{ padding: '20px' }}
                >
                    <RedeemCodeTab
                        redeemCode={redeemCode}
                        setRedeemCode={setRedeemCode}
                        handleRedeem={handleRedeem}
                        setShowScanner={setShowScanner}
                        loading={loading}
                    />
                </TabPane>

                <TabPane
                    tab="对公汇款"
                    itemKey={RECHARGE_TABS.BANK}
                    style={{ padding: '20px' }}
                >
                    <BankTransferTab />
                </TabPane>
            </Tabs>

            {/* 二维码扫描器组件 */}
            <QrCodeScanner
                visible={showScanner}
                onClose={() => setShowScanner(false)}
                onScan={handleScanResult}
            />
        </div>
    );
};

export default Recharge;
