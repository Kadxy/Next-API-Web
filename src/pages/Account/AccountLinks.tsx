import {CSSProperties, FC, ReactNode, useState} from 'react';
import { Button, Card, Toast, Typography, Space, Avatar, Row, Col, Input, Modal } from '@douyinfe/semi-ui';
import Icon, { IconFeishuLogo, IconLink, IconMail, IconPhone } from '@douyinfe/semi-icons';
import { useAuth } from '../../lib/context/hooks';
import { getServerApi, handleResponse } from '../../api/utils';
import { getErrorMsg } from '../../utils';
// @ts-expect-error handle svg file
import GoogleIconBW from '@/assets/icons/google_pure.svg?react';
// @ts-expect-error handle svg file
import GithubIcon from '@/assets/icons/github.svg?react';
// @ts-expect-error handle svg file
import MicrosoftIconBW from '@/assets/icons/microsoft_pure.svg?react';

interface AccountLinkItem {
    id: string;
    name: string;
    value: string | undefined;
    description: string;
    icon: ReactNode;
    connected: boolean;
    activeColor: string;
}

const IconStyle: CSSProperties = { width: 20, height: 20 };

const AccountLinks: FC = () => {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [inputEmail, setInputEmail] = useState<string>('');

    const dataSource: AccountLinkItem[] = [
        {
            id: 'phone',
            name: '手机号',
            value: user?.phone,
            description: '绑定后可接收紧急通知',
            icon: <IconPhone size="large" />,
            connected: !!user?.phone,
            activeColor: 'rgba(var(--semi-purple-3), 1)',
        },
        {
            id: 'email',
            name: '邮箱',
            value: user?.email,
            description: '绑定后可接收订阅信息和通知',
            icon: <IconMail size="large" />,
            connected: !!user?.email,
            activeColor: 'rgba(var(--semi-orange-3), 1)',
        },
        {
            id: 'feishu',
            name: '飞书',
            value: user?.feishuId,
            description: '绑定后可授权登录和集成到飞书',
            icon: <IconFeishuLogo size="large" />,
            connected: !!user?.feishuId,
            activeColor: 'rgba(var(--semi-teal-3), 1)',
        },
        {
            id: 'google',
            name: 'Google',
            value: user?.googleId,
            description: '绑定后可授权登录',
            icon: <Icon svg={<GoogleIconBW style={IconStyle} />} />,
            connected: !!user?.googleId,
            activeColor: 'rgba(var(--semi-red-3), 1)',
        },
        {
            id: 'microsoft',
            name: 'Microsoft',
            value: user?.microsoftId,
            description: '绑定后可授权登录',
            icon: <Icon svg={<MicrosoftIconBW style={IconStyle} />} />,
            connected: !!user?.microsoftId,
            activeColor: 'rgba(var(--semi-light-blue-3), 1)',
        },
        {
            id: 'github',
            name: 'GitHub',
            value: user?.gitHubId,
            description: '绑定后可授权登录和集成到 GitHub',
            icon: <Icon svg={<GithubIcon style={IconStyle} />} />,
            connected: !!user?.gitHubId,
            activeColor: 'rgba(var(--semi-grey-9), 1)',
        },
    ];

    // 绑定账号
    const handleBindAccount = async (type: string) => {
        setIsLoading(prev => ({ ...prev, [type]: true }));

        try {
            const api = getServerApi();
            const action = 'bind';

            switch (type) {
                case 'github':
                    await handleResponse(api.gitHubAuthentication.gitHubAuthControllerGetGithubConfig({ action }), {
                        onSuccess: (data) => window.location.href = data.oauthUrl,
                        onError: (errorMsg) => {
                            Toast.error({ content: errorMsg, stack: true });
                        }
                    });
                    break;
                case 'google':
                    await handleResponse(api.googleAuthentication.googleAuthControllerGetGoogleConfig({ action }), {
                        onSuccess: (data) => window.location.href = data.oauthUrl,
                        onError: (errorMsg) => {
                            Toast.error({ content: errorMsg, stack: true });
                        }
                    });
                    break;
                case 'microsoft':
                    await handleResponse(api.microsoftAuthentication.microsoftAuthControllerGetMicrosoftConfig({ action }), {
                        onSuccess: (data) => window.location.href = data.oauthUrl,
                        onError: (errorMsg) => {
                            Toast.error({ content: errorMsg, stack: true });
                        }
                    });
                    break;
                case 'feishu':
                    await handleResponse(api.feishuAuthentication.feishuAuthControllerGetFeishuConfig({ action }), {
                        onSuccess: (data) => window.location.href = data.oauthUrl,
                        onError: (errorMsg) => {
                            Toast.error({ content: errorMsg, stack: true });
                        }
                    });
                    break;
                case 'phone':
                case 'email':
                    // email 无需等待
                    setIsLoading(prev => ({ ...prev, [type]: false }));
                    setShowEmailModal(true);
                    break;
                default:
                    Toast.error({ content: '暂不支持该类型的账号绑定', stack: true });
            }
        } catch (error) {
            Toast.error({ content: getErrorMsg(error, '绑定失败'), stack: true });
        } finally {
            setTimeout(() => {
                setIsLoading(prev => ({ ...prev, [type]: false }));
                // 1000ms 后解除 loading 状态, 否则可能来不及跳转
            }, 1000);
        }
    };

    return (
        <Card
            title="关联账号"
            style={{ width: '100%' }}
            bodyStyle={{ padding: '12px 16px' }}
        >
            <Row gutter={[12, 12]}>
                {dataSource.map(item => (
                    <Col key={item.id} xxl={8} xl={8} lg={12} md={24} sm={24} xs={24}>
                        <Card
                            style={{ borderRadius: 12 }}
                            bodyStyle={{
                                padding: '12px 16px',
                                opacity: item.connected ? 1 : 0.6,
                            }}
                        >
                            <Space align="center" style={{ width: '100%', justifyContent: 'space-between' }}>
                                <Space align="center" spacing={12}>
                                    <Avatar
                                        size="default"
                                        shape="square"
                                        style={
                                            item.connected
                                                ? { // --- 已连接状态 ---
                                                    backgroundColor: item.activeColor,
                                                    color: 'white',
                                                    borderRadius: 12,
                                                }
                                                : { // --- 未连接状态 (保持不变) ---
                                                    backgroundColor: 'var(--semi-color-fill-2)',
                                                    color: 'var(--semi-color-text-2)',
                                                    borderRadius: 12,
                                                }
                                        }
                                    >
                                        {item.icon}
                                    </Avatar>
                                    <Space vertical align="start" spacing={2}>
                                        <Typography.Title heading={6}>
                                            {item.name}
                                        </Typography.Title>
                                        <Typography.Text type='quaternary'>
                                            {item.value || item.description}
                                        </Typography.Text>
                                    </Space>
                                </Space>
                                {/* 操作按钮 */}
                                {item.connected ? (<></>) : (
                                    <Button
                                        type='primary'
                                        icon={<IconLink />}
                                        onClick={() => handleBindAccount(item.id)}
                                        loading={isLoading[item.id]}
                                        theme='borderless'
                                    />
                                )}
                            </Space>
                        </Card>
                    </Col>
                ))}
            </Row>
            <Modal
                title="绑定邮箱"
                visible={showEmailModal}
                onCancel={() => setShowEmailModal(false)}
                afterClose={() => setInputEmail('')}
                width={360}
                centered
                onOk={async () => {
                    const co = getServerApi().authentication;
                    await handleResponse(co.authControllerSendEmailBindVerificationCode({
                        requestBody: { email: inputEmail }
                    }), {
                        onSuccess: () => {
                            Toast.info({ content: '验证邮件已发送, 请在 12 小时内点击链接完成绑定', stack: true });
                            setShowEmailModal(false);
                        },
                        onError: (errorMsg) => {
                            Toast.error({ content: errorMsg, stack: true });
                        }
                    });
                }}
            >
                <Space vertical align="start" style={{ width: '100%' }}>
                    <Input
                        value={inputEmail}
                        placeholder='请输入邮箱'
                        onChange={(value) => setInputEmail(value)}
                        size='large'
                    />
                </Space>
            </Modal>
        </Card>
    );
};

export default AccountLinks; 