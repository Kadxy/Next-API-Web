import { FC, useEffect, useMemo, useRef, useState } from 'react';
import { Modal, Space, Spin, Toast, Typography, Image, Button } from '@douyinfe/semi-ui';
import QRCode from 'qrcode';
import { getServerApi, handleResponse } from '../../api/utils';
import { EpayQueryOrderResponse } from '../../api/generated';

const { Text } = Typography;

interface PaymentQRModalProps {
    visible: boolean;
    onClose: () => void;
    onSuccess: () => void;
    tradeNo: string;
    qrCodeUrl: string;
}

const PaymentQRModal: FC<PaymentQRModalProps> = ({
    visible,
    onClose,
    onSuccess,
    tradeNo,
    qrCodeUrl,
}) => {
    const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const pollingRef = useRef<NodeJS.Timeout | null>(null);

    const paymentName = useMemo(() => {
        return qrCodeUrl?.includes('weixin') ? '微信' : '支付宝';
    }, [qrCodeUrl]);

    // 生成二维码
    const generateQRCode = async () => {
        try {
            setLoading(true);

            const dataUrl = await QRCode.toDataURL(qrCodeUrl, {
                width: 240,
                margin: 2,
                color: { dark: '#000000', light: '#FFFFFF' },
            });

            setQrCodeDataUrl(dataUrl);
        } catch (error) {
            console.error('生成二维码失败:', error);
            Toast.error('生成二维码失败');
        } finally {
            setLoading(false);
        }
    };

    // 查询订单状态
    const queryOrderStatus = async (): Promise<boolean> => {
        try {
            let isPaid = false;
            await handleResponse(
                getServerApi().epay.epayControllerHandleQueryOrder({ tradeNo }),
                {
                    onSuccess: (data: EpayQueryOrderResponse) => {
                        if (data.status === 1) { // 已支付
                            isPaid = true;
                            Toast.success('支付成功！');
                            onSuccess();
                            stopPolling();
                        }
                    },
                    onError: (msg) => {
                        console.error('查询订单状态失败:', msg);
                    }
                }
            );
            return isPaid;
        } catch (error) {
            console.error('查询订单状态异常:', error);
            return false;
        }
    };

    // 开始轮询
    const startPolling = () => {
        if (pollingRef.current) return;

        pollingRef.current = setInterval(async () => {
            const isPaid = await queryOrderStatus();
            if (isPaid) {
                stopPolling();
            }
        }, 1000); // 每1秒查询一次
    };

    // 停止轮询
    const stopPolling = () => {
        if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
        }
    };

    // 关闭弹窗
    const handleClose = () => {
        stopPolling();
        onClose();
    };

    // 当弹窗显示时生成二维码并开始轮询
    useEffect(() => {
        if (visible && qrCodeUrl) {
            generateQRCode();
            startPolling();
        } else {
            stopPolling();
        }

        return () => {
            stopPolling();
        };

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visible, qrCodeUrl]);

    return (
        <Modal
            title="扫码支付"
            visible={visible}
            onCancel={handleClose}
            centered
            width={300}
            footer={
                <Button
                    onClick={async () => {
                        const success = await queryOrderStatus();
                        if (success) {
                            handleClose();
                            onSuccess();
                        } else {
                            Toast.error('支付失败');
                            handleClose();
                        }
                    }}
                    type='tertiary'
                >
                    支付完成
                </Button>
            }
            maskClosable={false}
            closable={false}
        >
            <Space
                vertical
                spacing="loose"
                align="center"
                style={{ width: '100%' }}
            >
                {loading ? (
                    <Spin size="large" />
                ) : qrCodeDataUrl ? (
                    <Image
                        src={qrCodeDataUrl}
                        alt="支付二维码"
                        width={240}
                        height={240}
                        preview={false}
                    />
                ) : (
                    <Text type="tertiary">
                        二维码生成失败
                    </Text>
                )}
                {/* 提示信息 */}
                <div style={{ textAlign: 'center' }}>
                    <Text type="tertiary">
                        使用&nbsp;
                        <Text type="tertiary" strong>
                            {paymentName}
                        </Text>
                        &nbsp;扫描上方二维码完成支付
                    </Text>
                </div>
            </Space>
        </Modal>
    );
};

export default PaymentQRModal;
