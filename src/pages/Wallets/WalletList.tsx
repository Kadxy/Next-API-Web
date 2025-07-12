import {FC, useEffect, useState} from 'react';
import {Button, Card, Modal, Space, Table, Toast, Typography} from '@douyinfe/semi-ui';
import {IconCreditCard, IconExit, IconSetting} from '@douyinfe/semi-icons';
import {ListWalletResponseItemData} from '../../api/generated';
import {getServerApi, handleResponse} from '../../api/utils';
import {formatCredit, getErrorMsg} from '../../utils';
import {ColumnProps} from '@douyinfe/semi-ui/lib/es/table/interface';
import {useNavigate} from 'react-router-dom';
import {Path} from '../../lib/constants/paths';

const {Text} = Typography;

const WalletList: FC = () => {
    const [wallets, setWallets] = useState<ListWalletResponseItemData[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // 获取钱包列表
    const fetchWallets = async () => {
        setLoading(true);
        try {
            await handleResponse(
                getServerApi().wallet.walletControllerGetWallets(),
                {
                    onSuccess: (data) => {
                        setWallets(data);
                    },
                    onError: (errorMsg) => {
                        Toast.error({content: errorMsg});
                    }
                }
            );
        } catch (error) {
            Toast.error({content: getErrorMsg(error, '获取钱包列表失败')});
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWallets().catch();
    }, []);

    // 查看钱包详情
    const handleViewDetail = (wallet: ListWalletResponseItemData) => {
        navigate(`${Path.WALLETS}/${wallet.uid}`);
    };

    // 退出钱包
    const handleLeaveWallet = async (walletUid: string, walletName: string) => {
        Modal.error({
            title: '退出钱包',
            content: `确定要退出钱包 "${walletName}" 吗？退出后您将无法访问此钱包，所有绑定到此钱包的资源将无法使用。`,
            onOk: async () => {
                try {
                    await handleResponse(
                        getServerApi().wallet.walletControllerLeaveWallet({walletUid}),
                        {
                            onSuccess: () => {
                                Toast.success({content: '退出成功'});
                                fetchWallets();
                            },
                            onError: (errorMsg) => {
                                Toast.error({content: errorMsg});
                            }
                        }
                    );
                } catch (error) {
                    Toast.error({content: getErrorMsg(error, '退出失败')});
                }
            },
            cancelButtonProps: {theme: 'borderless'},
            centered: true,
        });
    };

    // 表格列定义
    const columns: ColumnProps<ListWalletResponseItemData>[] = [
        {
            title: '名称',
            key: 'displayName',
            width: "25%",
            render: (_: unknown, record: ListWalletResponseItemData) => (
                <Space>
                    <IconCreditCard
                        style={{color: record.isOwner ? 'rgba(var(--semi-light-blue-5), 1)' : 'rgba(var(--semi-light-green-5), 1)'}}/>
                    <Text strong>{record.displayName}</Text>
                </Space>
            ),
        },
        {
            title: '所有者',
            key: 'owner',
            width: "15%",
            render: (_: unknown, record: ListWalletResponseItemData) => (
                <Text strong>{record.owner.displayName}</Text>
            ),
        },
        {
            title: '余额',
            dataIndex: 'balance',
            key: 'balance',
            width: "15%",
            align: 'right',
            render: (_: unknown, record: ListWalletResponseItemData) => formatCredit(record.balance)
        },
        {
            title: '已用额度',
            key: 'creditUsed',
            width: "15%",
            align: 'right',
            render: (_: unknown, record: ListWalletResponseItemData) => formatCredit(record.creditUsed)
        },
        {
            title: '额度限制',
            key: 'creditLimit',
            dataIndex: 'creditLimit',
            width: "15%",
            align: 'right',
            render: (_: unknown, record: ListWalletResponseItemData) => formatCredit(record.creditLimit)
        },
        {
            title: '操作',
            key: 'actions',
            width: "15%",
            align: 'center',
            render: (_: unknown, record: ListWalletResponseItemData) => (
                <Space>
                    {record.isOwner ? (
                        <Button
                            icon={<IconSetting/>}
                            onClick={() => handleViewDetail(record)}
                            theme="borderless"
                            type="primary"
                        >
                            管理
                        </Button>
                    ) : (
                        <>
                            <Button
                                icon={<IconExit/>}
                                onClick={() => handleLeaveWallet(record.uid, record.displayName)}
                                theme="borderless"
                                type="danger"
                            >
                                离开
                            </Button>
                        </>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <Card
            title={<Typography.Title heading={3}>钱包管理</Typography.Title>}
            style={{
                width: '100%',
                height: '100%',
                overflow: 'auto',
                scrollbarWidth: 'none',
            }}
            bordered={false}
        >
            <Table
                rowKey="uid"
                columns={columns}
                dataSource={wallets}
                loading={loading}
                pagination={false}
            />
        </Card>
    );
};

export default WalletList;
