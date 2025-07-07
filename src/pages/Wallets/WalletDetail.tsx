import {FC, useEffect, useState} from 'react';
import {
    Button,
    Card,
    Empty,
    Form,
    Input,
    InputNumber,
    Modal,
    Popover,
    Space,
    Table,
    Toast,
    Typography
} from '@douyinfe/semi-ui';
import {
    IconArrowLeft,
    IconClose,
    IconDelete,
    IconEdit,
    IconPlus,
    IconRefresh,
    IconTick,
    IconUser
} from '@douyinfe/semi-icons';
import {
    AddMemberDto,
    UpdateMemberDto,
    UpdateWalletDisplayNameDto,
    WalletDetailResponseItemData,
    WalletDetailResponseMemberItemData
} from '../../api/generated';
import {getServerApi, handleResponse} from '../../api/utils';
import {getErrorMsg} from '../../utils';
import {useNavigate} from 'react-router-dom';
import {Path} from '../../lib/constants/paths';
import {IllustrationFailure, IllustrationFailureDark} from "@douyinfe/semi-illustrations";

const {Title, Text} = Typography;

interface WalletDetailProps {
    walletUid: string;
}

const WalletDetail: FC<WalletDetailProps> = ({walletUid}) => {
    const [walletDetail, setWalletDetail] = useState<WalletDetailResponseItemData | null>(null);
    const [loading, setLoading] = useState(true);
    const [addMemberModalVisible, setAddMemberModalVisible] = useState(false);
    const [editMemberModalVisible, setEditMemberModalVisible] = useState(false);
    const [editingMember, setEditingMember] = useState<WalletDetailResponseMemberItemData | null>(null);
    const [editMemberFormData, setEditMemberFormData] = useState({alias: '', creditLimit: 0});

    // Form api

    // 钱包名称编辑状态
    const [isEditingWalletName, setIsEditingWalletName] = useState(false);
    const [newWalletName, setNewWalletName] = useState('');

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
                getServerApi().wallet.walletControllerGetWalletDetail({walletUid}),
                {
                    onSuccess: setWalletDetail,
                    onError: (errorMsg) => {
                        Toast.error({content: errorMsg});
                    }
                }
            );
        } catch (error) {
            Toast.error({content: getErrorMsg(error, '获取钱包详情失败')});
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
                    Toast.error({content: '钱包名称不能为空'});
                    return;
                }

                if (newWalletName.trim() === walletDetail?.displayName) {
                    setIsEditingWalletName(false);
                    return;
                }

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
                                Toast.success({content: '钱包名称更新成功'});
                                setIsEditingWalletName(false);
                                fetchWalletDetail();
                            },
                            onError: (errorMsg) => {
                                Toast.error({content: errorMsg});
                            }
                        }
                    );
                } catch (error) {
                    Toast.error({content: getErrorMsg(error, '更新钱包名称失败')});
                }
                break;
        }
    }

    // 添加成员
    const handleAddMember = async (values: AddMemberDto) => {
        try {

            await handleResponse(
                getServerApi().wallet.walletControllerAddMember({walletUid, requestBody: values}),
                {
                    onSuccess: () => {
                        Toast.success({content: '添加成员成功'});
                        setAddMemberModalVisible(false);
                        fetchWalletDetail();
                    },
                    onError: (errorMsg) => {
                        Toast.error({content: errorMsg});
                    }
                }
            );
        } catch (error) {
            Toast.error({content: getErrorMsg(error, '添加成员失败')});
        }
    };

    // 更新成员
    const handleUpdateMember = async () => {
        if (!editingMember || !editMemberFormData.alias || editMemberFormData.creditLimit <= 0) {
            Toast.error({content: '请填写完整的成员信息'});
            return;
        }

        try {
            const updateMemberDto: UpdateMemberDto = {
                alias: editMemberFormData.alias,
                creditLimit: editMemberFormData.creditLimit
            };

            await handleResponse(
                getServerApi().wallet.walletControllerUpdateMember({
                    walletUid,
                    memberUid: editingMember.user.uid,
                    requestBody: updateMemberDto
                }),
                {
                    onSuccess: () => {
                        Toast.success({content: '更新成员成功'});
                        setEditMemberModalVisible(false);
                        setEditingMember(null);
                        setEditMemberFormData({alias: '', creditLimit: 0});
                        fetchWalletDetail();
                    },
                    onError: (errorMsg) => {
                        Toast.error({content: errorMsg});
                    }
                }
            );
        } catch (error) {
            Toast.error({content: getErrorMsg(error, '更新成员失败')});
        }
    };

    // 移除成员
    const handleRemoveMember = async (member: WalletDetailResponseMemberItemData) => {
        try {
            await handleResponse(
                getServerApi().wallet.walletControllerRemoveMember({
                    walletUid,
                    memberUid: member.user.uid
                }),
                {
                    onSuccess: () => {
                        Toast.success({content: '移除成员成功'});
                        fetchWalletDetail();
                    },
                    onError: (errorMsg) => {
                        Toast.error({content: errorMsg});
                    }
                }
            );
        } catch (error) {
            Toast.error({content: getErrorMsg(error, '移除成员失败')});
        }
    };

    // 重置成员已用额度
    const handleResetCreditUsage = async (member: WalletDetailResponseMemberItemData) => {
        Modal.warning({
            title: '重置已用额度',
            content: `确定要重置成员 "${member.user.displayName}" 的已用额度吗？此操作将清零该成员的已用额度。`,
            onOk: async () => {
                try {
                    await handleResponse(
                        getServerApi().wallet.walletControllerResetCreditUsage({
                            walletUid,
                            memberUid: member.user.uid
                        }),
                        {
                            onSuccess: () => {
                                Toast.success({content: '重置已用额度成功'});
                                fetchWalletDetail();
                            },
                            onError: (errorMsg) => {
                                Toast.error({content: errorMsg});
                            }
                        }
                    );
                } catch (error) {
                    Toast.error({content: getErrorMsg(error, '重置已用额度失败')});
                }
            },
            cancelButtonProps: {theme: 'borderless'},
            centered: true,
        });
    };

    // 打开编辑成员模态框
    const openEditMemberModal = (member: WalletDetailResponseMemberItemData) => {
        setEditingMember(member);
        setEditMemberFormData({
            alias: member.alias,
            creditLimit: parseFloat(member.creditLimit)
        });
        setEditMemberModalVisible(true);
    };

    // 成员表格列定义
    const memberColumns = [
        {
            title: '用户名称',
            key: 'member',
            width: '40%',
            render: (_: unknown, record: WalletDetailResponseMemberItemData) => (
                <Space>
                    <IconUser style={{color: 'var(--semi-color-primary)'}}/>
                    <Popover
                        style={{padding: 12}}
                        content={
                            <Text copyable>UID: {record.user.uid}</Text>
                        }
                        trigger="hover"
                    >
                        <Text strong>{record.user.displayName}<Text type='tertiary'>({record.alias})</Text></Text>
                    </Popover>
                </Space>
            ),
        },
        {
            title: '额度信息',
            key: 'credit',
            width: '25%',
            render: (_: unknown, record: WalletDetailResponseMemberItemData) => {
                const {creditLimit, creditUsed} = record;

                const usageRatio = Number(creditUsed) / Number(creditLimit);

                let textColor = undefined;
                if (usageRatio >= 1) {
                    textColor = 'var(--semi-color-danger)';
                } else if (usageRatio >= 0.8) {
                    textColor = 'var(--semi-color-warning)';
                }

                return <Text style={{color: textColor}}>${record.creditUsed} / ${record.creditLimit}</Text>
            },
        },
        {
            title: '操作',
            key: 'actions',
            width: '45%',
            render: (_: unknown, record: WalletDetailResponseMemberItemData) => {
                if (!record.isActive) {
                    return (
                        <Space wrap>
                            <Button
                                icon={<IconRefresh/>}
                                theme="borderless"
                                onClick={() => handleAddMember({
                                    memberUid: record.user.uid,
                                    alias: record.alias,
                                    creditLimit: Number(record.creditLimit)
                                })}
                            >
                                重新添加
                            </Button>
                        </Space>
                    );
                }
                return (
                    <Space wrap>
                        <Button
                            icon={<IconEdit/>}
                            size="small"
                            onClick={() => openEditMemberModal(record)}
                            theme="borderless"
                        >
                            编辑
                        </Button>
                        <Button
                            icon={<IconRefresh/>}
                            size="small"
                            onClick={() => handleResetCreditUsage(record)}
                            theme="borderless"
                            type="warning"
                        >
                            重置额度
                        </Button>
                        <Button
                            icon={<IconDelete/>}
                            type="danger"
                            size="small"
                            theme="borderless"
                            onClick={() => {
                                Modal.error({
                                    title: '移除成员',
                                    content: `确定要移除成员 "${record.user.displayName}" 吗？移除后该成员将无法访问此钱包。`,
                                    onOk: () => handleRemoveMember(record),
                                    cancelButtonProps: {theme: 'borderless'},
                                    centered: true,
                                });
                            }}
                        >
                            移除
                        </Button>
                    </Space>
                );
            },
        },
    ];

    return (
        <>
            <Card
                style={{
                    width: '100%',
                    height: '100%',
                    overflow: 'auto',
                    scrollbarWidth: 'none',
                }}
                bordered={false}
                loading={loading}
            >
                {walletDetail ? (
                    <>
                        {/* 头部(导航栏) */}
                        <Space style={{justifyContent: 'space-between', width: '100%'}}>
                            <Button icon={<IconArrowLeft/>} onClick={handleBackToList}>
                                返回钱包列表
                            </Button>
                            <Button
                                icon={<IconPlus/>}
                                type="primary"
                                onClick={() => setAddMemberModalVisible(true)}
                            >
                                添加成员
                            </Button>
                        </Space>

                        {/* 中部 */}
                        <div style={{marginTop: 24}}>
                            {/* 钱包信息 */}
                            <Space vertical align="start" style={{width: '100%'}}>
                                {/*名称*/}
                                {isEditingWalletName ? (
                                    <Space>
                                        <Input
                                            value={newWalletName}
                                            onChange={setNewWalletName}
                                            placeholder="请输入钱包名称"
                                            style={{width: 200}}
                                        />
                                        <IconTick
                                            style={{cursor: 'pointer', color: '#52c41a'}}
                                            onClick={async () => await handleEditWalletName("save")}
                                        />
                                        <IconClose
                                            style={{cursor: 'pointer', color: '#ff4d4f'}}
                                            onClick={async () => await handleEditWalletName("cancel")}

                                        />
                                    </Space>
                                ) : (
                                    <Space>
                                        <Title heading={3}>{walletDetail.displayName}</Title>
                                        <IconEdit
                                            style={{cursor: 'pointer'}}
                                            onClick={async () => await handleEditWalletName("start")}
                                        />
                                    </Space>
                                )}
                            </Space>

                            {/* 成员列表 */}
                            <Table
                                rowKey="uid"
                                columns={memberColumns}
                                dataSource={walletDetail.members}
                                pagination={false}
                                empty={!loading && (
                                    <div style={{padding: "32px 0"}}>
                                        <Typography.Text type='tertiary'>
                                            该钱包无成员，你可以
                                            <Typography.Text
                                                link
                                                onClick={() => setAddMemberModalVisible(true)}
                                                type='tertiary'
                                                style={{marginLeft: 1}}
                                            >
                                                添加成员
                                            </Typography.Text>
                                        </Typography.Text>
                                    </div>)}
                            />
                        </div>
                    </>
                ) : (
                    <Card style={{width: '100%'}}>
                        <Space align='center' vertical style={{width: "100%"}} spacing='loose'>
                            <Empty
                                image={<IllustrationFailure style={{width: 150, height: 150}}/>}
                                darkModeImage={<IllustrationFailureDark style={{width: 150, height: 150}}/>}
                                title="钱包加载失败"
                                description={`钱包UID: ${walletUid}`}
                            />
                            <Button onClick={handleBackToList} icon={<IconArrowLeft/>}>
                                返回钱包列表
                            </Button>
                        </Space>
                    </Card>
                )}
            </Card>
            <Modal
                title="添加成员"
                visible={addMemberModalVisible}
                onCancel={() => setAddMemberModalVisible(false)}
                width={360}
                footer={null}
                centered
            >
                <Form
                    style={{margin: '0 8px 24px 8px'}}
                    onSubmit={values => handleAddMember(values)}
                >
                    <Form.Input
                        field='memberUid'
                        label='用户UID'
                        placeholder='请输入成员的UID'
                        rules={[{required: true}]}
                    />
                    <Form.Input
                        field='alias'
                        label='用户别名'
                        placeholder='为该成员设置一个易于识别的别名'
                        rules={[{required: true}]}
                    />
                    <Form.InputNumber
                        field='creditLimit'
                        label='额度限制'
                        placeholder='成员最大消费额度'
                        prefix={'$'}
                        min={0}
                        max={1000000}
                        precision={2}
                        rules={[{required: true}]}
                    />
                    <Button
                        type="primary"
                        htmlType="submit"
                        block
                    >
                        提交
                    </Button>
                </Form>
            </Modal>

            <Modal
                title="编辑钱包成员"
                visible={editMemberModalVisible}
                onCancel={() => {
                    setEditMemberModalVisible(false);
                    setEditingMember(null);
                    setEditMemberFormData({alias: '', creditLimit: 0});
                }}
                footer={null}
                width={480}
                centered
            >
                <Space vertical style={{width: '100%'}} spacing={16}>
                    <div>
                        <Typography.Text strong style={{color: 'var(--semi-color-text-0)'}}>
                            别名 <Typography.Text type="danger">*</Typography.Text>
                        </Typography.Text>
                        <Input
                            placeholder="请输入成员别名"
                            value={editMemberFormData.alias}
                            onChange={(value) => setEditMemberFormData(prev => ({...prev, alias: value}))}
                            style={{marginTop: 8}}
                            showClear
                        />
                        <Typography.Text size="small" type="tertiary" style={{marginTop: 4, display: 'block'}}>
                            为该成员设置一个易于识别的别名
                        </Typography.Text>
                    </div>
                    <div>
                        <Typography.Text strong style={{color: 'var(--semi-color-text-0)'}}>
                            额度限制 <Typography.Text type="danger">*</Typography.Text>
                        </Typography.Text>
                        <InputNumber
                            placeholder="请输入额度限制"
                            min={0}
                            step={1}
                            precision={2}
                            value={editMemberFormData.creditLimit}
                            onChange={(value) => setEditMemberFormData(prev => ({
                                ...prev,
                                creditLimit: Number(value) || 0
                            }))}
                            formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={value => value!.replace(/\$\s?|(,*)/g, '')}
                            style={{marginTop: 8, width: '100%'}}
                        />
                        <Typography.Text size="small" type="tertiary" style={{marginTop: 4, display: 'block'}}>
                            设置该成员的最大使用额度（美元）
                        </Typography.Text>
                    </div>
                    <div style={{
                        textAlign: 'right',
                        marginTop: 24,
                        paddingTop: 16,
                        borderTop: '1px solid var(--semi-color-border)'
                    }}>
                        <Space>
                            <Button onClick={() => {
                                setEditMemberModalVisible(false);
                                setEditingMember(null);
                                setEditMemberFormData({alias: '', creditLimit: 0});
                            }}>
                                取消
                            </Button>
                            <Button
                                type="primary"
                                onClick={handleUpdateMember}
                                disabled={!editMemberFormData.alias.trim() || editMemberFormData.creditLimit <= 0}
                            >
                                保存修改
                            </Button>
                        </Space>
                    </div>
                </Space>
            </Modal>
        </>
    );
};

export default WalletDetail;
