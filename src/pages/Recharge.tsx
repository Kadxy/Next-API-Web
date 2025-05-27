import { FC, useState, useMemo, useRef, useEffect } from 'react';
import {
    Typography,
    Radio,
    Space,
    Button,
    RadioGroup,
    InputNumber,
    Divider,
    Tag,
    Tabs,
    TabPane,
    Input,
    Toast,
    Modal,
    Spin,
} from '@douyinfe/semi-ui';
import { IconInfoCircle, IconQrCode, IconCamera, IconRefresh } from '@douyinfe/semi-icons';
// @ts-expect-error handle payment icons
import AlipayIcon from '@/assets/icons/alipay.svg?react';
// @ts-expect-error handle payment icons
import WechatPayIcon from '@/assets/icons/wechatpay.svg?react';
import jsQR from 'jsqr';
import { handleResponse, getServerApi } from '../api/utils';

const { Title, Text } = Typography;

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

// 充值金额选项
const amountOptions = [
    { value: 10, label: '$10' },
    { value: 20, label: '$20' },
    { value: 50, label: '$50' },
    { value: 100, label: '$100' },
    { value: 500, label: '$500' },
    { value: 1000, label: '$1000' },
    { value: 2000, label: '$2000' },
    { value: 'custom', label: '自定义' },
];

// 支付方式
const PaymentMethod = {
    Alipay: { key: 'alipay', label: '支付宝' },
    WechatPay: { key: 'wechatpay', label: '微信支付' },
} as const;

// 充值方式标签
const RECHARGE_TABS = {
    NORMAL: 'normal',
    BANK: 'bank',
    REDEEM: 'redeem',
};

