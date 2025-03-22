import { FC, useState, useEffect } from 'react';
import { Button, Typography, Card, Toast, Divider, Input, PinCode, Space } from '@douyinfe/semi-ui';
import Icon, { IconArrowLeft, IconMail, IconGithubLogo, IconKey } from '@douyinfe/semi-icons';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../lib/context/hooks';
import { Path } from '../lib/constants/paths';
import { getServerApi, parseResponse } from '../api/utils';
// @ts-expect-error handle svg file
import GoogleIcon from '@/assets/icons/google.svg?react';

const Login: FC = () => {
    const { user, setUser, token, setToken, isLoading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || Path.ROOT;
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [sendingVerifyCode, setSendingVerifyCode] = useState(false);
    const [inputs, setInputs] = useState({ email: '', code: '' });
    const [showVerifyCode, setShowVerifyCode] = useState(false);
    const [countdown, setCountdown] = useState(0);

    const api = getServerApi().authentication;

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    if (!isLoading && token && user) {
        return <Navigate to={from} replace />;
    }

    const sendVerifyCode = async () => {
        // if (!inputs.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inputs.email)) {
        //     Toast.error({ content: '请输入有效的邮箱地址', duration: 2 });
        //     return;
        // }

        setSendingVerifyCode(true);
        try {
            parseResponse(await api.authControllerSendEmailLoginCode({ requestBody: { email: inputs.email } }), {
                onSuccess: () => {
                    setShowVerifyCode(true);
                    setCountdown(60); // 60秒倒计时
                    Toast.success({ content: '验证码已发送', duration: 2 });
                },
                onError: (errorMsg) => {
                    console.error('Send verify code error:', errorMsg);
                    Toast.error({ content: errorMsg, duration: 2 });
                }
            });
        } catch (error) {
            console.error('Send verify code error:', error);
        } finally {
            setSendingVerifyCode(false);
        }
    };

    const handleVerifyCode = async (values: { email: string, code: string }) => {
        setIsSubmitting(true);
        try {
            parseResponse(await api.authControllerLogin({ requestBody: values }), {
                onSuccess: (data) => {
                    setUser(data.user);
                    setToken(data.token);
                    navigate(from, { replace: true });
                    Toast.success({ content: '登录成功', duration: 2 });
                },
                onError: (errorMsg) => {
                    setInputs({ ...inputs, code: '' });
                    Toast.error({ content: errorMsg, duration: 2 });
                }
            });
        } catch (error) {
            console.error('Login error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const backToEmailInput = () => {
        setShowVerifyCode(false);
        setInputs({ ...inputs, code: '' });
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !showVerifyCode) {
            sendVerifyCode();
        }
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            background: 'linear-gradient(to bottom, #f8f9fa, #eaecef)',
            padding: '16px'
        }}>
            <Card
                style={{
                    width: '100%',
                    maxWidth: 480,
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                    padding: '32px',
                    borderRadius: '12px',
                    transition: 'all 0.3s ease'
                }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <Typography.Title heading={2} style={{ fontSize: '28px', margin: '0 0 8px 0' }}>登录</Typography.Title>
                    <Typography.Text style={{ fontSize: '16px', color: 'var(--semi-color-text-2)' }}>欢迎使用World AI Web</Typography.Text>
                </div>

                {showVerifyCode ? (
                    <>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
                            <Button
                                icon={<IconArrowLeft size="large" />}
                                theme="borderless"
                                onClick={backToEmailInput}
                                style={{ marginRight: '12px', color: 'var(--semi-color-primary)' }}
                            />
                            <Typography.Text style={{ fontSize: '16px', fontWeight: 500 }}>{inputs.email}</Typography.Text>
                        </div>
                        <Typography.Text type="secondary" style={{ display: 'block', marginBottom: '20px', fontSize: '15px' }}>
                            请输入发送到您邮箱的验证码
                        </Typography.Text>
                        <PinCode
                            size="large"
                            autoFocus
                            format={/[A-Z]|[0-9]|[a-z]/}
                            onComplete={(value) => handleVerifyCode({ email: inputs.email, code: value })}
                            onChange={(value) => setInputs({ ...inputs, code: value.toUpperCase() })}
                            value={inputs.code}
                            style={{ width: '100%', marginBottom: '24px' }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
                            <Button
                                type="tertiary"
                                disabled={countdown > 0}
                                onClick={sendVerifyCode}
                                loading={sendingVerifyCode}
                                style={{ fontSize: '14px' }}
                            >
                                {countdown > 0 ? `重新发送 (${countdown}s)` : '重新发送验证码'}
                            </Button>
                        </div>
                        <Button
                            size="large"
                            block
                            theme="solid"
                            type="primary"
                            loading={isSubmitting}
                            onClick={() => handleVerifyCode({ email: inputs.email, code: inputs.code })}
                            style={{ height: '48px', fontSize: '16px', borderRadius: '8px' }}
                        >
                            登录
                        </Button>
                    </>
                ) : (
                    <Space vertical spacing="loose" align="start" style={{ width: '100%' }}>
                        <Input
                            size="large"
                            placeholder="请输入邮箱"
                            prefix={<IconMail style={{ color: 'var(--semi-color-text-2)' }} />}
                            style={{
                                height: '48px',
                                borderRadius: '8px',
                                width: '100%'
                            }}
                            value={inputs.email}
                            onChange={(value) => setInputs({ ...inputs, email: value })}
                            onKeyDown={handleKeyDown}
                            autoFocus
                            autoComplete="email"
                        />
                        <Button
                            size="large"
                            block
                            theme="solid"
                            type="primary"
                            style={{
                                height: '48px',
                                fontSize: '16px',
                                borderRadius: '8px'
                            }}
                            onClick={sendVerifyCode}
                            loading={sendingVerifyCode}
                            icon={<IconMail />}
                        >
                            通过邮箱验证码登录
                        </Button>
                        <Divider style={{ margin: '8px 0' }}>
                            <span style={{ color: 'var(--semi-color-text-2)', padding: '0 12px' }}>或者</span>
                        </Divider>
                        <Button
                            size="large"
                            block
                            style={{
                                height: '48px',
                                fontSize: '16px',
                                backgroundColor: '#24292e',
                                color: 'white',
                                borderRadius: '8px',
                                transition: 'background-color 0.2s ease'
                            }}
                            icon={<IconGithubLogo style={{ color: 'white' }} />}
                        >
                            通过 Github 登录
                        </Button>
                        <Button
                            size="large"
                            block
                            style={{
                                height: '48px',
                                fontSize: '16px',
                                backgroundColor: 'white',
                                color: '#444',
                                border: '1px solid #ddd',
                                borderRadius: '8px',
                                transition: 'all 0.2s ease'
                            }}
                            icon={<Icon svg={<GoogleIcon />} />}
                        >
                            通过 Google 登录
                        </Button>
                        <Button
                            size="large"
                            block
                            style={{
                                height: '48px',
                                fontSize: '16px',
                                backgroundColor: 'white',
                                color: '#444',
                                border: '1px solid #ddd',
                                borderRadius: '8px',
                                transition: 'all 0.2s ease'
                            }}
                            icon={<IconKey />}
                        >
                            通过 Passkey 登录
                        </Button>
                    </Space>
                )}
            </Card>
        </div>
    );
};

export default Login; 