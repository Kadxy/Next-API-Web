import { FC, useEffect, useMemo, useState } from 'react';
import { Avatar, Button, Card, Empty, Space, Table, Tag, Toast, Typography } from '@douyinfe/semi-ui';
import { IconMore } from '@douyinfe/semi-icons';
import { ColumnProps } from '@douyinfe/semi-ui/lib/es/table/interface';
import {
    CancelablePromise,
    ListWalletResponseItemData,
    SelfTransactionListResponseDto,
    SelfTransactionRecordData,
    WalletOwnerTransactionRecordData,
    WalletTransactionListResponseDto
} from '../../api/generated';
import { getServerApi, handleResponse } from '../../api/utils';
import { getDefaultAvatar, getErrorMsg } from '../../utils';
import TransactionFilters from './TransactionFilters';
import TransactionDetailSideSheet from './TransactionDetailSideSheet';
import { IllustrationConstruction, IllustrationConstructionDark } from "@douyinfe/semi-illustrations";
import {
    DEFAULT_PAGINATION_STATE,
    DEFAULT_TRANSACTION_QUERY_PARAMS,
    MY_WALLET_UID,
    TRANSACTION_STATUS_MAP,
    TRANSACTION_TYPE_MAP,
    TransactionQueryParams
} from "./transaction.constant.ts";
import dayjs from 'dayjs';

const { Title, Text } = Typography;

type TransactionRecord = SelfTransactionRecordData | WalletOwnerTransactionRecordData;

