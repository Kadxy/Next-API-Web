import { Button, Card, Divider, Empty, Icon, Input, InputNumber, Select, Space, Spin, TabPane, Tabs, Toast, Typography } from "@douyinfe/semi-ui";
import { FC, useEffect, useState } from "react";
import { getWalletsOption } from "../../api/utils/wallets-option";
import { EpayCreateOrderResponseV1, EpayPriceResponseData, EpayRechargeRequestDto } from "../../api/generated";
import { handleResponse, getServerApi } from "../../api/utils";
import { IconBriefcase, IconCreditCard, IconGift, IconGlobeStroke, IconHash } from "@douyinfe/semi-icons";
// @ts-expect-error handle payment icons
import AlipayIcon from '@/assets/icons/alipay.svg?react';
// @ts-expect-error handle payment icons
import WechatPayIcon from '@/assets/icons/wechatpay.svg?react';
import PaymentQRModal from "./PaymentQRModal";
import { IllustrationSuccess, IllustrationSuccessDark } from "@douyinfe/semi-illustrations";
import { useNavigate } from "react-router-dom";
import { Path } from "../../lib/constants/paths";

enum RECHARGE_METHOD {
    ONLINE = '在线支付',
    REDEEM = '兑换码',
    PUBLIC_TRANSFER = '对公汇款',
}

