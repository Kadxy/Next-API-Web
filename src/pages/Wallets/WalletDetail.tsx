import { FC, useEffect, useState } from 'react';
import {
    Avatar,
    Breadcrumb,
    Button,
    Card,
    Empty,
    Form,
    Input,
    Modal,
    Space,
    Spin,
    Switch,
    Table,
    Toast,
    Tooltip,
    Typography
} from '@douyinfe/semi-ui';
import {
    IconArrowLeft,
    IconClose,
    IconDelete,
    IconEdit,
    IconHelpCircle,
    IconPlus,
    IconRedo,
    IconRefresh,
    IconSpin,
    IconTick
} from '@douyinfe/semi-icons';
import {
    AddMemberDto,
    UpdateMemberDto,
    UpdateWalletDisplayNameDto,
    WalletDetailResponseItemData,
    WalletDetailResponseMemberItemData
} from '../../api/generated';
import { getServerApi, handleResponse } from '../../api/utils';
import { formatCredit, getDefaultAvatar, getErrorMsg } from '../../utils';
import { useNavigate } from 'react-router-dom';
import { Path } from '../../lib/constants/paths';
import { ColumnProps } from "@douyinfe/semi-ui/lib/es/table/interface";
import { IllustrationFailure, IllustrationFailureDark } from "@douyinfe/semi-illustrations";

const { Title, Text } = Typography;

interface WalletDetailProps {
    walletUid: string;
}

