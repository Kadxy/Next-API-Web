import { FC, useEffect, useRef, useState, useMemo } from 'react';
import {
    Card,
    Typography,
    Button,
    Table,
    Space,
    Modal,
    Toast,
    Input,
    Select,
} from '@douyinfe/semi-ui';
import { IconEdit, IconDelete } from '@douyinfe/semi-icons';
import { ListApiKeyResponseItemData } from '../api/generated';
import { getServerApi } from '../api/utils';
import dayjs from 'dayjs';
import { getErrorMsg } from '../utils';
import { ColumnProps } from '@douyinfe/semi-ui/lib/es/table/interface';
import { getWalletsOption } from '../api/utils/wallets-option';

const CREATE_SUCCESS_MESSAGE = '请将此 API key 保存在安全且易于访问的地方。您的 API key 不会以明文形式储存，因此你将无法再次查看它。';
const DELETE_CONFIRM_MESSAGE = '该 API key 将立即被禁用。使用此密钥发出的 API 请求将被拒绝，这可能会导致仍然依赖它的任何系统崩溃。 一旦删除，你将无法再查看或修改此 API key。';

interface ApiKeyModalProps {
    visible: boolean;
    onClose: (shouldFetch: boolean) => Promise<void>;
    onRefresh: () => Promise<void>;
}

interface EditApiKeyModalProps extends ApiKeyModalProps {
    hashKey: string;
    currentName: string;
}

const CreateApiKeyModal: FC<ApiKeyModalProps> = ({ visible, onClose, onRefresh }) => {
    const [rawKey, setRawKey] = useState<string>('');
    const [displayName, setDisplayName] = useState<string>('');
    const [walletUid, setWalletUid] = useState<string>('');
    const [creating, setCreating] = useState<boolean>(false);
    const [walletsOption, setWalletsOption] = useState<{ label: string; value: string }[]>([]);

    useEffect(() => {
        getWalletsOption()
            .then(setWalletsOption)
            .catch((msg) => Toast.error({ content: msg, stack: true }));
    }, []);

    const handleCreateApiKey = async () => {
        try {
            setCreating(true);
            const { success, data, msg } = await getServerApi().apikey.apikeyControllerCreateApiKey({
                requestBody: { displayName, walletUid }
            });
            if (!success) {
                throw new Error(msg);
            }
            setRawKey(data.rawKey);
            Toast.success('API key 已创建');
            await onRefresh();
        } catch (error) {
            if (error instanceof Error) {
                Toast.error(getErrorMsg(error, '创建失败'));
            }
        } finally {
            setCreating(false);
        };
    }

    const handleCopyApiKey = () => {
        navigator.clipboard.writeText(rawKey)
            .then(() => Toast.success({ content: '复制成功', stack: true }))
            .catch(() => Toast.error({ content: '复制失败，请手动复制', stack: true }));
    }

    const SuccessComponent = () => {
        return (
            <Space vertical align='end'>
                <Typography.Text>
                    {CREATE_SUCCESS_MESSAGE}
                </Typography.Text>

                <Space style={{ width: '100%' }}>
                    <Input
                        value={rawKey}
                        onFocus={(e) => e.target.select()}
                        readOnly
                    />
                </Space>
            </Space>
        )
    }

    const isSuccess = !!rawKey;

    return (
        <Modal
            title={isSuccess ? 'API key 已创建' : '创建 API key'}
            visible={visible}
            onCancel={() => onClose(false)}
            centered
            {...(isSuccess ?
                {
                    okText: "复制",
                    onOk: () => handleCopyApiKey(),
                    cancelText: "关闭",
                    cancelButtonProps: {
                        theme: 'borderless'
                    },
                    width: 500,
                    maskClosable: false,
                    closeOnEsc: false,
                    closable: false,
                } :
                {
                    footer: false,
                }
            )}
            afterClose={() => {
                setRawKey('');
                setDisplayName('');
            }}
        >
            {rawKey ? <SuccessComponent /> : (
                <Space
                    vertical
                    style={{
                        width: '100%',
                        margin: '0px 0px 20px 0px',
                    }}
                    spacing='medium'
                    align='end'
                >
                    <Input
                        placeholder="输入 API key 名称"
                        value={displayName}
                        onChange={(value) => setDisplayName(value)}
                        style={{ width: '100%' }}
                        autoFocus
                    />
                    <Select
                        placeholder="选择钱包"
                        value={walletUid}
                        onChange={(value) => setWalletUid(value as string)}
                        optionList={walletsOption}
                        style={{ width: '100%' }}
                        showClear
                    />
                    <Button
                        theme='solid'
                        loading={creating}
                        disabled={!displayName || !walletUid}
                        onClick={handleCreateApiKey}
                    >
                        创建
                    </Button>
                </Space>
            )}
        </Modal>
    )
}