// 二维码扫描器组件
const QrCodeScanner = ({
    visible,
    onClose,
    onScan
}: {
    visible: boolean,
    onClose: () => void,
    onScan: (code: string) => void
}) => {
    const [cameraReady, setCameraReady] = useState(false);
    const [scanningActive, setScanningActive] = useState(false);
    const [debugImage, setDebugImage] = useState<string | null>(null);
    const [scanAttempts, setScanAttempts] = useState(0);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // 初始化摄像头
    const initCamera = async () => {
        try {
            setScanningActive(true);
            setScanAttempts(0);
            setCameraError(null);
            setDebugImage(null);

            const constraints = {
                video: {
                    facingMode: 'environment',
                    width: { ideal: 640 },
                    height: { ideal: 480 }
                }
            };

            const stream = await navigator.mediaDevices.getUserMedia(constraints);

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.onloadedmetadata = () => {
                    if (videoRef.current) {
                        videoRef.current.play()
                            .then(() => setCameraReady(true))
                            .catch(err => {
                                console.error("视频播放失败:", err);
                                setCameraError("视频播放失败，请尝试重新打开扫描器");
                            });
                    }
                };
            }
        } catch (error) {
            console.error("Error accessing camera:", error);
            Toast.error("无法访问摄像头，请检查权限设置");
            setCameraError("无法访问摄像头，请检查浏览器权限设置");
            setScanningActive(false);
        }
    };

    // 拍照并识别
    const captureAndScan = () => {
        if (!scanningActive || !videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        if (!context) return;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        const snapshotUrl = canvas.toDataURL('image/png');
        setDebugImage(snapshotUrl);

        try {
            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
                inversionAttempts: "attemptBoth"
            });

            if (code) {
                handleSuccess(code.data);
            } else {
                setScanAttempts(prev => prev + 1);
            }
        } catch (error) {
            console.error("二维码解析错误:", error);
            Toast.error("解析过程中出错");
        }
    };

    // 处理成功识别
    const handleSuccess = (codeData: string) => {
        onScan(codeData);
        closeScanner();
    };

    // 关闭扫描器并清理资源
    const closeScanner = () => {
        setScanningActive(false);
        cleanupCamera();
        onClose();
    };

    // 清理相机资源
    const cleanupCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
    };

    // 重置扫描
    const resetScan = () => {
        setDebugImage(null);
        setScanAttempts(0);
    };

    // 监听visible属性变化，当模态框打开时重新初始化相机
    useEffect(() => {
        if (visible) {
            // 重置状态
            setCameraReady(false);
            setScanningActive(false);
            setDebugImage(null);
            setScanAttempts(0);
            setCameraError(null);

            // 延迟启动摄像头，确保模态框已完成渲染
            setTimeout(() => {
                initCamera();
            }, 500);
        } else {
            // 关闭时清理资源
            cleanupCamera();
        }

        // 组件卸载时清理资源
        return () => {
            cleanupCamera();
        };
    }, [visible]);

    return (
        <Modal
            title="扫描二维码"
            visible={visible}
            onCancel={closeScanner}
            footer={
                <Space>
                    <Button onClick={closeScanner}>取消</Button>
                    {debugImage ? (
                        <Button
                            icon={<IconRefresh />}
                            type="primary"
                            onClick={resetScan}
                        >
                            重试
                        </Button>
                    ) : (
                        <Button
                            type="primary"
                            onClick={captureAndScan}
                            disabled={!cameraReady}
                            icon={<IconCamera />}
                        >
                            拍照识别
                        </Button>
                    )}
                </Space>
            }
            style={{ width: 320, maxWidth: '95%' }}
            bodyStyle={{ padding: '16px' }}
            centered
            closable={false}
        >
            <div style={{ textAlign: 'center' }}>
                <div style={{ position: 'relative', width: '100%', margin: '0 auto' }}>
                    {/* 视频预览区域 */}
                    <div style={{
                        position: 'relative',
                        width: '100%',
                        height: 240,
                        borderRadius: 8,
                        overflow: 'hidden',
                        backgroundColor: '#000',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}>
                        {!cameraReady && !debugImage && !cameraError && <Spin size="large" />}

                        {cameraError && (
                            <div style={{
                                color: '#ff4d4f',
                                padding: '16px',
                                textAlign: 'center'
                            }}>
                                {cameraError}
                            </div>
                        )}

                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                display: (debugImage || !cameraReady) ? 'none' : 'block'
                            }}
                        ></video>

                        {/* 简化取景框 */}
                        {cameraReady && !debugImage && (
                            <div style={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                width: '80%',
                                height: '80%',
                                boxSizing: 'border-box',
                                border: '2px solid rgba(255, 255, 255, 0.8)',
                                borderRadius: '8px',
                                zIndex: 2
                            }}></div>
                        )}

                        {/* 调试图像显示 */}
                        {debugImage && (
                            <img
                                src={debugImage}
                                alt="视频快照"
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'contain'
                                }}
                            />
                        )}
                    </div>

                    {/* 识别状态 */}
                    <div style={{ marginTop: 12, height: 24 }}>
                        {scanAttempts > 0 && debugImage && (
                            <div style={{
                                fontSize: 13,
                                padding: '4px 12px',
                                background: '#fff5f5',
                                color: '#ff4d4f',
                                borderRadius: 4,
                                display: 'inline-block'
                            }}>
                                未检测到二维码，请重试
                            </div>
                        )}
                    </div>

                    {/* 隐藏的Canvas用于处理图像 */}
                    <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
                </div>

                <div style={{
                    marginTop: 12,
                    color: '#666',
                    fontSize: 13,
                    lineHeight: 1.5
                }}>
                    {cameraReady && !debugImage ?
                        '将二维码对准取景框，点击"拍照识别"' :
                        debugImage ?
                            scanAttempts > 0 ? '请确保二维码清晰可见，重新尝试' : '正在处理图像...' :
                            '正在启动摄像头...'
                    }
                </div>
            </div>
        </Modal>
    );
};

