import { FC, KeyboardEvent, useEffect, useRef, useState } from 'react';
import { Button, Card, Divider, Input, PinCode, Space, Toast, Typography, Spin } from '@douyinfe/semi-ui';
import Icon, { IconArrowLeft, IconGithubLogo, IconMail, IconLock } from '@douyinfe/semi-icons';
import { Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../lib/context/hooks';
import { Path } from '../lib/constants/paths';
import { getServerApi, parseResponse } from '../api/utils';
// @ts-expect-error handle svg file
import GoogleIcon from '@/assets/icons/google.svg?react';
import { ContextUser } from '../lib/context/AuthContext';
import { startAuthentication } from '@simplewebauthn/browser';
import type { AuthenticationResponseJSON } from '@simplewebauthn/browser';

const ButtonStyle = {
    height: '42px',
    fontSize: '14px',
    borderRadius: '8px',
    transition: 'all 0.2s ease',
    fontWeight: 500,
    marginBottom: '10px'
};

// 品牌标准颜色
const BrandColors = {
    github: {
        background: '#24292e',
        text: '#ffffff'
    },
    google: {
        background: '#ffffff',
        text: '#5f6368',
        border: '#dadce0'
    },
    passkey: {
        background: '#4285f4',
        text: '#ffffff'
    },
    email: {
        background: 'var(--semi-color-primary)',
        text: '#ffffff'
    }
};

const Login: FC = () => {
    const { user, setUser, token, setToken, isLoading: isAuthLoading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();
    const from = location.state?.from?.pathname || Path.ROOT;
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [sendingVerifyCode, setSendingVerifyCode] = useState(false);
    const [inputs, setInputs] = useState({ email: '', code: '' });
    const [showVerifyCode, setShowVerifyCode] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [isProcessingCallback, setIsProcessingCallback] = useState(false);
    const [isPasskeyLoading, setIsPasskeyLoading] = useState(false);
    const processedCode = useRef<string | null>(null);
    const api = getServerApi();

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    useEffect(() => {
        const handleCallback = async () => {
            if (isProcessingCallback) return;

            const isGithubCallback = searchParams.get('github_callback') === '1';
            const isGoogleCallback = searchParams.get('google_callback') === '1';
            const code = searchParams.get('code');
            const state = searchParams.get('state');

            if (!code || !state) return;
            if (processedCode.current === code) return;
            if (!isGithubCallback && !isGoogleCallback) return;

            try {
                setIsProcessingCallback(true);
                setSearchParams({});
                processedCode.current = code;
                const platform = isGithubCallback ? 'github' : 'google';
                await handleOauthCallback(platform, code, state);
            } catch (error) {
                console.error('登录失败', error);
            } finally {
                setIsProcessingCallback(false);
            }
        };

        handleCallback();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);

    if (!isAuthLoading && token && user) {
        return <Navigate to={from} replace />;
    }


    /* ------------------------------ auth step1 ------------------------------ */

    // 发送邮箱验证码
    const sendVerifyCode = async () => {
        if (!inputs.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inputs.email)) {
            Toast.error({ content: '请输入有效的邮箱地址' });
            return;
        }

        setSendingVerifyCode(true);
        try {
            parseResponse(await api.authentication.authControllerSendEmailLoginCode({ requestBody: { email: inputs.email } }), {
                onSuccess: () => {
                    setShowVerifyCode(true);
                    setCountdown(60);
                    Toast.success({ content: '验证码已发送' });
                },
                onError: (errorMsg) => Toast.error({ content: errorMsg })
            });
        } catch (error) {
            Toast.error({ content: '发送验证码失败' });
            console.error('Send verify code error:', error);
        } finally {
            setSendingVerifyCode(false);
        }
    };

    // 通用 OAuth 登录前处理
    const handleOauthLoginClick = async (platform: 'github' | 'google') => {
        switch (platform) {
            case 'github':
                parseResponse(await api.gitHubAuthentication.gitHubAuthControllerGetGithubConfig(), {
                    onSuccess: (data) => window.location.href = data.oauthUrl,
                    onError: (errorMsg) => Toast.error({ content: errorMsg, stack: true })
                });
                break;
            case 'google':
                parseResponse(await api.googleAuthentication.googleAuthControllerGetGoogleConfig(), {
                    onSuccess: (data) => window.location.href = data.oauthUrl,
                    onError: (errorMsg) => Toast.error({ content: errorMsg, stack: true })
                });
                break;
            default:
                Toast.error({ content: '无效的登录方式' });
        }
    };

    // Passkey 登录
    const handlePasskeyLogin = async () => {
        try {
            setIsPasskeyLoading(true);

            // 1. 从服务器获取认证选项
            parseResponse(await api.passkeyAuthentication.passkeyControllerGenerateAuthenticationOptions(), {
                onSuccess: async (data) => {
                    const { options, state } = data;

                    try {
                        // 2. 启动认证流程，让用户选择他们的 passkey
                        const authenticationResponse = await startAuthentication({
                            optionsJSON: options
                        });

                        // 3. 将认证响应发送到服务器进行验证
                        const response = await fetch(`/api/auth/passkey/authentication/${state}`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(authenticationResponse),
                        });
                        const responseData = await response.json();
                        if (response.ok) {
                            handleLoginResponse(responseData);
                        } else {
                            Toast.error({ content: responseData.message || '认证失败', stack: true });
                        }
                    } catch (error) {
                        // 用户取消或认证失败
                        console.error('Passkey 认证错误:', error);
                        const errorMessage = error instanceof Error ? error.message : '认证失败';
                        Toast.error({ content: `Passkey 认证失败：${errorMessage}` });
                    }
                },
                onError: (errorMsg) => Toast.error({ content: errorMsg, stack: true })
            });
        } catch (error) {
            console.error('Passkey 登录错误:', error);
            Toast.error({ content: '无法启动 Passkey 登录' });
        } finally {
            setIsPasskeyLoading(false);
        }
    };

    /* ------------------------------ auth step2 ------------------------------ */

    // 验证邮箱验证码
    const handleVerifyCodeLogin = async (values: { email: string, code: string }) => {
        setIsSubmitting(true);
        try {
            parseResponse(await api.authentication.authControllerLogin({ requestBody: values }), {
                onSuccess: (data) => handleLoginResponse(data),
                onError: (errorMsg) => {
                    setInputs({ ...inputs, code: '' });
                    Toast.error({ content: errorMsg });
                }
            });
        } catch (error) {
            console.error('Login error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // 通用 OAuth 登录回调
    const handleOauthCallback = async (platform: 'github' | 'google', code: string, state: string) => {
        switch (platform) {
            case 'github':
                parseResponse(await api.gitHubAuthentication.gitHubAuthControllerGithubLogin({ requestBody: { code, state } }), {
                    onSuccess: (data) => handleLoginResponse(data),
                    onError: (errorMsg) => Toast.error({ content: errorMsg, stack: true })
                });
                break;
            case 'google':
                parseResponse(await api.googleAuthentication.googleAuthControllerGoogleLogin({ requestBody: { code, state } }), {
                    onSuccess: (data) => handleLoginResponse(data),
                    onError: (errorMsg) => Toast.error({ content: errorMsg, stack: true })
                });
                break;
        }
    };

    /* ------------------------------ auth step3 ------------------------------ */

    // 通用登录处理
    const handleLoginResponse = (data: { user: ContextUser, token: string }) => {
        const { user, token } = data;
        setUser(user);
        setToken(token);
        navigate(from, { replace: true });
        Toast.success({ content: '登录成功' });
    };

    /* ------------------------------ handle events ------------------------------ */

    // 处理键盘事件
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Enter' && !showVerifyCode) {
            sendVerifyCode();
        }
    };

    // 返回邮箱输入
    const backToEmailInput = () => {
        setShowVerifyCode(false);
        setInputs({ ...inputs, code: '' });
    };

    /* ------------------------------ render components ------------------------------ */

    // 渲染验证码输入
    const renderVerifyCodeInput = () => (
        <>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                <Button
                    icon={<IconArrowLeft size="large" />}
                    theme="borderless"
                    onClick={backToEmailInput}
                    style={{ marginRight: '12px', color: 'var(--semi-color-primary)' }}
                />
                <Typography.Text
                    style={{ fontSize: '15px', fontWeight: 500 }}>{inputs.email}</Typography.Text>
            </div>
            <Typography.Text type="secondary"
                style={{ display: 'block', marginBottom: '16px', fontSize: '14px' }}>
                请输入发送到您邮箱的验证码
            </Typography.Text>
            <PinCode
                size="large"
                autoFocus
                format={/[A-Z]|[0-9]|[a-z]/}
                onComplete={(value) => handleVerifyCodeLogin({ email: inputs.email, code: value })}
                onChange={(value) => setInputs({ ...inputs, code: value.toUpperCase() })}
                value={inputs.code}
                style={{ width: '100%', marginBottom: '16px' }}
            />
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                <Button
                    type="tertiary"
                    disabled={countdown > 0}
                    onClick={sendVerifyCode}
                    loading={sendingVerifyCode}
                    style={{ fontSize: '13px' }}
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
                onClick={() => handleVerifyCodeLogin({ email: inputs.email, code: inputs.code })}
                style={{
                    ...ButtonStyle,
                    backgroundColor: BrandColors.email.background,
                }}
            >
                登录
            </Button>
        </>
    );

    // 渲染邮箱输入
    const renderEmailInput = () => (
        <Space vertical spacing={12} align="start" style={{ width: '100%' }}>
            <Input
                size="large"
                placeholder="请输入邮箱"
                prefix={<IconMail style={{ color: 'var(--semi-color-text-2)' }} />}
                style={{
                    height: '42px',
                    borderRadius: '8px',
                    width: '100%',
                    marginBottom: '4px'
                }}
                value={inputs.email}
                onChange={(value) => setInputs({ ...inputs, email: value })}
                onKeyDown={handleKeyDown}
                autoFocus
                autoComplete="username webauthn"
            />
            <Button
                size="large"
                block
                theme="solid"
                type="primary"
                style={{
                    ...ButtonStyle,
                    color: BrandColors.email.text,
                    backgroundColor: BrandColors.email.background,
                }}
                onClick={sendVerifyCode}
                loading={sendingVerifyCode}
                icon={<IconMail />}
            >
                使用邮箱继续
            </Button>
            <Button
                size="large"
                block
                style={{
                    ...ButtonStyle,
                    color: BrandColors.passkey.text,
                    backgroundColor: BrandColors.passkey.background,
                }}
                onClick={handlePasskeyLogin}
                loading={isPasskeyLoading}
                icon={<IconLock />}
            >
                使用 Passkey 登录
            </Button>
            <Divider style={{ margin: '4px 0 8px' }}>
                <span style={{ color: 'var(--semi-color-text-2)', padding: '0 12px', fontSize: '13px' }}>或</span>
            </Divider>
            <Button
                size="large"
                block
                style={{
                    ...ButtonStyle,
                    color: BrandColors.github.text,
                    backgroundColor: BrandColors.github.background,
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                }}
                icon={<IconGithubLogo style={{ color: 'white' }} />}
                onClick={() => handleOauthLoginClick('github')}
            >
                GitHub 登录
            </Button>
            <Button
                size="large"
                block
                style={{
                    ...ButtonStyle,
                    color: BrandColors.google.text,
                    backgroundColor: BrandColors.google.background,
                    border: `1px solid ${BrandColors.google.border}`,
                }}
                icon={<Icon svg={<GoogleIcon />} />}
                onClick={() => handleOauthLoginClick('google')}
            >
                Google 登录
            </Button>
        </Space>
    );

    // 渲染登录内容
    const renderContent = () => (
        <Card
            style={{
                width: '100%',
                maxWidth: 450,
                boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
                padding: '24px 32px',
                borderRadius: '12px',
                border: 'none'
            }}>
            <Spin
                tip="正在登录中..."
                size="large"
                spinning={isProcessingCallback}
            >
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <Typography.Title heading={3} style={{ margin: 0 }}>
                        登录
                    </Typography.Title>
                </div>

                {showVerifyCode ? renderVerifyCodeInput() : renderEmailInput()}
            </Spin>
        </Card>
    );

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            width: '100%',
        }}>
            {renderContent()}
        </div>
    );
};

export default Login; 