const EditApiKeyModal: FC<EditApiKeyModalProps> = ({ visible, onClose, hashKey, currentName }) => {
    const [updating, setUpdating] = useState<boolean>(false);
    const [newDisplayName, setNewDisplayName] = useState<string>(currentName);

    const handleUpdateApiKey = async (newDisplayName: string) => {
        try {
            setUpdating(true);
            const { success, msg } = await getServerApi().apikey.apikeyControllerUpdateApiKeyDisplayName({
                hashKey,
                requestBody: { displayName: newDisplayName }
            });
            if (!success) {
                throw new Error(msg);
            }
            Toast.success('更新成功');
            await onClose(true);
        } catch (error) {
            if (error instanceof Error) {
                Toast.error(getErrorMsg(error, '更新失败'));
            }
        } finally {
            setUpdating(false);
        }
    };

    useEffect(() => {
        if (visible) {
            setNewDisplayName(currentName);
        }
    }, [currentName, visible]);

    return (
        <Modal
            title="编辑 API key"
            visible={visible}
            onOk={() => handleUpdateApiKey(newDisplayName)}
            onCancel={() => onClose(false)}
            okText='更新'
            cancelText='取消'
            confirmLoading={updating}
            centered
            cancelButtonProps={{ theme: 'borderless' }}
        >
            <Input
                placeholder="输入 API key 的名称"
                value={newDisplayName}
                onChange={(value) => setNewDisplayName(value)}
                autoFocus
            />
        </Modal>
    )
}
const ApiKeys: FC = () => {
    // User API Keys
    const [apiKeys, setApiKeys] = useState<ListApiKeyResponseItemData[]>([]);

    // Fetch API Keys
    const [loading, setLoading] = useState<boolean>(false);

    // Create API Key Modal 
    const [showCreateModal, setShowCreateModal] = useState<boolean>(false);

    // Edit API Key Modal
    const [showEditModal, setShowEditModal] = useState<boolean>(false);
    const [editModalHashKey, setEditModalHashKey] = useState<string>('');
    const [editModalCurrentName, setEditModalCurrentName] = useState<string>('');

    // 筛选
    const [searchText, setSearchText] = useState<string>('');
    const compositionRef = useRef({ isComposition: false });

    // 获取API服务
    const api = getServerApi();

    // 过滤数据
    const filteredApiKeys = useMemo(() => {
        if (!searchText) return apiKeys;
        return apiKeys.filter(item =>
            item.displayName && item.displayName.includes(searchText)
        );
    }, [apiKeys, searchText]);

    // 加载API key列表
    const fetchApiKeys = async () => {
        setLoading(true);
        try {
            const { success, data, msg } = await api.apikey.apikeyControllerGetApiKeys();
            if (!success) {
                throw new Error(msg);
            }
            setApiKeys(data);
        } catch (error) {
            Toast.error(getErrorMsg(error, '获取 API key失败'));
        } finally {
            setLoading(false);
        }
    };

    // 删除API key
    const handleDeleteApiKey = async (hashKey: string) => {
        Modal.error({
            title: '删除 API key',
            content: DELETE_CONFIRM_MESSAGE,
            onOk: async () => {
                try {
                    const { success, msg } = await api.apikey.apikeyControllerDeleteApiKey({ hashKey });
                    if (!success) {
                        throw new Error(msg);
                    }
                    await fetchApiKeys();
                    Toast.success('删除成功');
                } catch (error) {
                    Toast.error(getErrorMsg(error, '删除失败'));
                }
            },
            cancelButtonProps: { theme: 'borderless' },
            centered: true,
        });
    };

    // 初始化加载
    useEffect(() => {
        fetchApiKeys();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // 表格列配置
    const columns: ColumnProps<ListApiKeyResponseItemData>[] = [
        {
            title: (
                <Space>
                    <span style={{ whiteSpace: 'nowrap' }}>名称</span>
                    <Input
                        placeholder="输入名称"
                        style={{ width: 160 }}
                        onCompositionStart={() => compositionRef.current.isComposition = true}
                        onCompositionEnd={(event) => {
                            compositionRef.current.isComposition = false;
                            const value = event.currentTarget.value;
                            setSearchText(value);
                        }}
                        onChange={(value) => {
                            if (compositionRef.current.isComposition) {
                                return;
                            }
                            setSearchText(value);
                        }}
                        showClear
                    />
                </Space>
            ),
            dataIndex: 'displayName',
            key: 'displayName',
            width: "27.5%",
            ellipsis: true,
        },
        {
            title: '绑定钱包',
            key: 'wallet.displayName',
            dataIndex: 'wallet.displayName',
            width: "20%",
        },
        {
            title: 'Key',
            dataIndex: 'preview',
            key: 'preview',
            render: (text: string) => {
                const rawKeyPreview = `sk-${text.slice(0, 4)}*****${text.slice(-4)}`;
                return <Typography.Text style={{ letterSpacing: '0.5px' }}>{rawKeyPreview}</Typography.Text>
            },
            width: "20%",
        },
        {
            title: '创建日期',
            dataIndex: 'createdAt',
            key: 'createdAt',
            sorter: (a, b) => dayjs(a?.createdAt ?? 0).diff(dayjs(b?.createdAt ?? 0)),
            render: (text: string) => dayjs(text).format('YYYY-MM-DD HH:mm:ss'),
            width: "20%",
        },
        {
            title: '上次使用',
            dataIndex: 'lastUsedAt',
            key: 'lastUsedAt',
            sorter: (a, b) => dayjs(a?.lastUsedAt ?? 0).diff(dayjs(b?.lastUsedAt ?? 0)),
            render: (text: string) => text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '-',
            width: "20%",
        },
        {
            title: '操作',
            key: 'action',
            render: (_: unknown, record: ListApiKeyResponseItemData) => (
                <Space>
                    <Button
                        icon={<IconEdit />}
                        type="tertiary"
                        theme='borderless'
                        onClick={() => {
                            setEditModalHashKey(record.hashKey);
                            setEditModalCurrentName(record.displayName);
                            setShowEditModal(true);
                        }}
                        aria-label='编辑 API key'
                    />
                    <Button
                        icon={<IconDelete />}
                        type="danger"
                        theme="borderless"
                        onClick={() => handleDeleteApiKey(record.hashKey)}
                        aria-label='删除 API key'
                    />
                </Space>
            ),
            width: "12.5%",
        },
    ];

    return (
        <Card
            title={<Typography.Title heading={3}>API keys</Typography.Title>}
            style={{
                width: '100%',
                height: '100%',
                overflow: 'auto',
                scrollbarWidth: 'none',
            }}
            bordered={false}
            headerExtraContent={
                <Button
                    onClick={() => setShowCreateModal(true)}
                    style={{ margin: '-10px 0' }}
                >
                    创建 API key
                </Button>
            }
        >
            <Table
                columns={columns}
                dataSource={filteredApiKeys}
                loading={loading}
                empty={!loading && (
                    <div style={{ padding: "32px 0" }}>
                        <Typography.Text type='tertiary'>
                            {apiKeys.length === 0 ? (
                                <>
                                    暂无 API key，你可以
                                    <Typography.Text
                                        link
                                        onClick={() => setShowCreateModal(true)}
                                        type='tertiary'
                                        style={{ marginLeft: 1 }}
                                    >
                                        创建一个
                                    </Typography.Text>
                                </>
                            ) : '暂无符合条件的 API key'}
                        </Typography.Text>
                    </div>)}
            />
            <CreateApiKeyModal
                visible={showCreateModal}
                onClose={async (shouldFetch) => {
                    if (shouldFetch) {
                        await fetchApiKeys();
                    }
                    setShowCreateModal(false)
                }}
                onRefresh={fetchApiKeys}
            />
            <EditApiKeyModal
                visible={showEditModal}
                onClose={async (shouldFetch) => {
                    if (shouldFetch) {
                        await fetchApiKeys();
                    }
                    setShowEditModal(false)
                }}
                onRefresh={fetchApiKeys}
                hashKey={editModalHashKey}
                currentName={editModalCurrentName}
            />
        </Card>
    );
};

export default ApiKeys; 