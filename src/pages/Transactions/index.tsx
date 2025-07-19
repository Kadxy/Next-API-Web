import {FC, useEffect, useMemo, useState} from 'react';
import {Button, Card, Empty, Pagination, Select, Space, Table, Tag, Toast, Typography} from '@douyinfe/semi-ui';
import {IconCreditCard, IconMore, IconRefresh} from '@douyinfe/semi-icons';
import {ColumnProps} from '@douyinfe/semi-ui/lib/es/table/interface';
import {TransactionRecordData} from '../../api/generated';
import {getServerApi, handleResponse} from '../../api/utils';
import {getWalletsOption} from '../../api/utils/wallets-option';
import {formatCredit, getDayjsFormat, getErrorMsg} from '../../utils';
import TransactionFilters from './TransactionFilters';
import TransactionDetailSideSheet from './TransactionDetailSideSheet';

const {Title, Text} = Typography;

// 交易类型映射
const TRANSACTION_TYPE_MAP = {
    RECHARGE: {text: '充值', color: 'green'},
    REDEMPTION: {text: '兑换', color: 'blue'},
    CONSUME: {text: '消费', color: 'orange'},
    REFUND: {text: '退款', color: 'cyan'},
    ADJUSTMENT: {text: '调整', color: 'purple'},
    SUBSCRIPTION: {text: '订阅', color: 'indigo'},
    OTHER: {text: '其他', color: 'grey'}
} as const;

// 交易状态映射
const TRANSACTION_STATUS_MAP = {
    PENDING: {text: '待处理', color: 'amber'},
    PROCESSING: {text: '处理中', color: 'blue'},
    COMPLETED: {text: '已完成', color: 'green'},
    FAILED: {text: '失败', color: 'red'},
    CANCELLED: {text: '已取消', color: 'grey'}
} as const;

interface TransactionQueryParams {
    page?: number;
    pageSize?: number;
    startDate?: string;
    endDate?: string;
    type?: 'RECHARGE' | 'REDEMPTION' | 'CONSUME' | 'REFUND' | 'ADJUSTMENT' | 'SUBSCRIPTION' | 'OTHER';
    status?: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
    userId?: number;
}