const WalletDetail: FC<WalletDetailProps> = ({ walletUid }) => {
    const [loading, setLoading] = useState(true);
    const [walletDetail, setWalletDetail] = useState<WalletDetailResponseItemData | null>(null);

    // add member
    const [addMemberModalVisible, setAddMemberModalVisible] = useState(false);
    const [isSubmittingAddMember, setIsSubmittingAddMember] = useState(false);

    // edit member
    const [editMemberModalVisible, setEditMemberModalVisible] = useState(false);
    const [editingMember, setEditingMember] = useState<WalletDetailResponseMemberItemData | null>(null);
    const [isSubmittingEditMember, setIsSubmittingEditMember] = useState(false);

    // edit wallet display name
    const [isEditingWalletName, setIsEditingWalletName] = useState(false);
    const [isSubmittingNewWalletName, setIsSubmittingNewWalletName] = useState(false);
    const [newWalletName, setNewWalletName] = useState('');

    // user uid search auto complete
    const [searchingUser, setSearchingUser] = useState<boolean>(false);
    const [searchUserOptions, setSearchUserOptions] = useState<{ label: string; value: string, avatar: string }[]>([]);

    const navigate = useNavigate();

    // 初始化加载钱包详情
    useEffect(() => {
        fetchWalletDetail().catch()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // 返回钱包列表
    const handleBackToList = () => navigate(Path.WALLETS);

    // 获取钱包详情
    const fetchWalletDetail = async () => {
        setLoading(true);
        try {
            await handleResponse(
                getServerApi().wallet.walletControllerGetWalletDetail({ walletUid }),
                {
                    onSuccess: setWalletDetail,
                    onError: (errorMsg) => {
                        Toast.error({ content: errorMsg });
                    }
                }
            );
        } catch (error) {
            Toast.error({ content: getErrorMsg(error, '获取钱包详情失败') });
        } finally {
            setLoading(false);
        }
    };

    // 编辑钱包名称
    const handleEditWalletName = async (action: 'start' | 'cancel' | 'save') => {
        switch (action) {
            case 'start':
                setNewWalletName(walletDetail?.displayName || '');
                setIsEditingWalletName(true);
                break;
            case 'cancel':
                setIsEditingWalletName(false);
                setNewWalletName('');
                break;
            case "save":
                if (!newWalletName.trim()) {
                    Toast.error({ content: '钱包名称不能为空' });
                    return;
                }

                if (newWalletName.trim() === walletDetail?.displayName) {
                    setIsEditingWalletName(false);
                    return;
                }

                setIsSubmittingNewWalletName(true);

                try {
                    const updateWalletDto: UpdateWalletDisplayNameDto = {
                        displayName: newWalletName.trim()
                    };

                    await handleResponse(
                        getServerApi().wallet.walletControllerUpdateWalletDisplayName({
                            walletUid,
                            requestBody: updateWalletDto
                        }),
                        {
                            onSuccess: () => {
                                Toast.success({ content: '钱包名称更新成功' });
                                setIsEditingWalletName(false);
                                fetchWalletDetail();
                            },
                            onError: (errorMsg) => {
                                Toast.error({ content: errorMsg });
                            }
                        }
                    );
                } catch (error) {
                    Toast.error({ content: getErrorMsg(error, '更新钱包名称失败') });
                } finally {
                    setIsSubmittingNewWalletName(false);
                }
                break;
        }
    }

    // 更新成员
    const handleUpdateMember = async (requestBody: UpdateMemberDto) => {
        if (!editingMember) {
            Toast.error({ content: '成员信息错误' });
            return;
        }

        setIsSubmittingEditMember(true);

        try {
            await handleResponse(
                getServerApi().wallet.walletControllerUpdateMember({
                    walletUid,
                    memberUid: editingMember.user.uid,
                    requestBody
                }),
                {
                    onSuccess: () => {
                        Toast.success({ content: '更新成员成功' });
                        setEditMemberModalVisible(false);
                        setEditingMember(null);
                        fetchWalletDetail();
                    },
                    onError: (errorMsg) => {
                        Toast.error({ content: errorMsg });
                    }
                }
            );
        } catch (error) {
            Toast.error({ content: getErrorMsg(error, '更新成员失败') });
        } finally {
            setIsSubmittingEditMember(false);
        }
    };

    // 移除成员
    const handleRemoveMember = async (member: WalletDetailResponseMemberItemData) => {
        Modal.warning({
            title: '移除成员',
            content: `确定要移除成员 "${member.user.displayName}" 吗？移除后该成员将无法访问此钱包，绑定到此钱包的资源将被禁用。`,
            onOk: async () => {
                await handleResponse(
                    getServerApi().wallet.walletControllerRemoveMember({
                        walletUid,
                        memberUid: member.user.uid
                    }),
                    {
                        onSuccess: () => {
                            Toast.success({ content: '移除成员成功' });
                            fetchWalletDetail();
                        },
                        onError: (errorMsg) => {
                            Toast.error({ content: errorMsg });
                        }
                    }
                );
            },
            cancelButtonProps: { theme: 'borderless' },
            centered: true,
        });
    };

    // 恢复成员
    const handleRestoreMember = async (member: WalletDetailResponseMemberItemData) => {
        Modal.warning({
            title: '恢复成员',
            content: `确定要恢复成员 "${member.user.displayName}" 的访问权限吗？这将重置该成员的已用额度和可用额度。`,
            onOk: async () => {
                await handleResponse(
                    getServerApi().wallet.walletControllerReactivateMember({ walletUid, memberUid: member.user.uid }),
                    {
                        onSuccess: () => {
                            Toast.success({ content: '添加成员成功' });
                            setAddMemberModalVisible(false);
                            fetchWalletDetail();
                        },
                        onError: (errorMsg) => {
                            Toast.error({ content: errorMsg });
                        }
                    }
                );
            },
            cancelButtonProps: { theme: 'borderless' },
            centered: true,
        });
    };

    // 重置成员已用额度
    const handleResetCreditUsage = async (member: WalletDetailResponseMemberItemData) => {
        Modal.warning({
            title: '重置已用额度',
            content: `确定要重置成员 "${member.user.displayName}" 的已用额度吗？此操作将清零该成员的已用额度。`,
            onOk: async () => {
                await handleResponse(
                    getServerApi().wallet.walletControllerResetCreditUsage({
                        walletUid,
                        memberUid: member.user.uid
                    }),
                    {
                        onSuccess: () => {
                            Toast.success({ content: '重置已用额度成功' });
                            fetchWalletDetail();
                        },
                        onError: (errorMsg) => {
                            Toast.error({ content: errorMsg });
                        }
                    }
                );
            },
            cancelButtonProps: { theme: 'borderless' },
            centered: true,
        });
    };

    // 关闭添加成员模态框
    const closeAddMemberModal = () => {
        if (isSubmittingAddMember) {
            return;
        }
        setAddMemberModalVisible(false);
        setIsSubmittingAddMember(false);
        setSearchUserOptions([]);
    };

    // 打开编辑成员模态框
    const openEditMemberModal = (member: WalletDetailResponseMemberItemData) => {
        setEditingMember(member);
        setEditMemberModalVisible(true);
    };

    // 关闭编辑成员模态框
    const closeEditMemberModal = () => {
        if (isSubmittingEditMember) {
            return;
        }
        setEditMemberModalVisible(false);
        setEditingMember(null);
        setIsSubmittingEditMember(false);
    };

    // 成员表格列定义
    const columns: ColumnProps<WalletDetailResponseMemberItemData>[] = [
        {
            title: '成员信息',
            key: 'member',
            width: '25%',
            render: (_: unknown, record: WalletDetailResponseMemberItemData) => {
                return (
                    <Space>
                        {record.user.avatar ?
                            <Avatar size="extra-extra-small" src={record.user.avatar} /> :
                            getDefaultAvatar(record.user.displayName, 'extra-extra-small')
                        }
                        <Text strong>
                            {record.user.displayName}
                            {record.alias.trim() && <Text type='tertiary'>&nbsp;({record.alias})</Text>}
                        </Text>
                    </Space>
                )
            }
        },
        {
            title: '额度限制',
            key: 'creditLimit',
            dataIndex: 'creditLimit',
            width: "15%",
            align: 'right',
            render: (_: unknown, record: WalletDetailResponseMemberItemData) => formatCredit(record.creditLimit, !record.isActive, true),
        },
        {
            title: '已用额度',
            key: 'creditUsed',
            width: "15%",
            align: 'right',
            render: (_: unknown, record: WalletDetailResponseMemberItemData) => formatCredit(record.creditUsed, !record.isActive)
        },
        {
            title: '剩余额度',
            key: 'creditRemain',
            width: "15%",
            align: 'right',
            render: (_: unknown, record: WalletDetailResponseMemberItemData) => formatCredit(String(Number(record.creditLimit) - Number(record.creditUsed)), !record.isActive)
        },
        {
            title: '操作',
            key: 'actions',
            width: '30%',
            align: 'right',
            render: (_: unknown, record: WalletDetailResponseMemberItemData) => {
                return (
                    <Space>
                        {record.isActive ? (
                            <>
                                <Button
                                    icon={<IconEdit />}
                                    onClick={() => openEditMemberModal(record)}
                                    theme="borderless"
                                >
                                    编辑
                                </Button>
                                <Button
                                    icon={<IconRefresh />}
                                    onClick={() => handleResetCreditUsage(record)}
                                    theme="borderless"
                                    type='warning'
                                >
                                    重置
                                </Button>
                                <Button
                                    icon={<IconDelete />}
                                    type="danger"
                                    theme="borderless"
                                    onClick={() => handleRemoveMember(record)}
                                >
                                    移除
                                </Button>
                            </>
                        ) : (
                            <Button
                                icon={<IconRedo />}
                                theme="borderless"
                                onClick={() => handleRestoreMember(record)}
                                type='tertiary'
                            >
                                恢复
                            </Button>
                        )}
                    </Space>
                )
            },
        },
    ];

    if (!loading && !walletDetail) {
        return (
            <Card style={{ width: '100%' }}>
                <Space align='center' vertical style={{ width: "100%" }} spacing='loose'>
                    <Empty
                        image={<IllustrationFailure style={{ width: 150, height: 150 }} />}
                        darkModeImage={<IllustrationFailureDark style={{ width: 150, height: 150 }} />}
                        title="钱包加载失败"
                        description={`钱包UID: ${walletUid}`}
                    />
                    <Button onClick={handleBackToList} icon={<IconArrowLeft />}>
                        返回钱包列表
                    </Button>
                </Space>
            </Card>
        )
    }

    return (
        <Spin spinning={loading} size='large'>
            <Breadcrumb>
                <Breadcrumb.Item onClick={handleBackToList}>
                    钱包管理
                </Breadcrumb.Item>
                <Breadcrumb.Item>
                    {walletDetail?.displayName || ''}
                </Breadcrumb.Item>
            </Breadcrumb>
            <Card
                title={
                    <Space>
                        {isEditingWalletName ? (
                            <>
                                <Input
                                    value={newWalletName}
                                    onChange={setNewWalletName}
                                    placeholder="请输入钱包名称"
                                />
                                {isSubmittingNewWalletName ? <IconSpin spin /> : (
                                    <>
                                        <IconTick
                                            style={{ cursor: 'pointer', color: 'var( --semi-color-success)' }}
                                            onClick={async () => await handleEditWalletName("save")}
                                        />
                                        <IconClose
                                            style={{ cursor: 'pointer', color: 'var( --semi-color-danger)' }}
                                            onClick={async () => await handleEditWalletName("cancel")}
                                        />
                                    </>
                                )}
                            </>
                        )
                            : (
                                <>
                                    <Title heading={4}>{walletDetail?.displayName || ''}</Title>
                                    <Text link={{ onClick: () => handleEditWalletName("start") }}>
                                        <IconEdit style={{ color: 'var(--semi-color-text-2)' }} />
                                    </Text>
                                </>
                            )}
                    </Space>
                }
                style={{
                    width: '100%',
                    height: '100%',
                    overflow: 'auto',
                    scrollbarWidth: 'none',
                }}
                bordered={false}
                headerExtraContent={
                    <Button
                        icon={<IconPlus />}
                        type="primary"
                        onClick={() => setAddMemberModalVisible(true)}
                    >
                        添加成员
                    </Button>
                }
            >
                <Table
                    rowKey="uid"
                    style={{ marginTop: 8 }}
                    columns={columns}
                    dataSource={walletDetail?.members || []}
                    pagination={false}
                    empty={!loading && (
                        <div style={{ padding: "32px 0" }}>
                            <Typography.Text type='tertiary'>
                                该钱包无成员，你可以
                                <Typography.Text
                                    link
                                    onClick={() => setAddMemberModalVisible(true)}
                                    type='primary'
                                    style={{ marginLeft: 4, cursor: 'pointer' }}
                                >
                                    添加成员
                                </Typography.Text>
                            </Typography.Text>
                        </div>)}
                />
            </Card>
            <Modal
                title="添加成员"
                visible={addMemberModalVisible}
                onCancel={closeAddMemberModal}
                width={400}
                footer={null}
                maskClosable={false}
                centered
            >
                <Form<AddMemberDto>
                    style={{ margin: '0 8px 24px 8px' }}
                    onSubmit={async (requestBody) => {
                        setIsSubmittingAddMember(true);
                        try {
                            await handleResponse(
                                getServerApi().wallet.walletControllerAddMember({ walletUid, requestBody }),
                                {
                                    onSuccess: () => {
                                        Toast.success({ content: '添加成员成功' });
                                        closeAddMemberModal();
                                        fetchWalletDetail();
                                    },
                                    onError: (errorMsg) => {
                                        Toast.error({ content: errorMsg });
                                    }
                                }
                            );
                        } catch (error) {
                            Toast.error({ content: getErrorMsg(error, '添加成员失败') });
                        } finally {
                            setIsSubmittingAddMember(false);
                        }
                    }}
                    initValues={{ creditLimit: 0, memberUid: '', alias: '' }}
                >
                    {({ formState, formApi }) => (
                        <>
                            <Form.AutoComplete
                                field='memberUid'
                                label={{
                                    text: '用户UID',
                                    extra: (
                                        <Tooltip content='可在个人中心查看'>
                                            <IconHelpCircle style={{ color: 'var(--semi-color-text-2)' }} />
                                        </Tooltip>
                                    )
                                }}
                                placeholder='请输入成员的UID'
                                data={searchUserOptions}
                                loading={searchingUser}
                                defaultActiveFirstOption
                                style={{ width: '100%' }}
                                onSearch={async (value) => {
                                    if (!value || value.length !== 32 + 4) {
                                        setSearchUserOptions([]);
                                        return;
                                    }
                                    setSearchingUser(true)
                                    await handleResponse(
                                        getServerApi().authentication.authControllerGetPublicUserInfo({ uid: value }),
                                        {
                                            onSuccess: (data) => {
                                                setSearchUserOptions([{
                                                    value: value,
                                                    label: data.displayName,
                                                    avatar: data.avatar
                                                }]);
                                                return;
                                            },
                                            onError: () => {
                                                setSearchUserOptions([]);
                                                return;
                                            },
                                            onFinally: () => {
                                                setSearchingUser(false);
                                            }
                                        }
                                    )
                                }}
                                // @ts-expect-error known ts error
                                renderItem={(option: { value: string; label: string; avatar: string }) => {
                                    return (
                                        <Space>
                                            {option.avatar ?
                                                <Avatar size="extra-extra-small" src={option.avatar} /> :
                                                getDefaultAvatar(option.label, 'extra-extra-small')
                                            }
                                            <Text strong>{option.label}</Text>
                                        </Space>
                                    )
                                }}
                                rules={[
                                    { required: true, message: '请输入用户UID' },
                                    { len: 36, message: 'UID长度必须为36位字符' }
                                ]}
                            />

                            <Form.Input
                                field='alias'
                                label='用户别名'
                                placeholder='为该成员设置一个易于识别的别名'
                                autoComplete={'off'}
                                rules={[
                                    { required: true, message: '请输入用户别名' },
                                    { min: 1, message: '别名不能为空' }
                                ]}
                                showClear
                            />
                            <Space style={{ width: '100%' }} spacing={'loose'}>
                                <Form.InputNumber
                                    field='creditLimit'
                                    label='额度限制'
                                    placeholder='成员最大消费额度'
                                    autoComplete={'off'}
                                    min={0}
                                    max={1000000}
                                    precision={2}
                                    hideButtons
                                    step={10}
                                    shiftStep={100}
                                    currency={'USD'}
                                    showCurrencySymbol={false}
                                    prefix={'$'}
                                    rules={[
                                        { required: true, message: '请输入额度限制' },
                                        { type: 'number', min: 0, message: '额度限制不能为负数' }
                                    ]}
                                    disabled={formState.values.creditLimit === 0}
                                />
                                <Form.Slot label={{ text: '无限额度' }}>
                                    <Switch
                                        checked={formState.values.creditLimit === 0}
                                        onChange={(checked) => {
                                            formApi.setValue('creditLimit', checked ? 0 : 100);
                                        }}
                                    />
                                </Form.Slot>
                            </Space>
                            <Space style={{ width: '100%', justifyContent: 'flex-end', marginTop: 16 }}>
                                <Button onClick={closeAddMemberModal}>
                                    取消
                                </Button>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={isSubmittingAddMember}
                                >
                                    添加成员
                                </Button>
                            </Space>

                        </>
                    )}
                </Form>
            </Modal>

            <Modal
                title="编辑成员"
                visible={editMemberModalVisible}
                onCancel={closeEditMemberModal}
                width={400}
                footer={null}
                maskClosable={false}
                centered
            >
                {editingMember && (
                    <Form<UpdateMemberDto>
                        style={{ margin: '0 8px 24px 8px' }}
                        initValues={{
                            alias: editingMember.alias,
                            creditLimit: parseFloat(editingMember.creditLimit)
                        }}
                        onSubmit={handleUpdateMember}
                    >
                        {({ formState, formApi }) => (
                            <>
                                <Form.Input
                                    field='alias'
                                    label='用户别名'
                                    placeholder='为该成员设置一个易于识别的别名'
                                    autoComplete={'off'}
                                    rules={[
                                        { required: true, message: '请输入用户别名' },
                                        { min: 1, message: '别名不能为空' }
                                    ]}
                                    showClear
                                />
                                <Space style={{ width: '100%' }} spacing={'loose'}>
                                    <Form.InputNumber
                                        field='creditLimit'
                                        label='额度限制'
                                        placeholder='成员最大消费额度'
                                        autoComplete={'off'}
                                        min={0}
                                        max={1000000}
                                        precision={2}
                                        hideButtons
                                        step={10}
                                        shiftStep={100}
                                        currency={'USD'}
                                        showCurrencySymbol={false}
                                        prefix={'$'}
                                        rules={[
                                            { required: true, message: '请输入额度限制' },
                                            { type: 'number', min: 0, message: '额度限制不能为负数' }
                                        ]}
                                        disabled={formState.values.creditLimit === 0}
                                    />
                                    <Form.Slot label={{ text: '无限额度' }}>
                                        <Switch
                                            checked={formState.values.creditLimit === 0}
                                            onChange={(checked) => {
                                                formApi.setValue('creditLimit', checked ? 0 : 100);
                                            }}
                                        />
                                    </Form.Slot>
                                </Space>
                                <Space style={{ width: '100%', justifyContent: 'flex-end', marginTop: 16 }}>
                                    <Button onClick={closeEditMemberModal}>
                                        取消
                                    </Button>
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        loading={isSubmittingEditMember}
                                    >
                                        保存修改
                                    </Button>
                                </Space>
                            </>
                        )}
                    </Form>
                )}
            </Modal>
        </Spin>
    );
};

export default WalletDetail;