const Transactions: FC = () => {
    // 是否正在获取交易记录
    const [fetching, setFetching] = useState(false);

    // 交易记录列表
    const [transactions, setTransactions] = useState<TransactionRecord[]>([]);

    // 钱包列表
    const [wallets, setWallets] = useState<ListWalletResponseItemData[]>([]);

    // 筛选条件状态
    const [filters, setFilters] = useState(DEFAULT_TRANSACTION_QUERY_PARAMS);

    // 分页状态
    const [pagination, setPagination] = useState(DEFAULT_PAGINATION_STATE);

    // 当前选择的交易记录(用于查看详情)
    const [selectedRecord, setSelectedRecord] = useState<TransactionRecord | null>(null);

    // 加载数据
    useEffect(() => {
        fetchTransactions(filters, pagination).catch();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // 加载钱包
    useEffect(() => {
        const fetchWallets = async () => {
            try {
                await handleResponse(getServerApi().wallet.walletControllerGetWallets(), {
                    onSuccess: setWallets,
                    onError: (msg) => {
                        Toast.error({ content: msg });
                    }
                });
            } catch (error) {
                console.error('获取钱包列表失败:', error);
            }
        };

        fetchWallets().catch();
    }, []);

    // 是否为钱包视图
    const isWalletView = useMemo(() => {
        return filters.walletUid !== MY_WALLET_UID;
    }, [filters.walletUid]);

    // 当前选择的钱包信息
    const currentWalletInfo = useMemo(() => {
        return wallets.find(w => w.uid === filters.walletUid);
    }, [wallets, filters.walletUid]);

    const fetchTransactions = async (filters: TransactionQueryParams, pagination: {
        current: number,
        pageSize: number
    }) => {
        if (!filters.walletUid) {
            return;
        }

        // 格式化查询参数
        const _formatQueryParams = (filters: TransactionQueryParams) => {
            const queryParams = {
                page: pagination.current,
                pageSize: pagination.pageSize,
                ...filters,
            };

            Object.keys(queryParams).forEach(key => {
                if (queryParams[key as keyof typeof queryParams] === undefined ||
                    queryParams[key as keyof typeof queryParams] === '') {
                    delete queryParams[key as keyof typeof queryParams];
                }
            });

            return queryParams;
        };

        // 设置加载状态
        setFetching(true);
        try {
            const queryParams = _formatQueryParams(filters);
            const service = getServerApi().transaction;
            const controller = filters.walletUid !== MY_WALLET_UID ?
                // @ts-expect-error when isWalletView, walletUid is defined!
                service.transactionControllerGetWalletTransactions(queryParams) :
                service.transactionControllerGetSelfTransactions(queryParams);

            await handleResponse(
                controller as CancelablePromise<SelfTransactionListResponseDto | WalletTransactionListResponseDto>,
                {
                    onSuccess: (data) => {
                        setTransactions(data.records);
                        setPagination({
                            total: data.total,
                            totalPages: data.totalPages,
                            current: data.page,
                            pageSize: data.pageSize
                        });
                    },
                    onError: (errorMsg) => {
                        Toast.error({ content: errorMsg });
                    }
                }
            );
        } catch (error) {
            Toast.error({ content: getErrorMsg(error, '获取交易记录失败') });
        } finally {
            setFetching(false);
        }
    };

    // 表格列定义
    const columns: ColumnProps<TransactionRecord>[] = [
        {
            title: '时间',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: '180px',
            render: (text: string) => dayjs(text).format('YYYY-MM-DD HH:mm:ss')
        },
        // 钱包视图下显示用户信息（仅钱包所有者可见）
        ...(isWalletView && currentWalletInfo?.isOwner ? [{
            title: '用户',
            key: 'user',
            width: '150px',
            render: (_: unknown, record: TransactionRecord) => {
                if (!('user' in record)) {
                    return null;
                }

                const { user } = record;

                return (
                    <Space>
                        {user.avatar ?
                            <Avatar size="extra-small" src={user.avatar} /> :
                            getDefaultAvatar(user.displayName, 'extra-small')
                        }
                        <Text style={{ fontSize: '12px' }}>
                            {user.displayName}
                        </Text>
                    </Space>
                );
            }
        }] : []),
        {
            title: '类型',
            dataIndex: 'type',
            key: 'type',
            width: '100px',
            align: 'center',
            render: (type: keyof typeof TRANSACTION_TYPE_MAP) => {
                const { color, text } = TRANSACTION_TYPE_MAP[type];
                return (
                    <Tag color={color}>{text}</Tag>
                );
            }
        },
        {
            title: '金额',
            dataIndex: 'amount',
            key: 'amount',
            width: '120px',
            render: (amount: unknown) => {
                if (!amount || typeof amount !== "string") {
                    return '-';
                }

                const numericAmount = Number(amount);

                if (!Number.isFinite(numericAmount) || isNaN(numericAmount)) {
                    return '-';
                }

                return `$${Math.abs(numericAmount).toFixed(6)}`
            }
        },
        {
            title: '描述',
            dataIndex: 'description',
            key: 'description',
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            width: '100px',
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
            title: '操作',
            key: 'actions',
            width: '120px',
            align: 'center',
            render: (_: unknown, record: TransactionRecord) => (
                <Button
                    icon={<IconMore />}
                    theme="borderless"
                    size="small"
                    onClick={() => setSelectedRecord(record)}
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
                headerLine={false}
            >
                <Space vertical spacing="medium" style={{ width: '100%' }}>
                    {/* 筛选器 */}
                    <TransactionFilters
                        fetching={fetching}
                        isWalletOwnerView={currentWalletInfo?.isOwner || false}
                        wallets={wallets}
                        filters={filters}
                        setFilters={setFilters}
                        onSearch={async (newFilters) => {
                            const newPagination = { ...pagination, current: 1 };
                            setPagination(newPagination);
                            await fetchTransactions(newFilters, newPagination);
                        }}
                    />

                    {/* 表格 */}
                    <Table
                        columns={columns}
                        dataSource={transactions}
                        loading={fetching}
                        rowKey="businessId"
                        size="middle"
                        pagination={{
                            currentPage: pagination.current,
                            total: pagination.total,
                            pageSize: pagination.pageSize,
                            pageSizeOpts: [10, 20, 50, 100],
                            showSizeChanger: true,
                            showQuickJumper: true,
                            showTotal: true,
                            popoverPosition: "top",
                            onChange: async (page, pageSize) => {
                                const newPagination = { ...pagination, current: page, pageSize };
                                setPagination(newPagination);
                                await fetchTransactions(filters, newPagination);
                            }
                        }}
                        empty={
                            !fetching && transactions.length === 0 && (
                                <Empty
                                    image={<IllustrationConstruction style={{ width: 150, height: 150 }} />}
                                    darkModeImage={<IllustrationConstructionDark style={{ width: 150, height: 150 }} />}
                                    title="暂无交易记录"
                                    description="当前条件下没有找到交易记录"
                                    style={{ padding: 32 }}
                                />
                            )
                        }
                    />
                </Space>
            </Card>

            {/* 详情侧边栏 */}
            <TransactionDetailSideSheet
                visible={!!selectedRecord}
                record={selectedRecord}
                onClose={() => setSelectedRecord(null)}
            />
        </>
    );
};

export default Transactions;
