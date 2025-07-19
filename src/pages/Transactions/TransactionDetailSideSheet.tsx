import {FC, useCallback, useEffect, useState} from 'react';
import {Card, Descriptions, SideSheet, Space, Spin, Toast, Typography} from '@douyinfe/semi-ui';
import {TransactionDetailData} from '../../api/generated';
import {getServerApi, handleResponse} from '../../api/utils';
import {getDayjsFormat, getErrorMsg} from '../../utils';

const {Text} = Typography;

interface TransactionDetailSideSheetProps {
    visible: boolean;
    businessId: string;
    onClose: () => void;
}

const TransactionDetailSideSheet: FC<TransactionDetailSideSheetProps> = ({
                                                                       visible,
                                                                       businessId,
                                                                       onClose
                                                                   }) => {
    const [detail, setDetail] = useState<TransactionDetailData | null>(null);
    const [loading, setLoading] = useState(false);

    // 获取交易详情
    const fetchDetail = useCallback(async () => {
        if (!businessId) return;

        setLoading(true);
        try {
            await handleResponse(
                getServerApi().transaction.transactionControllerGetTransactionDetail({
                    businessId
                }),
                {
                    onSuccess: (data) => {
                        setDetail(data);
                    },
                    onError: (errorMsg) => {
                        Toast.error({content: errorMsg});
                    }
                }
            );
        } catch (error) {
            Toast.error({content: getErrorMsg(error, '获取交易详情失败')});
        } finally {
            setLoading(false);
        }
    }, [businessId]);

    useEffect(() => {
        if (visible && businessId) {
            fetchDetail();
        }
    }, [visible, businessId, fetchDetail]);

    // 清理状态
    const handleClose = () => {
        setDetail(null);
        onClose();
    };

    // 格式化计费数据
    const formatBillingData = (billingData: Record<string, unknown>) => {
        if (!billingData || typeof billingData !== 'object') {
            return '无';
        }

        try {
            return (
                <pre style={{
                    backgroundColor: 'var(--semi-color-fill-0)',
                    padding: '12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    lineHeight: '1.4',
                    overflow: 'auto',
                    maxHeight: '200px',
                    margin: 0,
                    fontFamily: 'Monaco, Consolas, "Courier New", monospace'
                }}>
                    {JSON.stringify(billingData, null, 2)}
                </pre>
            );
        } catch {
            return '数据格式错误';
        }
    };

    return (
        <SideSheet
            title="交易详情"
            visible={visible}
            onCancel={handleClose}
            width={600}
            bodyStyle={{padding: '24px'}}
        >
            {loading ? (
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '200px'
                }}>
                    <Spin size="large" tip="加载中..."/>
                </div>
            ) : detail ? (
                <Space vertical spacing='loose' style={{width: '100%'}}>
                    {/* 基本信息 */}
                    <Card title="基本信息" bordered={false}>
                        <Descriptions
                            data={[
                                {
                                    key: '业务ID',
                                    value: (
                                        <Text
                                            copyable
                                            style={{
                                                fontFamily: 'monospace',
                                                fontSize: '12px',
                                                wordBreak: 'break-all'
                                            }}
                                        >
                                            {detail.businessId}
                                        </Text>
                                    )
                                },
                                {
                                    key: '模型',
                                    value: detail.model || '-'
                                },
                                {
                                    key: '服务提供商',
                                    value: detail.provider || '-'
                                },
                                {
                                    key: '计费类型',
                                    value: detail.billingType || '-'
                                },
                                {
                                    key: '上游ID',
                                    value: detail.upstreamId || '-'
                                }
                            ]}
                            row
                            size="medium"
                        />
                    </Card>

                    {/* 时间信息 */}
                    <Card title="时间信息" bordered={false}>
                        <Descriptions
                            data={[
                                {
                                    key: '开始时间',
                                    value: getDayjsFormat(detail.startTime, 'YYYY-MM-DD HH:mm:ss.SSS')
                                },
                                {
                                    key: '结束时间',
                                    value: getDayjsFormat(detail.endTime, 'YYYY-MM-DD HH:mm:ss.SSS')
                                },
                                {
                                    key: '持续时间',
                                    value: `${detail.durationMs} 毫秒`
                                },
                                {
                                    key: '创建时间',
                                    value: getDayjsFormat(detail.createdAt, 'YYYY-MM-DD HH:mm:ss')
                                }
                            ]}
                            row
                            size="medium"
                        />
                    </Card>

                    {/* 请求信息 */}
                    <Card title="请求信息" bordered={false}>
                        <Descriptions
                            data={[
                                {
                                    key: '客户端IP',
                                    value: (
                                        <Text
                                            copyable
                                            style={{fontFamily: 'monospace'}}
                                        >
                                            {detail.clientIp || '-'}
                                        </Text>
                                    )
                                },
                                {
                                    key: '用户代理',
                                    value: (
                                        <Text
                                            ellipsis={{
                                                showTooltip: {
                                                    opts: {content: detail.userAgent}
                                                }
                                            }}
                                            style={{
                                                maxWidth: '400px',
                                                fontSize: '12px'
                                            }}
                                        >
                                            {detail.userAgent || '-'}
                                        </Text>
                                    )
                                },
                                {
                                    key: '外部追踪ID',
                                    value: (
                                        <Text
                                            copyable
                                            style={{fontFamily: 'monospace'}}
                                        >
                                            {detail.externalTraceId || '-'}
                                        </Text>
                                    )
                                }
                            ]}
                            row
                            size="medium"
                        />
                    </Card>

                    {/* 计费数据 */}
                    <Card title="计费数据" bordered={false}>
                        <div style={{marginTop: '8px'}}>
                            {formatBillingData(detail.billingData)}
                        </div>
                    </Card>
                </Space>
            ) : (
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '200px'
                }}>
                    <Text type="tertiary">暂无详情数据</Text>
                </div>
            )}
        </SideSheet>
    );
};

export default TransactionDetailSideSheet;