const Transactions: FC = () => {
    const [transactions, setTransactions] = useState<TransactionRecordData[]>([]);
    const [loading, setLoading] = useState(false);
    const [walletOptions, setWalletOptions] = useState<{ label: string; value: string }[]>([]);
    const [selectedWallet, setSelectedWallet] = useState<string>('self');
    const [detailVisible, setDetailVisible] = useState(false);
    const [selectedBusinessId, setSelectedBusinessId] = useState<string>('');

    // 分页状态
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 20,
        total: 0,
        totalPages: 0
    });

    // 筛选参数
    const [filters, setFilters] = useState<TransactionQueryParams>({});

    // 钱包选项（包含"我的交易"）
    const walletSelectOptions = useMemo(() => {
        return [
            {label: '我的交易', value: 'self'},
            ...walletOptions
        ];
    }, [walletOptions]);

    // 获取钱包列表
    const fetchWallets = async () => {
        try {
            const options = await getWalletsOption((msg) => {
                Toast.error(`获取钱包列表失败: ${msg}`);
            });
            setWalletOptions(options);
        } catch (error) {
            console.error('获取钱包列表失败:', error);
        }
    };

    // 获取交易记录
    const fetchTransactions = async (params?: Partial<TransactionQueryParams>) => {
        setLoading(true);
        try {
            const queryParams = {
                page: pagination.current,
                pageSize: pagination.pageSize,
                ...filters,
                ...params
            };

            // 移除空值
            Object.keys(queryParams).forEach(key => {
                if (queryParams[key as keyof typeof queryParams] === undefined ||
                    queryParams[key as keyof typeof queryParams] === '') {
                    delete queryParams[key as keyof typeof queryParams];
                }
            });

            const isWalletView = selectedWallet !== 'self';
            const apiCall = isWalletView
                ? getServerApi().transaction.transactionControllerGetWalletTransactions({
                    walletUid: selectedWallet,
                    ...queryParams
                })
                : getServerApi().transaction.transactionControllerGetSelfTransactions(queryParams);

            await handleResponse(apiCall, {
                onSuccess: (data) => {
                    setTransactions(data.records);
                    setPagination(prev => ({
                        ...prev,
                        total: data.total,
                        totalPages: data.totalPages,
                        current: data.page,
                        pageSize: data.pageSize
                    }));
                },
                onError: (errorMsg) => {
                    Toast.error({content: errorMsg});
                }
            });
        } catch (error) {
            Toast.error({content: getErrorMsg(error, '获取交易记录失败')});
        } finally {
            setLoading(false);
        }
    };

    // 处理筛选
    const handleFilter = (newFilters: TransactionQueryParams) => {
        setFilters(newFilters);
        setPagination(prev => ({...prev, current: 1}));
        fetchTransactions({...newFilters, page: 1});
    };

    // 处理分页
    const handlePageChange = (page: number, pageSize?: number) => {
        const newPagination = {
            ...pagination,
            current: page,
            ...(pageSize && {pageSize})
        };
        setPagination(newPagination);
        fetchTransactions({page, pageSize});
    };

    // 处理钱包切换
    const handleWalletChange = (walletUid: string) => {
        setSelectedWallet(walletUid);
        setFilters({});
        setPagination(prev => ({...prev, current: 1}));
        // 延迟执行以确保状态更新
        setTimeout(() => {
            fetchTransactions({page: 1});
        }, 0);
    };

    // 查看详情
    const handleViewDetail = (businessId: string) => {
        setSelectedBusinessId(businessId);
        setDetailVisible(true);
    };

    // 刷新数据
    const handleRefresh = () => {
        fetchTransactions();
    };

    useEffect(() => {
        fetchWallets();
    }, []);

    useEffect(() => {
        if (walletOptions.length > 0 || selectedWallet === 'self') {
            fetchTransactions();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedWallet, walletOptions.length]);

    // 表格列定义
    const columns: ColumnProps<TransactionRecordData>[] = [
        {
            title: '业务ID',
            dataIndex: 'businessId',
            key: 'businessId',
            width: '15%',
            render: (text: string) => (
                <Text style={{fontFamily: 'monospace', fontSize: '12px'}}>
                    {text.slice(0, 8)}...{text.slice(-8)}
                </Text>
            )
        },
        {
            title: '类型',
            dataIndex: 'type',
            key: 'type',
            width: '10%',
            align: 'center',
            render: (type: keyof typeof TRANSACTION_TYPE_MAP) => {
                const config = TRANSACTION_TYPE_MAP[type];
                return (
                    <Tag color={config.color} size="small">
                        {config.text}
                    </Tag>
                );
            }
        },
        {
            title: '金额',
            dataIndex: 'amount',
            key: 'amount',
            width: '12%',
            align: 'right',
            render: (amount: Record<string, unknown>) => {
                // 处理 Prisma Decimal 类型
                const amountStr = typeof amount === 'object' && amount !== null
                    ? String(amount)
                    : String(amount || '0');
                return formatCredit(amountStr);
            }
        },
        {
            title: '描述',
            dataIndex: 'description',
            key: 'description',
            width: '25%',
            render: (text: string) => (
                <Text ellipsis={{showTooltip: true}} style={{maxWidth: 200}}>
                    {text}
                </Text>
            )
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            width: '10%',
            align: 'center',
            render: (status: keyof typeof TRANSACTION_STATUS_MAP) => {
                const config = TRANSACTION_STATUS_MAP[status];
                return (
                    <Tag color={config.color} size="small">
                        {config.text}
                    </Tag>
                );
            }
        },
        {
            title: '创建时间',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: '15%',
            render: (text: string) => getDayjsFormat(text, 'YYYY-MM-DD HH:mm')
        },
        {
            title: '操作',
            key: 'actions',
            width: '8%',
            align: 'center',
            render: (_: unknown, record: TransactionRecordData) => (
                <Button
                    icon={<IconMore/>}
                    theme="borderless"
                    size="small"
                    onClick={() => handleViewDetail(record.businessId)}
                >
                    详情
                </Button>
            )
        }
    ];

    return (
        <>
            <Card
                title={<Title heading={3}>交易记录</Title>}
                style={{
                    width: '100%',
                    height: '100%',
                    overflow: 'auto',
                    scrollbarWidth: 'none',
                }}
                bordered={false}
                headerExtraContent={
                    <Space>
                        <Button
                            icon={<IconRefresh/>}
                            onClick={handleRefresh}
                            loading={loading}
                        >
                            刷新
                        </Button>
                    </Space>
                }
            >
                <Space vertical spacing="medium" style={{width: '100%'}}>
                    {/* 钱包选择器 */}
                    <Space vertical align="start">
                        <Text type="secondary" strong>查看范围</Text>
                        <Select
                            value={selectedWallet}
                            onChange={(value) => handleWalletChange(value as string)}
                            style={{width: 240}}
                            optionList={walletSelectOptions}
                            prefix={<IconCreditCard/>}
                        />
                    </Space>

                    {/* 筛选器 */}
                    <TransactionFilters
                        onFilter={handleFilter}
                        loading={loading}
                        showUserFilter={selectedWallet !== 'self'}
                    />

                    {/* 表格 */}
                    <Table
                        columns={columns}
                        dataSource={transactions}
                        loading={loading}
                        rowKey="businessId"
                        pagination={false}
                        empty={
                            !loading && transactions.length === 0 && (
                                <Empty
                                    image={<IconCreditCard size="extra-large"/>}
                                    title="暂无交易记录"
                                    description="当前条件下没有找到交易记录"
                                />
                            )
                        }
                    />

                    {/* 分页 */}
                    {pagination.total > 0 && (
                        <div style={{display: 'flex', justifyContent: 'center', marginTop: 16}}>
                            <Pagination
                                currentPage={pagination.current}
                                total={pagination.total}
                                pageSize={pagination.pageSize}
                                pageSizeOpts={[10, 20, 50, 100]}
                                showSizeChanger
                                showQuickJumper
                                showTotal
                                onChange={handlePageChange}
                            />
                        </div>
                    )}
                </Space>
            </Card>

            {/* 详情侧边栏 */}
            <TransactionDetailSideSheet
                visible={detailVisible}
                businessId={selectedBusinessId}
                onClose={() => setDetailVisible(false)}
            />
        </>
    );
};

export default Transactions;