const Recharge: FC = () => {
    // 充值方式标签
    const [activeTab, setActiveTab] = useState<string>(RECHARGE_TABS.NORMAL);

    // 充值金额
    const [selectedAmount, setSelectedAmount] = useState<number | 'custom'>(10);

    // 自定义金额
    const [customAmount, setCustomAmount] = useState<number>(1);

    // 支付方式
    const [paymentMethod, setPaymentMethod] = useState<typeof PaymentMethod[keyof typeof PaymentMethod]['key']>(PaymentMethod.WechatPay.key);

    // 兑换码
    const [redeemCode, setRedeemCode] = useState<string>('');

    // 兑换中
    const [redeeming, setRedeeming] = useState<boolean>(false);

    // 扫码弹窗显示状态
    const [showScanner, setShowScanner] = useState<boolean>(false);

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
        setRedeeming(true);
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
            console.error('兑换码兑换失败:', error);
        } finally {
            setRedeeming(false);
        }
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
                                    onChange={(e) => setPaymentMethod(e.target.value)}
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
                                disabled={usdAmount <= 0}
                            >
                                确认支付
                            </Button>
                        </div>

                    </Space>
                </TabPane>

                <TabPane
                    tab="兑换码"
                    itemKey={RECHARGE_TABS.REDEEM}
                    style={{ padding: '20px' }}
                >
                    <div style={{ width: '100%', maxWidth: 700 }}>
                        <Title heading={4} style={{ marginBottom: 24 }}>使用兑换码</Title>

                        <Space vertical align="start" style={{ width: '100%' }} spacing={24}>
                            <Space spacing='tight' style={{ width: '100%' }}>
                                <Input
                                    size="large"
                                    value={redeemCode}
                                    onChange={(value) => setRedeemCode(value)}
                                    placeholder="请输入兑换码"
                                    style={{ maxWidth: 286 }}
                                    maxLength={24}
                                    disabled={redeeming}
                                    suffix={
                                        <IconQrCode
                                            style={{ cursor: 'pointer', color: '#0052d9', fontSize: 20 }}
                                            onClick={() => setShowScanner(true)}
                                        />
                                    }
                                />
                                <Button
                                    size="large"
                                    type="primary"
                                    onClick={handleRedeem}
                                    loading={redeeming}
                                    disabled={!redeemCode}
                                >
                                    确认兑换
                                </Button>
                            </Space>
                            <Divider />
                            <Space vertical style={{ width: '100%' }} spacing={16} align="start">
                                <Title heading={5} type="secondary">兑换说明</Title>
                                <Space vertical align="start" spacing={12}>
                                    <Text type="tertiary" style={{ lineHeight: 1.6 }}>
                                        1. 兑换额度将充值到个人钱包中。
                                    </Text>
                                    <Text type="tertiary" style={{ lineHeight: 1.6 }}>
                                        2. 兑换成功后您将获得兑换码所含额度。
                                    </Text>
                                    <Text type="tertiary" style={{ lineHeight: 1.6 }}>
                                        3. 每个兑换码仅限兑换一次，且兑换成功后不支持退款，请您谨慎操作。
                                    </Text>
                                </Space>
                            </Space>
                        </Space>
                    </div>
                </TabPane>

                <TabPane
                    tab="对公汇款"
                    itemKey={RECHARGE_TABS.BANK}
                    style={{ padding: '20px' }}
                >
                    <div style={{ width: '100%', maxWidth: 700 }}>
                        <Title heading={4}>收款账户信息</Title>

                        <Space vertical align="start" style={{ width: '100%', marginTop: 24 }} spacing={24}>
                            <Space vertical align="start" style={{ width: '100%' }}>
                                <div style={{ display: 'flex', marginBottom: 12 }}>
                                    <Text style={{ width: 110, color: '#666' }}>银行账户名称</Text>
                                    <Text strong>XXXX有限公司</Text>
                                </div>
                                <div style={{ display: 'flex', marginBottom: 12 }}>
                                    <Text style={{ width: 110, color: '#666' }}>开户银行</Text>
                                    <Text strong>招商银行股份有限公司杭州分行</Text>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <Text style={{ width: 110, color: '#666' }}>银行账号</Text>
                                    <Text strong > <Text link>企业认证</Text>后获取专属账号</Text>
                                </div>
                            </Space>
                            <Divider />
                            <Space vertical style={{ width: '100%' }} spacing={16} align="start">
                                <Title heading={5} type="secondary">注意事项</Title>
                                <Space vertical align="start" spacing={12}>
                                    <Text type="tertiary" style={{ lineHeight: 1.6 }}>
                                        1. 仅限企业用户，完成企业认证以获得银行转账账号。
                                    </Text>
                                    <Text type="tertiary" style={{ lineHeight: 1.6 }}>
                                        2. 确保汇款账户名称与认证信息匹配，以便顺利交易和开具发票。
                                    </Text>
                                    <Text type="tertiary" style={{ lineHeight: 1.6 }}>
                                        3. 资金通常在我们收到后10分钟至24小时内反映在您的平台账户中。
                                    </Text>
                                </Space>
                            </Space>
                        </Space>
                    </div>
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