import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { Col, Descriptions, Divider, Popover, Row, SideSheet, Spin, Tag, Typography } from '@douyinfe/semi-ui';
import { SelfTransactionRecordData, TransactionDetailData, WalletOwnerTransactionRecordData } from '../../api/generated';
import { getServerApi, handleResponse } from '../../api/utils';
import { getDayjsFormat, getErrorMsg } from '../../utils';
import dayjs from "dayjs";
import { IconKey, IconUser } from '@douyinfe/semi-icons';

const { Text } = Typography;

interface TransactionDetailSideSheetProps {
    visible: boolean;
    record: SelfTransactionRecordData | WalletOwnerTransactionRecordData | null;
    onClose: () => void;
}

const TransactionDetailSideSheet: FC<TransactionDetailSideSheetProps> = ({
    visible,
    record,
    onClose
}) => {
    const [detail, setDetail] = useState<TransactionDetailData | null>(null);
    const [loading, setLoading] = useState(false);
    const [detailError, setDetailError] = useState<string | null>(null);

    // 获取交易详情
    const fetchDetail = useCallback(async () => {
        if (!record || !record.businessId) return;

        setLoading(true);
        setDetailError(null);
        try {
            await handleResponse(
                getServerApi().transaction.transactionControllerGetTransactionDetail({
                    businessId: record.businessId
                }),
                {
                    onSuccess: (data) => {
                        setDetail(data);
                    },
                    onError: (errorMsg) => {
                        setDetailError(errorMsg);
                    }
                }
            );
        } catch (error) {
            setDetailError(getErrorMsg(error, '获取交易详情失败'));
        } finally {
            setLoading(false);
        }
    }, [record]);

    useEffect(() => {
        if (visible && record && record.businessId) {
            fetchDetail().catch();
        }
    }, [visible, record, fetchDetail]);

    // 清理状态
    const handleClose = () => {
        setDetail(null);
        setDetailError(null);
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

    const amountStr = useMemo<string | null>(() => {
        if (!record || !record.amount) {
            return null;
        }

        const numericAmount = Number(record.amount);

        if (!Number.isFinite(numericAmount) || isNaN(numericAmount)) {
            return null;
        }

        return `$${Math.abs(numericAmount).toFixed(6)}`
    }, [record]);

    // 基础信息（来自列表数据）
    const renderBasicInfo = () => {
        if (!record) return null;

        return (
            <Descriptions
                align='left'
                layout='vertical'
                style={{ width: '100%' }}
                data={[
                    {
                        key: '业务ID',
                        value: <Text copyable style={{ fontFamily: 'monospace' }}>{record.businessId}</Text>
                    },
                    {
                        key: '交易摘要',
                        value: <Text copyable>{record.description}</Text>,
                        hidden: !record.description
                    },
                    { key: '创建时间', value: dayjs(record.createdAt).format('YYYY-MM-DD HH:mm:ss') },
                    { key: '完成时间', value: dayjs(record.updatedAt).format('YYYY-MM-DD HH:mm:ss') },
                    { key: '错误信息', value: <Text type="danger">{record.errorMessage}</Text>, hidden: !record.errorMessage },
                    { key: '交易金额', value: <Text >{amountStr}</Text>, hidden: !amountStr },
                    {
                        key: '交易用户',
                        value: (
                            <Popover
                                content={(
                                    <Text
                                        copyable={{ content: (record as WalletOwnerTransactionRecordData)?.user?.uid }}
                                        style={{ fontFamily: 'monospace' }}
                                        type='secondary'
                                        size='small'
                                    >
                                        UID: {(record as WalletOwnerTransactionRecordData)?.user?.uid}
                                    </Text>
                                )}
                                position="rightTop"
                                style={{ padding: '8px 12px' }}
                            >
                                <Tag
                                    color="green"
                                    type='ghost'
                                    shape='circle'
                                    style={{ padding: 8, cursor: 'pointer' }}
                                    prefixIcon={<IconUser size="small" />}
                                >
                                    {(record as WalletOwnerTransactionRecordData)?.user?.displayName}
                                </Tag>
                            </Popover>
                        ),
                        hidden: !(record as WalletOwnerTransactionRecordData)?.user
                    },
                    {
                        key: 'API Key',
                        value: (
                            <Popover
                                content={(
                                    <Descriptions
                                        align='plain'
                                        data={[
                                            {
                                                key: <Text type='secondary' size='small'>名称</Text>,
                                                value: <Text type='secondary' size='small'>{record.apiKey?.displayName}</Text>
                                            },
                                            {
                                                key: <Text type='secondary' size='small'>预览</Text>,
                                                value: (
                                                    <Text type='secondary' size='small'>
                                                        sk-{record.apiKey?.preview.slice(0, 4)}**{record.apiKey?.preview.slice(-4)}
                                                    </Text>
                                                )
                                            },
                                            {
                                                key: <Text type='secondary' size='small'>哈希</Text>,
                                                value: (
                                                    <Text copyable={{ content: record.apiKey?.hashKey }} type='secondary' size='small'>
                                                        {record.apiKey?.hashKey.slice(0, 16)}...
                                                    </Text>
                                                )
                                            },
                                        ]}
                                        style={{ padding: '16px 16px 8px 16px' }}
                                    />
                                )}
                                position="rightTop"
                            >
                                <Tag
                                    color="blue"
                                    type='ghost'
                                    prefixIcon={<IconKey size="small" />}
                                    shape='circle'
                                    style={{ padding: 8, cursor: 'pointer' }}
                                >
                                    {record?.apiKey?.displayName}
                                </Tag>
                            </Popover>
                        ),
                        hidden: !record.apiKey
                    },
                ]}
            />
        );
    };

    // 详细信息（来自详情接口）
    const renderDetailInfo = () => {
        if (loading) {
            return (
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100px'
                }}>
                    <Spin size="large" tip="加载详细信息中..." />
                </div>
            );
        }

        if (detailError) {
            return (
                <div style={{
                    textAlign: 'center',
                    padding: '20px',
                    backgroundColor: 'var(--semi-color-warning-light-default)',
                    borderRadius: '8px',
                    border: '1px solid var(--semi-color-warning-light-active)'
                }}>
                    <Text type="warning" style={{ fontSize: '16px' }}>
                        暂无详细信息
                    </Text>
                    <br />
                    <Text type="tertiary" size="small" style={{ marginTop: '8px', display: 'block' }}>
                        {detailError}
                    </Text>
                </div>
            );
        }

        if (!detail) {
            return null;
        }

        return (
            <Row gutter={[32, 32]} style={{ width: '100%' }}>
                {/* 时间信息 */}
                <Col span={8} offset={1} style={{
                    padding: '16px',
                    backgroundColor: 'var(--semi-color-fill-0)',
                    borderRadius: '8px'
                }}>
                    <Text strong
                        style={{ display: 'block', marginBottom: '12px', color: 'var(--semi-color-text-0)' }}>
                        时间信息
                    </Text>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '12px'
                    }}>
                        <div>
                            <Text type="secondary" size="small">开始时间</Text>
                            <Text style={{ display: 'block', fontFamily: 'monospace', fontSize: '12px' }}>
                                {getDayjsFormat(detail.startTime, 'YYYY-MM-DD HH:mm:ss.SSS')}
                            </Text>
                        </div>
                        <div>
                            <Text type="secondary" size="small">结束时间</Text>
                            <Text style={{ display: 'block', fontFamily: 'monospace', fontSize: '12px' }}>
                                {getDayjsFormat(detail.endTime, 'YYYY-MM-DD HH:mm:ss.SSS')}
                            </Text>
                        </div>
                        <div>
                            <Text type="secondary" size="small">持续时间</Text>
                            <Text style={{ display: 'block' }}>
                                {detail.durationMs} 毫秒
                            </Text>
                        </div>
                    </div>
                </Col>

                {/* 请求信息 */}
                <Col span={12} offset={2} style={{
                    padding: '16px',
                    backgroundColor: 'var(--semi-color-fill-0)',
                    borderRadius: '8px'
                }}>
                    <Text strong
                        style={{ display: 'block', marginBottom: '12px', color: 'var(--semi-color-text-0)' }}>
                        请求信息
                    </Text>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '12px'
                    }}>
                        <div>
                            <Text type="secondary" size="small">客户端IP</Text>
                            <Text
                                copyable
                                style={{
                                    display: 'block',
                                    fontFamily: 'monospace',
                                    fontSize: '12px'
                                }}
                            >
                                {detail.clientIp || '-'}
                            </Text>
                        </div>
                        <div>
                            <Text type="secondary" size="small">外部追踪ID</Text>
                            <Text
                                copyable
                                style={{
                                    display: 'block',
                                    fontFamily: 'monospace',
                                    fontSize: '12px',
                                    wordBreak: 'break-all'
                                }}
                            >
                                {detail.externalTraceId || '-'}
                            </Text>
                        </div>
                        <div>
                            <Text type="secondary" size="small">模型</Text>
                            <Text style={{ display: 'block' }}>
                                {detail.model || '-'}
                            </Text>
                        </div>
                        <div>
                            <Text type="secondary" size="small">服务提供商</Text>
                            <Text style={{ display: 'block' }}>
                                {detail.provider || '-'}
                            </Text>
                        </div>
                        <div>
                            <Text type="secondary" size="small">计费类型</Text>
                            <Text style={{ display: 'block' }}>
                                {detail.billingType || '-'}
                            </Text>
                        </div>
                        <div>
                            <Text type="secondary" size="small">上游ID</Text>
                            <Text style={{ display: 'block' }}>
                                {detail.upstreamId || '-'}
                            </Text>
                        </div>
                    </div>
                </Col>

                {/* 用户代理 */}
                {detail.userAgent && (
                    <Col span={12} style={{
                        padding: '16px',
                        backgroundColor: 'var(--semi-color-fill-0)',
                        borderRadius: '8px'
                    }}>
                        <Text strong
                            style={{ display: 'block', marginBottom: '12px', color: 'var(--semi-color-text-0)' }}>
                            用户代理
                        </Text>
                        <Text
                            style={{
                                fontSize: '12px',
                                wordBreak: 'break-all',
                                backgroundColor: 'var(--semi-color-bg-2)',
                                padding: '12px',
                                borderRadius: '6px',
                                display: 'block',
                                border: '1px solid var(--semi-color-border)',
                                fontFamily: 'monospace'
                            }}
                        >
                            {detail.userAgent}
                        </Text>
                    </Col>
                )}

                {/* 计费数据 */}
                {detail.billingData && (
                    <Col span={12} style={{
                        padding: '16px',
                        backgroundColor: 'var(--semi-color-fill-0)',
                        borderRadius: '8px'
                    }}>
                        <Text strong
                            style={{ display: 'block', marginBottom: '12px', color: 'var(--semi-color-text-0)' }}>
                            计费数据
                        </Text>
                        {formatBillingData(detail.billingData)}
                    </Col>
                )}
            </Row>
        );
    };

    return (
        <SideSheet
            title="交易详情"
            visible={visible}
            onCancel={handleClose}
            width={720}
            bodyStyle={{
                padding: 16,
            }}
        >
            <div style={{ height: '100%', overflow: 'auto', scrollbarWidth: 'none' }}>
                {renderBasicInfo()}
                <Divider style={{ margin: '16px 0' }} />
                {renderDetailInfo()}
            </div>
        </SideSheet>
    );
};

export default TransactionDetailSideSheet;