const Recharge: FC = () => {
    const { Title, Text } = Typography;
    const navigate = useNavigate();

    // 充值钱包
    const [walletOptions, setWalletOptions] = useState<{ label: string; value: string }[]>([]);
    const [selectedWalletUid, setSelectedWalletUid] = useState<string>('');
    const [walletLoading, setWalletLoading] = useState<boolean>(false);

    // 充值方式
    const [selectedRechargeMethod, setSelectedRechargeMethod] = useState<RECHARGE_METHOD>(RECHARGE_METHOD.ONLINE);

    // 在线充值
    const [rechargeQuota, setRechargeQuota] = useState<number>(10);
    const [priceInfo, setPriceInfo] = useState<EpayPriceResponseData | null>(null);

    // 在线充值 - 订单与支付信息
    const [createOrderLoading, setCreateOrderLoading] = useState<Record<string, boolean>>({
        wxpay: false,
        alipay: false,
    });
    const [paymentData, setPaymentData] = useState<EpayCreateOrderResponseV1 | null>(null);
    const [showPaymentQR, setShowPaymentQR] = useState<boolean>(false);
    const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false);

    // 兑换码
    const [redeemCode, setRedeemCode] = useState<string>('');
    const [redeemSubmitLoading, setRedeemSubmitLoading] = useState<boolean>(false);

    // 获取钱包列表
    useEffect(() => {
        const fetchWallets = async () => {
            setWalletLoading(true);
            try {
                const options = await getWalletsOption((msg) => {
                    Toast.error(`获取钱包列表失败: ${msg}`);
                });

                setWalletOptions(options);

                // 如果有钱包且没有选中的钱包，默认选择第一个
                if (options.length > 0 && !selectedWalletUid) {
                    setSelectedWalletUid(options[0].value);
                }
            } catch (error) {
                Toast.error('获取钱包列表失败');
                console.error('获取钱包列表失败:', error);
            } finally {
                setWalletLoading(false);
            }
        };

        fetchWallets();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // 更新价格信息，使用 AbortController 避免竞态条件
    useEffect(() => {
        if (rechargeQuota <= 0 || rechargeQuota > 10000) {
            return;
        }

        const abortController = new AbortController();

        const fetchPrice = async (quota: number) => {
            setPriceInfo(null);
            try {
                await handleResponse(
                    getServerApi().epay.epayControllerGetPrice({ quota: quota.toString() }),
                    {
                        onSuccess: (data) => {
                            // 只有在请求没有被取消时才更新状态
                            if (!abortController.signal.aborted) {
                                setPriceInfo(data);
                            }
                        },
                        onError: (msg) => {
                            // 只有在请求没有被取消时才显示错误
                            if (!abortController.signal.aborted) {
                                Toast.error(`获取价格失败: ${msg}`);
                            }
                        }
                    }
                );
            } catch (error) {
                // 只有在请求没有被取消时才显示错误
                if (!abortController.signal.aborted) {
                    Toast.error('获取价格失败');
                    console.error('获取价格失败:', error);
                }
            }
        };

        fetchPrice(rechargeQuota).then();

        // 清理函数：取消当前请求
        return () => {
            abortController.abort();
        };
    }, [rechargeQuota]);

    // 创建在线充值订单
    const createOnlineRechargeOrder = async (paymentMethod: EpayRechargeRequestDto['paymentMethod']) => {
        setCreateOrderLoading({ ...createOrderLoading, [paymentMethod]: true });
        try {
            await handleResponse(
                getServerApi().epay.epayControllerHandleRecharge({
                    walletUid: selectedWalletUid,
                    requestBody: {
                        quota: rechargeQuota.toString(),
                        paymentMethod,
                    }
                }),
                {
                    onSuccess: (data: EpayCreateOrderResponseV1) => {
                        if (data.code === 1) {
                            setPaymentData(data);
                            setShowPaymentQR(true);
                        } else {
                            Toast.error(`订单创建失败: ${data.msg}`);
                        }
                    },
                    onError: (msg) => {
                        Toast.error(`创建订单失败: ${msg}`);
                    }
                }
            );
        } catch (error) {
            Toast.error('创建订单失败');
            console.error('创建订单失败:', error);
        } finally {
            setCreateOrderLoading({ ...createOrderLoading, [paymentMethod]: false });
        }
    };

    // 兑换码 - 兑换
    const handleRedeem = async () => {
        const rawCode = redeemCode.toLowerCase().replace(/-/g, '');

        setRedeemSubmitLoading(true);
        try {
            await handleResponse(
                getServerApi().redemption.redemptionControllerRedeem({
                    requestBody: {
                        code: rawCode,
                        walletUid: selectedWalletUid
                    }
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
            Toast.error('兑换失败');
            console.error("Redeem error:", error);
        } finally {
            setRedeemSubmitLoading(false);
        }
    };

    if (paymentSuccess) {
        return (
            <Empty
                image={<IllustrationSuccess style={{ width: 150, height: 150 }} />}
                darkModeImage={<IllustrationSuccessDark style={{ width: 150, height: 150 }} />}
                title={'充值成功'}
                description={'余额更新可能存在延迟，您可稍后刷新钱包查看余额'}
                layout='horizontal'
                style={{
                    height: '100%',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Space>
                    <Button
                        type="tertiary"
                        onClick={() => navigate(Path.WALLETS, { state: { from: Path.RECHARGE } })}
                        style={{ padding: '6px 24px' }}
                    >
                        返回钱包
                    </Button>
                    <Button
                        type="primary"
                        onClick={() => setPaymentSuccess(false)}
                        style={{ padding: '6px 24px' }}
                    >
                        继续充值
                    </Button>
                </Space>
            </Empty>
        );
    }

    const renderSelectWallet = () => {
        return (
            <Space vertical align="start" >
                <Text type='secondary' strong>充值钱包</Text>
                <Select
                    size="large"
                    optionList={walletOptions}
                    loading={walletLoading}
                    style={{ width: 240 }}
                    value={selectedWalletUid}
                    onChange={(v) => setSelectedWalletUid(v as string)}
                    placeholder='请选择要充值的钱包'
                    prefix={<IconCreditCard />}
                />
            </Space>
        )
    }

    return (
        <>
            <Card
                title={<Title heading={3}>充值汇款</Title>}
                style={{
                    width: '100%',
                    height: '100%',
                    overflow: 'auto',
                    scrollbarWidth: 'none',
                }}
                headerLine={false}
                bordered={false}
            >
                <Tabs
                    type='card'
                    activeKey={selectedRechargeMethod}
                    onChange={(v) => setSelectedRechargeMethod(v as RECHARGE_METHOD)}
                    style={{ width: '100%' }}
                >
                    <TabPane
                        tab="在线支付"
                        icon={<IconGlobeStroke />}
                        itemKey={RECHARGE_METHOD.ONLINE}
                        style={{ paddingTop: 20 }}
                    >
                        <Space vertical align="start" spacing='medium'>
                            {renderSelectWallet()}
                            <Space vertical align="start" >
                                <Text type='secondary' strong>充值额度</Text>
                                <InputNumber
                                    size="large"
                                    min={0.01}
                                    max={10000}
                                    step={10}
                                    shiftStep={100}
                                    precision={2}
                                    style={{ width: 240 }}
                                    innerButtons={true}
                                    value={rechargeQuota}
                                    onChange={(v) => setRechargeQuota(v as number)}
                                    prefix={'$'}
                                />
                            </Space>
                            <Divider />

                            <Card style={{ width: 320 }}>
                                <Space vertical align="start" style={{ width: '100%' }}>
                                    <Space style={{ justifyContent: 'space-between', width: '100%' }}>
                                        <Text type='secondary' strong>充值额度</Text>
                                        <Text strong>${priceInfo?.quota || rechargeQuota.toFixed(2)}</Text>
                                    </Space>
                                    <Space style={{ justifyContent: 'space-between', width: '100%' }}>
                                        <Text type='secondary' strong>转换比例</Text>
                                        {priceInfo?.exchangeRate ?
                                            <Text strong>$1 = ¥{priceInfo?.exchangeRate}</Text>
                                            :
                                            <Spin size='small' />
                                        }
                                    </Space>

                                    <Divider style={{ margin: '12px 0' }} />

                                    <Space style={{ justifyContent: 'space-between', width: '100%' }}>
                                        <Text type='secondary' strong>合计</Text>
                                        {priceInfo?.amount ?
                                            <Text strong style={{ fontSize: 24 }}>¥{priceInfo?.amount}</Text>
                                            :
                                            <Spin size='small' />
                                        }
                                    </Space>
                                </Space>
                            </Card>

                            <Space align="start">
                                <Button
                                    size="large"
                                    theme='outline'
                                    type="tertiary"
                                    style={{ width: 120, height: 48, borderRadius: 8 }}
                                    onClick={() => createOnlineRechargeOrder('wxpay')}
                                    icon={<Icon svg={<WechatPayIcon />} />}
                                    loading={createOrderLoading.wxpay}
                                >
                                    微信支付
                                </Button>
                                <Button
                                    size="large"
                                    theme='outline'
                                    type="tertiary"
                                    style={{ width: 120, height: 48, borderRadius: 8 }}
                                    onClick={() => createOnlineRechargeOrder('alipay')}
                                    icon={<Icon svg={<AlipayIcon />} />}
                                    loading={createOrderLoading.alipay}
                                >
                                    支付宝
                                </Button>
                            </Space>
                        </Space>
                    </TabPane>

                    <TabPane
                        tab="兑换码"
                        itemKey={RECHARGE_METHOD.REDEEM}
                        icon={<IconGift />}
                        style={{ paddingTop: 20 }}
                    >
                        <Space vertical align="start" spacing='medium'>
                            {renderSelectWallet()}
                            <Space vertical align="start" >
                                <Text type='secondary' strong>兑换代码</Text>
                                <Input
                                    size="large"
                                    style={{ width: 336 }}
                                    placeholder='XXXX-XXXX-XXXX-XXXX-XXXX-XXXX'
                                    prefix={<IconHash />}
                                    value={redeemCode}
                                    onChange={(v) => {
                                        // 1. 清理输入：移除所有非字母和数字的字符，并转换为大写。
                                        //    [^A-Z0-9] 是一个正则表达式，匹配任何不是大写字母或数字的字符。
                                        const cleanValue = v.toUpperCase().replace(/[^A-Z0-9]/g, '');

                                        // 2. 格式化：在清理后的值上，每4个字符插入一个'-'。
                                        //    .match(/.{1,4}/g) 会将字符串分割成长度最多为4的数组。
                                        //    例如 'ABCDE123F' -> ['ABCD', 'E123', 'F']
                                        //    然后 .join('-') 会用'-'将它们连接起来。
                                        //    例如 ['ABCD', 'E123', 'F'] -> 'ABCD-E123-F'
                                        const formattedCode = cleanValue.match(/.{1,4}/g)?.join('-') || '';

                                        // 3. 更新状态
                                        setRedeemCode(formattedCode);
                                    }}
                                    maxLength={4 * 6 + 5}
                                    autoComplete='off'
                                />
                            </Space>
                            <Button
                                size="large"
                                type="primary"
                                loading={redeemSubmitLoading}
                                disabled={!redeemCode || redeemCode.length !== 4 * 6 + 5}
                                onClick={handleRedeem}
                            >
                                确认兑换
                            </Button>
                        </Space>
                    </TabPane>

                    <TabPane
                        tab="对公汇款"
                        icon={<IconBriefcase />}
                        itemKey={RECHARGE_METHOD.PUBLIC_TRANSFER}
                        style={{ paddingTop: 20 }}
                    >
                        <Space vertical align="start" spacing='medium'>
                            <Space vertical align="start" spacing={12}>
                                <Text type='secondary' strong>收款账户信息</Text>
                                <div style={{ display: 'flex' }}>
                                    <Text type='tertiary' style={{ width: 128 }}>账户名称</Text>
                                    <Text strong>XXXX有限公司</Text>
                                </div>
                                <div style={{ display: 'flex' }}>
                                    <Text type='tertiary' style={{ width: 128 }}>银行账号</Text>
                                    <Text strong >完成&nbsp;<Text link>企业认证</Text>&nbsp;后获取银行账号</Text>
                                </div>
                                <div style={{ display: 'flex' }}>
                                    <Text type='tertiary' style={{ width: 128 }}>开户银行</Text>
                                    <Text strong>招商银行股份有限公司深圳分行</Text>
                                </div>
                                <div style={{ display: 'flex' }}>
                                    <Text type='tertiary' style={{ width: 128 }}>分行代码</Text>
                                    <Text strong >CMBCCNBS050</Text>
                                </div>
                                <div style={{ display: 'flex' }}>
                                    <Text type='tertiary' style={{ width: 128 }}>币种</Text>
                                    <Text strong >CNY</Text>
                                </div>
                            </Space>
                            <Divider />
                            <Space vertical align="start">
                                <Text type='secondary' strong>注意事项</Text>
                                <Text type="tertiary" style={{ lineHeight: 1.8 }}>
                                    1. 请在汇款时备注您的用户UID与钱包UID，以便我们及时确认您的款项。<br />
                                    2. 对公汇款通常需要 1-3 个工作日到账，到账后我们会尽快为您充值。<br />
                                    3. 如有任何疑问，请联系客服 support@apigrip.com。
                                </Text>
                            </Space>
                        </Space>
                    </TabPane>
                </Tabs>
            </Card >
            <PaymentQRModal
                visible={showPaymentQR}
                onClose={() => setShowPaymentQR(false)}
                onSuccess={() => {
                    setShowPaymentQR(false);
                    setPaymentSuccess(true);
                }}
                tradeNo={paymentData?.trade_no || ''}
                qrCodeUrl={paymentData?.qrcode || ''}
            />
        </>
    )
};

export default Recharge;
