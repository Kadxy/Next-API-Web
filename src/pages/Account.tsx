import { FC, useEffect, useState } from 'react';
import { Button, Card, Divider, Empty, List, Modal, Popconfirm, Space, Spin, Tag, Toast, Typography } from '@douyinfe/semi-ui';
import { IconDelete, IconPlus, IconGithubLogo, IconMail, IconEdit } from '@douyinfe/semi-icons';
import { useAuth } from '../lib/context/hooks';
import { getServerApi, parseResponse } from '../api/utils';
import { startRegistration } from '@simplewebauthn/browser';

const { Title, Text } = Typography;

interface PasskeyInfo {
    id: string;
    createdAt?: string;
    deviceType?: 'singleDevice' | 'multiDevice';
    backedUp?: boolean;
}

interface UserDetail {
    id: number;
    uid: string;
    displayName: string;
    avatar: string;
    email: string | null;
    phone: string | null;
    gitHubId: string | null;
    googleId: string | null;
    appleId: string | null;
    twoFactorEnabled: boolean;
    twoFactorSecret: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    wallet: { balance: string };
}

const Account: FC = () => {
    const { user, logout } = useAuth();
    const [passkeys, setPasskeys] = useState<PasskeyInfo[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRegistering, setIsRegistering] = useState(false);
    const [showLogoutAllModal, setShowLogoutAllModal] = useState(false);
    const api = getServerApi();

    // 加载用户的passkey列表
    useEffect(() => {
        fetchUserPasskeys();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // 获取用户的passkey列表
    const fetchUserPasskeys = async () => {
        setIsLoading(true);
        try {
            parseResponse(await api.passkeyAuthentication.passkeyControllerGetUserPasskeys(), {
                onSuccess: (data) => setPasskeys(data || []),
                onError: (errorMsg) => Toast.error({ content: errorMsg })
            });
        } catch (error) {
            console.error('获取Passkey列表失败:', error);
            Toast.error({ content: '获取Passkey列表失败' });
        } finally {
            setIsLoading(false);
        }
    };

    // 删除passkey
    const handleDeletePasskey = async (id: string) => {
        try {
            parseResponse(await api.passkeyAuthentication.passkeyControllerDeletePasskey({ id }), {
                onSuccess: async () => {
                    await fetchUserPasskeys();
                    Toast.success({ content: 'Passkey删除成功' });
                },
                onError: (errorMsg) => Toast.error({ content: errorMsg })
            });
        } catch (error) {
            console.error('删除Passkey失败:', error);
            Toast.error({ content: '删除Passkey失败' });
        }
    };

    // 注册新的passkey
    const handleRegisterPasskey = async () => {
        setIsRegistering(true);
        try {
            // 1. 获取注册选项
            parseResponse(await api.passkeyAuthentication.passkeyControllerGenerateRegistrationOptions(), {
                onSuccess: async (options) => {
                    try {
                        // 2. 启动注册流程
                        const registrationResponse = await startRegistration(options);

                        // 3. 发送注册响应到服务器进行验证
                        parseResponse(await api.passkeyAuthentication.passkeyControllerVerifyRegistrationResponse({
                            requestBody: registrationResponse
                        }), {
                            onSuccess: async () => {
                                Toast.success({ content: 'Passkey注册成功' });
                                // 刷新Passkey列表
                                await fetchUserPasskeys();
                            },
                            onError: (errorMsg) => Toast.error({ content: errorMsg })
                        });
                    } catch (error) {
                        // 静默处理
                        console.error('Passkey注册错误:', error);
                    }
                },
                onError: (errorMsg) => Toast.error({ content: errorMsg })
            });
        } catch (error) {
            console.error('启动Passkey注册失败:', error);
            Toast.error({ content: '启动Passkey注册失败' });
        } finally {
            setIsRegistering(false);
        }
    };

    // 渲染Passkey列表项
    const renderPasskeyItem = (passkey: PasskeyInfo) => {
        // 创建时间格式化
        const createdDate = passkey.createdAt ? new Date(passkey.createdAt).toLocaleString() : '未知时间';

        // 设备类型标签
        const deviceTypeTag = passkey.deviceType === 'multiDevice' ? (
            <Tag color="green">多设备</Tag>
        ) : (
            <Tag color="blue">单设备</Tag>
        );

        // 备份状态标签
        const backupTag = passkey.backedUp ? (
            <Tag color="green">已备份</Tag>
        ) : (
            <Tag color="orange">未备份</Tag>
        );

        return (
            <List.Item
                header={<div style={{ width: 40, height: 40, backgroundColor: '#f0f0f0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🔑</div>}
                main={
                    <div>
                        <Text strong>{passkey.id.slice(0, 8)}...</Text>
                        <div>
                            <Text type="tertiary" size="small">创建于: {createdDate}</Text>
                        </div>
                        <div style={{ marginTop: 8 }}>
                            {deviceTypeTag} {passkey.backedUp !== undefined && backupTag}
                        </div>
                    </div>
                }
                extra={
                    <Popconfirm
                        title="确定要删除这个Passkey吗?"
                        content="删除后将无法使用此Passkey登录"
                        okText="确定"
                        cancelText="取消"
                        onConfirm={() => handleDeletePasskey(passkey.id)}
                    >
                        <Button type="danger" icon={<IconDelete />} />
                    </Popconfirm>
                }
            />
        );
    };

    // 安全解析时间
    const formatDate = (dateString?: string) => {
        if (!dateString) return '未知';
        try {
            return new Date(dateString).toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch {
            return '格式错误';
        }
    };

    // 获取用户详情，确保user存在
    const userDetail = user ? (user as unknown as UserDetail) : {} as UserDetail;

    // 渲染主要内容
    return (
        <div
            style={{
                borderRadius: '10px',
                border: '1px solid var(--semi-color-border)',
                height: '100%',
                padding: '32px',
                overflow: 'auto'
            }}
        >
            {/* 个人信息卡片 */}
            <Card
                style={{ marginBottom: 32 }}
                headerStyle={{ padding: '20px 24px' }}
                header={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Title heading={3} style={{ margin: 0 }}>个人信息</Title>
                        <Button type="tertiary" icon={<IconEdit />}>编辑资料</Button>
                    </div>
                }
            >
                <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
                    {/* 头像和基本信息 */}
                    <div style={{ display: 'flex', gap: 16, flex: '1 1 300px' }}>
                        <div>
                            {userDetail?.avatar ? (
                                <img
                                    src={userDetail.avatar}
                                    alt="用户头像"
                                    style={{
                                        width: 90,
                                        height: 90,
                                        borderRadius: '50%',
                                        objectFit: 'cover',
                                        border: '1px solid var(--semi-color-border)'
                                    }}
                                />
                            ) : (
                                <div style={{
                                    width: 90,
                                    height: 90,
                                    borderRadius: '50%',
                                    backgroundColor: '#edf1fa',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: 36,
                                    color: 'var(--semi-color-primary)'
                                }}>
                                    {userDetail?.displayName?.[0]?.toUpperCase() || '?'}
                                </div>
                            )}
                        </div>
                        <div>
                            <Title heading={3} style={{ margin: '0 0 4px' }}>{userDetail?.displayName || '用户'}</Title>
                            <Text type="tertiary" style={{ display: 'block', marginBottom: 8 }}>UID: {userDetail?.uid ? userDetail.uid.slice(0, 8) + '...' : '未知'}</Text>
                            <Text>余额: {userDetail?.wallet?.balance || '0'}</Text>
                            <div style={{ marginTop: 8 }}>
                                {userDetail?.isActive && <Tag color="green" style={{ marginRight: 8 }}>已激活</Tag>}
                                {userDetail?.twoFactorEnabled && <Tag color="blue">两步验证已启用</Tag>}
                            </div>
                        </div>
                    </div>

                    {/* 账号绑定信息 */}
                    <div style={{ flex: '1 1 300px' }}>
                        <Title heading={5} style={{ marginTop: 0, marginBottom: 16 }}>账号关联</Title>
                        <List
                            split={false}
                            size="small"
                            style={{ marginBottom: 16 }}
                            dataSource={[
                                {
                                    id: 'email',
                                    name: '邮箱',
                                    icon: <IconMail style={{ color: '#1677ff' }} />,
                                    value: userDetail?.email,
                                    bound: !!userDetail?.email
                                },
                                {
                                    id: 'github',
                                    name: 'GitHub',
                                    icon: <IconGithubLogo style={{ color: '#24292e' }} />,
                                    value: userDetail?.gitHubId ? `ID: ${userDetail.gitHubId}` : null,
                                    bound: !!userDetail?.gitHubId
                                },
                                {
                                    id: 'google',
                                    name: 'Google',
                                    icon: <span style={{ color: '#4285F4', fontSize: '16px' }}>G</span>,
                                    value: userDetail?.googleId ? `ID: ${userDetail.googleId}` : null,
                                    bound: !!userDetail?.googleId
                                }
                            ]}
                            renderItem={item => (
                                <List.Item
                                    header={<div style={{ width: 24 }}>{item.icon}</div>}
                                    main={
                                        <div>
                                            <Text strong>{item.name}</Text>
                                            {item.bound ? (
                                                <Text type="secondary" style={{ display: 'block', fontSize: 12 }}>{item.value}</Text>
                                            ) : (
                                                <Text type="danger" style={{ display: 'block', fontSize: 12 }}>未绑定</Text>
                                            )}
                                        </div>
                                    }
                                    extra={
                                        <Button type={item.bound ? "tertiary" : "secondary"} size="small">
                                            {item.bound ? '解绑' : '绑定'}
                                        </Button>
                                    }
                                />
                            )}
                        />
                        <div style={{ marginTop: 16 }}>
                            <Text type="tertiary" size="small">注册时间: {formatDate(userDetail?.createdAt)}</Text>
                            <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
                                <Button type="danger" theme="light" onClick={() => logout(false)}>注销登录</Button>
                                <Button type="danger" onClick={() => setShowLogoutAllModal(true)}>注销全部设备</Button>

                                <Modal
                                    title="确认操作"
                                    visible={showLogoutAllModal}
                                    onOk={() => {
                                        logout(true);
                                        Toast.success({ content: '已注销所有设备登录' });
                                        setShowLogoutAllModal(false);
                                    }}
                                    onCancel={() => setShowLogoutAllModal(false)}
                                    okText="确定"
                                    cancelText="取消"
                                >
                                    <p>确定要注销全部设备吗？这将使您在所有已登录设备上退出登录。</p>
                                </Modal>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Passkey 管理区域 */}
            <Card
                style={{ marginBottom: 24 }}
                headerStyle={{ padding: '20px 24px' }}
                header={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Title heading={3} style={{ margin: 0 }}>Passkey 管理</Title>
                        <Button
                            type="primary"
                            theme="solid"
                            onClick={handleRegisterPasskey}
                            loading={isRegistering}
                            icon={<IconPlus />}
                        >
                            添加 Passkey
                        </Button>
                    </div>
                }
            >
                <Spin spinning={isLoading}>
                    {!isLoading && (
                        passkeys.length > 0 ? (
                            <List
                                dataSource={passkeys}
                                renderItem={renderPasskeyItem}
                            />
                        ) : (
                            <Empty
                                title="暂无Passkey"
                                description="您还没有添加任何Passkey，点击上方按钮添加"
                            />
                        )
                    )}
                </Spin>

                <Divider />

                <Space vertical align="start" style={{ width: '100%' }}>
                    <Title heading={6}>关于 Passkey</Title>
                    <Text type="secondary">
                        Passkey是一种更安全、更便捷的登录方式，无需记忆复杂密码。它使用生物识别（如指纹、面容）
                        或设备PIN码进行验证，可以跨设备使用，并且能有效防止钓鱼攻击。
                    </Text>
                </Space>
            </Card>
        </div>
    );
};

export default Account; 