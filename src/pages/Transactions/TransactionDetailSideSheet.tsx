import {FC, useCallback, useEffect, useMemo, useState} from 'react';
import {Card, Descriptions, Empty, Popover, SideSheet, Skeleton, Tag, Typography} from '@douyinfe/semi-ui';
import {SelfTransactionRecordData, TransactionDetailData, WalletOwnerTransactionRecordData} from '../../api/generated';
import {getServerApi, handleResponse} from '../../api/utils';
import {getDayjsFormat, getErrorMsg} from '../../utils';
import dayjs from "dayjs";
import {
    IconClock,
    IconKey,
    IconSafe,
    IconServer,
    IconUser,
    IconInfoCircle,
    IconCode,
    IconPulse,
    IconGlobe
} from '@douyinfe/semi-icons';
import {TRANSACTION_STATUS_MAP, TRANSACTION_TYPE_MAP} from './transaction.constant';

const {Text, Title} = Typography;

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
        } else {
            // 当侧边栏关闭时清理状态
            setDetail(null);
            setDetailError(null);
        }
    }, [visible, record, fetchDetail]);

    // 清理状态
    const handleClose = () => {
        onClose();
    };

    // 格式化计费数据为代码块显示
    const formatBillingData = (billingData: Record<string, unknown>) => {
        if (!billingData || typeof billingData !== 'object') {
            return <Text type="tertiary">暂无计费数据</Text>;
        }

        try {
            const jsonString = JSON.stringify(billingData, null, 2);
            if (jsonString === '{}') {
                return <Text type="tertiary">暂无计费数据</Text>;
            }

            return (
                <pre style={{
                    backgroundColor: 'var(--semi-color-fill-0)',
                    padding: '12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    lineHeight: '1.4',
                    overflow: 'auto',
                    maxHeight: '300px',
                    margin: 0,
                    fontFamily: 'Monaco, Consolas, "Courier New", monospace',
                    border: '1px solid var(--semi-color-border)',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word'
                }}>
                    {jsonString}
                </pre>
            );
        } catch {
            return <Text type="danger">数据格式错误</Text>;
        }
    };

    // 获取交易类型配置
    const typeConfig = useMemo(() => {
        if (!record?.type) return null;
        return TRANSACTION_TYPE_MAP[record.type] || null;
    }, [record?.type]);

    // 获取状态配置
    const statusConfig = useMemo(() => {
        if (!record?.status) return null;
        return TRANSACTION_STATUS_MAP[record.status] || null;
    }, [record?.status]);

    // 格式化金额显示（包含正负号和颜色）
    const amountDisplay = useMemo(() => {
        if (!record?.amount) return null;

        const numericAmount = Number(record.amount);
        if (!Number.isFinite(numericAmount) || isNaN(numericAmount)) return null;

        const isPositive = numericAmount > 0;
        const absAmount = Math.abs(numericAmount).toFixed(6);

        return {
            text: `${isPositive ? '+' : '-'}$${absAmount}`,
            color: isPositive ? 'var(--semi-color-success)' : 'var(--semi-color-danger)'
        };
    }, [record?.amount]);

    // 渲染业务ID标题
    const renderBusinessIdHeader = () => {
        if (!record) return null;

        return (
            <div style={{
                marginBottom: '16px',
                padding: '16px',
                backgroundColor: 'var(--semi-color-fill-0)',
                borderRadius: '8px',
                border: '1px solid var(--semi-color-border)'
            }}>
                <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px'}}>
                    <Title heading={6} style={{margin: 0, color: 'var(--semi-color-text-2)'}}>
                        业务ID
                    </Title>
                    <Text
                        copyable={{content: record.businessId}}
                        style={{
                            fontFamily: 'monospace',
                            fontSize: '14px',
                            fontWeight: 600,
                            color: 'var(--semi-color-text-0)'
                        }}
                    >
                        {record.businessId}
                    </Text>
                </div>

                {/* 交易概览 */}
                <div style={{display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap'}}>
                    {/* 状态 */}
                    {statusConfig && (
                        <div style={{display: 'flex', alignItems: 'center', gap: '4px'}}>
                            <Text type="secondary" size="small">状态:</Text>
                            <Tag color={statusConfig.color} size="small">
                                {statusConfig.text}
                            </Tag>
                        </div>
                    )}

                    {/* 类型 */}
                    {typeConfig && (
                        <div style={{display: 'flex', alignItems: 'center', gap: '4px'}}>
                            <Text type="secondary" size="small">类型:</Text>
                            <Tag color={typeConfig.color} size="small">
                                {typeConfig.text}
                            </Tag>
                        </div>
                    )}

                    {/* 金额 */}
                    {amountDisplay && (
                        <div style={{display: 'flex', alignItems: 'center', gap: '4px'}}>
                            <IconSafe size="small" style={{color: 'var(--semi-color-text-2)'}}/>
                            <Text
                                style={{
                                    color: amountDisplay.color,
                                    fontWeight: 600,
                                    fontFamily: 'monospace'
                                }}
                            >
                                {amountDisplay.text}
                            </Text>
                        </div>
                    )}

                    {/* 时间 */}
                    <div style={{display: 'flex', alignItems: 'center', gap: '4px'}}>
                        <IconClock size="small" style={{color: 'var(--semi-color-text-2)'}}/>
                        <Text type="secondary" size="small">
                            {dayjs(record.createdAt).format('YYYY-MM-DD HH:mm:ss')}
                        </Text>
                    </div>
                </div>
            </div>
        );
    };

    // 渲染基础信息卡片
    const renderBasicInfoCard = () => {
        if (!record) return null;

        return (
            <Card
                title={
                    <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                        <IconInfoCircle size="small"/>
                        <Text strong>基础信息</Text>
                    </div>
                }
                style={{marginBottom: '16px'}}
                bodyStyle={{padding: '16px'}}
            >
                <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
                    {/* 交易描述 */}
                    {record.description && (
                        <div>
                            <Text type="secondary" size="small" style={{marginBottom: '4px', display: 'block'}}>
                                交易描述
                            </Text>
                            <Text copyable style={{wordBreak: 'break-word'}}>
                                {record.description}
                            </Text>
                        </div>
                    )}

                    {/* 错误信息 */}
                    {record.errorMessage && (
                        <div>
                            <Text type="secondary" size="small" style={{marginBottom: '4px', display: 'block'}}>
                                错误信息
                            </Text>
                            <Text type="danger" style={{wordBreak: 'break-word'}}>
                                {record.errorMessage}
                            </Text>
                        </div>
                    )}

                    {/* 时间信息 */}
                    <div style={{display: 'flex', flexWrap: 'wrap', gap: '24px'}}>
                        <div>
                            <Text type="secondary" size="small" style={{marginBottom: '4px', display: 'block'}}>
                                创建时间
                            </Text>
                            <Text style={{fontFamily: 'monospace', fontSize: '13px'}}>
                                {dayjs(record.createdAt).format('YYYY-MM-DD HH:mm:ss')}
                            </Text>
                        </div>
                        <div>
                            <Text type="secondary" size="small" style={{marginBottom: '4px', display: 'block'}}>
                                更新时间
                            </Text>
                            <Text style={{fontFamily: 'monospace', fontSize: '13px'}}>
                                {dayjs(record.updatedAt).format('YYYY-MM-DD HH:mm:ss')}
                            </Text>
                        </div>
                    </div>

                    {/* API Key 和用户信息 */}
                    {(record.apiKey || ('user' in record && record.user)) && (
                        <div style={{display: 'flex', flexWrap: 'wrap', gap: '24px'}}>
                            {record.apiKey && (
                                <div>
                                    <Text type="secondary" size="small" style={{marginBottom: '4px', display: 'block'}}>
                                        API Key
                                    </Text>
                                    <Popover
                                        content={(
                                            <Descriptions
                                                align='plain'
                                                data={[
                                                    {
                                                        key: <Text type='secondary' size='small'>名称</Text>,
                                                        value: <Text type='secondary'
                                                                     size='small'>{record.apiKey.displayName}</Text>
                                                    },
                                                    {
                                                        key: <Text type='secondary' size='small'>预览</Text>,
                                                        value: (
                                                            <Text type='secondary' size='small'>
                                                                sk-{record.apiKey.preview.slice(0, 4)}**{record.apiKey.preview.slice(-4)}
                                                            </Text>
                                                        )
                                                    },
                                                    {
                                                        key: <Text type='secondary' size='small'>哈希</Text>,
                                                        value: (
                                                            <Text copyable={{content: record.apiKey.hashKey}} type='secondary'
                                                                  size='small'>
                                                                {record.apiKey.hashKey.slice(0, 16)}...
                                                            </Text>
                                                        )
                                                    },
                                                ]}
                                                style={{padding: '16px 16px 8px 16px'}}
                                            />
                                        )}
                                        position="rightTop"
                                    >
                                        <Tag
                                            color="blue"
                                            type='ghost'
                                            prefixIcon={<IconKey size="small"/>}
                                            shape='circle'
                                            style={{padding: 8, cursor: 'pointer'}}
                                        >
                                            {record.apiKey.displayName}
                                        </Tag>
                                    </Popover>
                                </div>
                            )}

                            {'user' in record && record.user && (
                                <div>
                                    <Text type="secondary" size="small" style={{marginBottom: '4px', display: 'block'}}>
                                        交易用户
                                    </Text>
                                    <Popover
                                        content={(
                                            <Text
                                                copyable={{content: record.user.uid}}
                                                style={{fontFamily: 'monospace'}}
                                                type='secondary'
                                                size='small'
                                            >
                                                UID: {record.user.uid}
                                            </Text>
                                        )}
                                        position="rightTop"
                                        style={{padding: '8px 12px'}}
                                    >
                                        <Tag
                                            color="green"
                                            type='ghost'
                                            shape='circle'
                                            style={{padding: 8, cursor: 'pointer'}}
                                            prefixIcon={<IconUser size="small"/>}
                                        >
                                            {record.user.displayName}
                                        </Tag>
                                    </Popover>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </Card>
        );
    };

    // 渲染技术详情（可折叠）
    const renderTechnicalDetails = () => {
        if (loading) {
            return (
                <Card style={{marginBottom: '16px'}}>
                    <Skeleton
                        placeholder={
                            <div>
                                <Skeleton.Title style={{width: '30%', marginBottom: '16px'}}/>
                                <Skeleton.Paragraph rows={3}/>
                            </div>
                        }
                        loading={true}
                    />
                </Card>
            );
        }

        if (detailError) {
            return (
                <Card style={{marginBottom: '16px'}}>
                    <Empty
                        image={<IconServer size="large" style={{color: 'var(--semi-color-text-3)'}}/>}
                        title="暂无技术详情"
                        description={detailError}
                    />
                </Card>
            );
        }

        if (!detail) {
            return null;
        }

        const technicalItems = [
            {
                key: 'timing',
                title: '时间信息',
                icon: <IconClock size="small"/>,
                content: (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '16px'
                    }}>
                        <div>
                            <Text type="secondary" size="small" style={{marginBottom: '4px', display: 'block'}}>
                                开始时间
                            </Text>
                            <Text style={{fontFamily: 'monospace', fontSize: '12px'}}>
                                {getDayjsFormat(detail.startTime, 'YYYY-MM-DD HH:mm:ss.SSS')}
                            </Text>
                        </div>
                        <div>
                            <Text type="secondary" size="small" style={{marginBottom: '4px', display: 'block'}}>
                                结束时间
                            </Text>
                            <Text style={{fontFamily: 'monospace', fontSize: '12px'}}>
                                {getDayjsFormat(detail.endTime, 'YYYY-MM-DD HH:mm:ss.SSS')}
                            </Text>
                        </div>
                        <div>
                            <Text type="secondary" size="small" style={{marginBottom: '4px', display: 'block'}}>
                                持续时间
                            </Text>
                            <Text style={{fontFamily: 'monospace'}}>
                                {detail.durationMs} 毫秒
                            </Text>
                        </div>
                    </div>
                )
            },
            {
                key: 'request',
                title: '请求信息',
                icon: <IconGlobe size="small"/>,
                content: (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '16px'
                    }}>
                        <div>
                            <Text type="secondary" size="small" style={{marginBottom: '4px', display: 'block'}}>
                                客户端IP
                            </Text>
                            {detail.clientIp ? (
                                <Text copyable style={{fontFamily: 'monospace', fontSize: '12px'}}>
                                    {detail.clientIp}
                                </Text>
                            ) : (
                                <Text type="tertiary" style={{fontSize: '12px'}}>
                                    无
                                </Text>
                            )}
                        </div>
                        <div>
                            <Text type="secondary" size="small" style={{marginBottom: '4px', display: 'block'}}>
                                外部追踪ID
                            </Text>
                            {detail.externalTraceId && detail.externalTraceId.trim() ? (
                                <Text copyable style={{fontFamily: 'monospace', fontSize: '12px', wordBreak: 'break-all'}}>
                                    {detail.externalTraceId}
                                </Text>
                            ) : (
                                <Text type="tertiary" style={{fontSize: '12px'}}>
                                    无
                                </Text>
                            )}
                        </div>
                        <div>
                            <Text type="secondary" size="small" style={{marginBottom: '4px', display: 'block'}}>
                                模型
                            </Text>
                            {detail.model ? (
                                <Text>{detail.model}</Text>
                            ) : (
                                <Text type="tertiary" style={{fontSize: '12px'}}>无</Text>
                            )}
                        </div>
                        <div>
                            <Text type="secondary" size="small" style={{marginBottom: '4px', display: 'block'}}>
                                服务提供商
                            </Text>
                            {detail.provider ? (
                                <Text>{detail.provider}</Text>
                            ) : (
                                <Text type="tertiary" style={{fontSize: '12px'}}>无</Text>
                            )}
                        </div>
                        <div>
                            <Text type="secondary" size="small" style={{marginBottom: '4px', display: 'block'}}>
                                计费类型
                            </Text>
                            {detail.billingType ? (
                                <Text>{detail.billingType}</Text>
                            ) : (
                                <Text type="tertiary" style={{fontSize: '12px'}}>无</Text>
                            )}
                        </div>
                        <div>
                            <Text type="secondary" size="small" style={{marginBottom: '4px', display: 'block'}}>
                                上游ID
                            </Text>
                            {detail.upstreamId ? (
                                <Text style={{fontFamily: 'monospace'}}>{detail.upstreamId}</Text>
                            ) : (
                                <Text type="tertiary" style={{fontSize: '12px'}}>无</Text>
                            )}
                        </div>
                    </div>
                )
            }
        ];

        // 添加用户代理信息（如果存在）
        if (detail.userAgent) {
            technicalItems.push({
                key: 'userAgent',
                title: '用户代理',
                icon: <IconPulse size="small"/>,
                content: (
                    <Text
                        copyable
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
                )
            });
        }

        // 添加计费数据（如果存在）
        if (detail.billingData) {
            technicalItems.push({
                key: 'billing',
                title: '计费数据',
                icon: <IconCode size="small"/>,
                content: formatBillingData(detail.billingData)
            });
        }

        return (
            <Card
                title={
                    <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                        <IconServer size="small"/>
                        <Text strong>技术详情</Text>
                        <Text type="tertiary" size="small">({technicalItems.length} 项)</Text>
                    </div>
                }
                style={{marginBottom: '16px'}}
                bodyStyle={{padding: '16px'}}
            >
                <div style={{display: 'flex', flexDirection: 'column', gap: '24px'}}>
                    {technicalItems.map(item => (
                        <div key={item.key}>
                            <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px'}}>
                                {item.icon}
                                <Text strong style={{color: 'var(--semi-color-text-0)'}}>
                                    {item.title}
                                </Text>
                            </div>
                            {item.content}
                        </div>
                    ))}
                </div>
            </Card>
        );
    };

    return (
        <SideSheet
            title="交易详情"
            visible={visible}
            onCancel={handleClose}
            width={800}
            bodyStyle={{
                padding: 0,
            }}
        >
            <div style={{
                height: '100%',
                overflow: 'auto',
                padding: '16px',
                scrollbarWidth: 'none'
            }}>
                {renderBusinessIdHeader()}
                {renderBasicInfoCard()}
                {renderTechnicalDetails()}
            </div>
        </SideSheet>
    );
};

export default TransactionDetailSideSheet;
