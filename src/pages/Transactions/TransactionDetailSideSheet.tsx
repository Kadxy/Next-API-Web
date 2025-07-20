import {FC, useCallback, useEffect, useState} from 'react';
import {Avatar, Card, Descriptions, SideSheet, Space, Spin, Tag, Typography} from '@douyinfe/semi-ui';
import {SelfTransactionRecordData, TransactionDetailData, WalletOwnerTransactionRecordData} from '../../api/generated';
import {getServerApi, handleResponse} from '../../api/utils';
import {formatCredit, getDayjsFormat, getDefaultAvatar, getErrorMsg} from '../../utils';
import {TRANSACTION_STATUS_MAP, TRANSACTION_TYPE_MAP} from './transaction.constant';

const {Text} = Typography;

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

    // 基础信息（来自列表数据）
    const renderBasicInfo = () => {
        if (!record) return null;

        const typeConfig = TRANSACTION_TYPE_MAP[record.type];
        const statusConfig = TRANSACTION_STATUS_MAP[record.status];
        const amountStr = typeof record.amount === 'object' && record.amount !== null
            ? String(record.amount)
            : String(record.amount || '0');

        // 检查是否是钱包交易记录（包含用户信息）
        const walletRecord = record as WalletOwnerTransactionRecordData;
        const hasUserInfo = walletRecord.user;

        return (
            <Card
                title="交易信息"
                bordered={false}
                bodyStyle={{padding: '16px 20px'}}
                style={{marginBottom: '16px'}}
            >
                <Space vertical spacing="medium" style={{width: '100%'}}>
                    {/* 主要信息 */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: '16px',
                        padding: '16px',
                        backgroundColor: 'var(--semi-color-fill-0)',
                        borderRadius: '8px'
                    }}>
                        <div>
                            <Text type="secondary" size="small" style={{display: 'block', marginBottom: '4px'}}>
                                交易类型
                            </Text>
                            <Tag color={typeConfig.color} size="large">
                                {typeConfig.text}
                            </Tag>
                        </div>
                        <div>
                            <Text type="secondary" size="small" style={{display: 'block', marginBottom: '4px'}}>
                                交易状态
                            </Text>
                            <Tag color={statusConfig.color} size="large">
                                {statusConfig.text}
                            </Tag>
                        </div>
                        <div style={{gridColumn: '1 / -1'}}>
                            <Text type="secondary" size="small" style={{display: 'block', marginBottom: '4px'}}>
                                交易金额
                            </Text>
                            <Text strong style={{fontSize: '20px', color: 'var(--semi-color-primary)'}}>
                                {formatCredit(amountStr)}
                            </Text>
                        </div>
                    </div>

                    {/* 用户信息（钱包交易记录） */}
                    {hasUserInfo && (
                        <div style={{
                            padding: '12px 16px',
                            backgroundColor: 'var(--semi-color-primary-light-default)',
                            borderRadius: '8px',
                            border: '1px solid var(--semi-color-primary-light-active)'
                        }}>
                            <Text type="secondary" size="small" style={{display: 'block', marginBottom: '8px'}}>
                                交易用户
                            </Text>
                            <Space>
                                {walletRecord.user.avatar ?
                                    <Avatar size="small" src={walletRecord.user.avatar}/> :
                                    getDefaultAvatar(walletRecord.user.displayName, 'small')
                                }
                                <Text strong>{walletRecord.user.displayName}</Text>
                            </Space>
                        </div>
                    )}

                    {/* 详细信息 */}
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
                                        {record.businessId}
                                    </Text>
                                )
                            },
                            {
                                key: '描述',
                                value: record.description || '-'
                            },
                            {
                                key: '创建时间',
                                value: getDayjsFormat(record.createdAt, 'YYYY-MM-DD HH:mm:ss')
                            },
                            {
                                key: '更新时间',
                                value: getDayjsFormat(record.updatedAt, 'YYYY-MM-DD HH:mm:ss')
                            }
                        ]}
                        row
                        size="medium"
                    />

                    {/* 错误信息 */}
                    {record.errorMessage && (
                        <div style={{
                            padding: '12px 16px',
                            backgroundColor: 'var(--semi-color-danger-light-default)',
                            borderRadius: '8px',
                            border: '1px solid var(--semi-color-danger-light-active)'
                        }}>
                            <Text type="secondary" size="small" style={{display: 'block', marginBottom: '8px'}}>
                                错误信息
                            </Text>
                            <Text type="danger">
                                {record.errorMessage}
                            </Text>
                        </div>
                    )}

                    {/* API Key 信息 */}
                    {record.apiKey && (
                        <div style={{
                            padding: '12px 16px',
                            backgroundColor: 'var(--semi-color-warning-light-default)',
                            borderRadius: '8px',
                            border: '1px solid var(--semi-color-warning-light-active)'
                        }}>
                            <Text type="secondary" size="small" style={{display: 'block', marginBottom: '8px'}}>
                                API Key
                            </Text>
                            <Text>
                                {String((record.apiKey as Record<string, unknown>)?.displayName || '-')}
                            </Text>
                        </div>
                    )}
                </Space>
            </Card>
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
                    <Spin size="large" tip="加载详细信息中..."/>
                </div>
            );
        }

        if (detailError) {
            return (
                <Card
                    title="详细信息"
                    bordered={false}
                    bodyStyle={{padding: '20px'}}
                >
                    <div style={{
                        textAlign: 'center',
                        padding: '20px',
                        backgroundColor: 'var(--semi-color-warning-light-default)',
                        borderRadius: '8px',
                        border: '1px solid var(--semi-color-warning-light-active)'
                    }}>
                        <Text type="warning" style={{fontSize: '16px'}}>
                            暂无详细信息
                        </Text>
                        <br/>
                        <Text type="tertiary" size="small" style={{marginTop: '8px', display: 'block'}}>
                            {detailError}
                        </Text>
                    </div>
                </Card>
            );
        }

        if (!detail) {
            return null;
        }

        return (
            <Card
                title="详细信息"
                bordered={false}
                bodyStyle={{padding: '16px 20px'}}
            >
                <Space vertical spacing="medium" style={{width: '100%'}}>
                    {/* 时间信息 */}
                    <div style={{
                        padding: '16px',
                        backgroundColor: 'var(--semi-color-fill-0)',
                        borderRadius: '8px'
                    }}>
                        <Text strong
                              style={{display: 'block', marginBottom: '12px', color: 'var(--semi-color-text-0)'}}>
                            时间信息
                        </Text>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                            gap: '12px'
                        }}>
                            <div>
                                <Text type="secondary" size="small">开始时间</Text>
                                <Text style={{display: 'block', fontFamily: 'monospace', fontSize: '12px'}}>
                                    {getDayjsFormat(detail.startTime, 'YYYY-MM-DD HH:mm:ss.SSS')}
                                </Text>
                            </div>
                            <div>
                                <Text type="secondary" size="small">结束时间</Text>
                                <Text style={{display: 'block', fontFamily: 'monospace', fontSize: '12px'}}>
                                    {getDayjsFormat(detail.endTime, 'YYYY-MM-DD HH:mm:ss.SSS')}
                                </Text>
                            </div>
                            <div>
                                <Text type="secondary" size="small">持续时间</Text>
                                <Text style={{display: 'block'}}>
                                    {detail.durationMs} 毫秒
                                </Text>
                            </div>
                        </div>
                    </div>

                    {/* 请求信息 */}
                    <div style={{
                        padding: '16px',
                        backgroundColor: 'var(--semi-color-fill-0)',
                        borderRadius: '8px'
                    }}>
                        <Text strong
                              style={{display: 'block', marginBottom: '12px', color: 'var(--semi-color-text-0)'}}>
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
                                <Text style={{display: 'block'}}>
                                    {detail.model || '-'}
                                </Text>
                            </div>
                            <div>
                                <Text type="secondary" size="small">服务提供商</Text>
                                <Text style={{display: 'block'}}>
                                    {detail.provider || '-'}
                                </Text>
                            </div>
                            <div>
                                <Text type="secondary" size="small">计费类型</Text>
                                <Text style={{display: 'block'}}>
                                    {detail.billingType || '-'}
                                </Text>
                            </div>
                            <div>
                                <Text type="secondary" size="small">上游ID</Text>
                                <Text style={{display: 'block'}}>
                                    {detail.upstreamId || '-'}
                                </Text>
                            </div>
                        </div>
                    </div>

                    {/* 用户代理 */}
                    {detail.userAgent && (
                        <div style={{
                            padding: '16px',
                            backgroundColor: 'var(--semi-color-fill-0)',
                            borderRadius: '8px'
                        }}>
                            <Text strong
                                  style={{display: 'block', marginBottom: '12px', color: 'var(--semi-color-text-0)'}}>
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
                        </div>
                    )}

                    {/* 计费数据 */}
                    {detail.billingData && (
                        <div style={{
                            padding: '16px',
                            backgroundColor: 'var(--semi-color-fill-0)',
                            borderRadius: '8px'
                        }}>
                            <Text strong
                                  style={{display: 'block', marginBottom: '12px', color: 'var(--semi-color-text-0)'}}>
                                计费数据
                            </Text>
                            {formatBillingData(detail.billingData)}
                        </div>
                    )}
                </Space>
            </Card>
        );
    };

    return (
        <SideSheet
            title="交易详情"
            visible={visible}
            onCancel={handleClose}
            width={700}
            bodyStyle={{padding: '20px'}}
        >
            <div style={{height: '100%', overflow: 'auto'}}>
                {renderBasicInfo()}
                {renderDetailInfo()}
            </div>
        </SideSheet>
    );
};

export default TransactionDetailSideSheet;
