import { FC, KeyboardEvent, useEffect, useRef, useState } from 'react';
import { Button, Card, Divider, Input, PinCode, Space, Toast, Typography, Spin } from '@douyinfe/semi-ui';
import Icon, { IconArrowLeft, IconGithubLogo, IconKey, IconMail } from '@douyinfe/semi-icons';
import { Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../lib/context/hooks';
import { Path } from '../lib/constants/paths';
import { getServerApi, parseResponse } from '../api/utils';
// @ts-expect-error handle svg file
import GoogleIcon from '@/assets/icons/google.svg?react';
import { ContextUser } from '../lib/context/AuthContext';


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
                switch (true) {
                    case isGithubCallback:
                        await handleGithubCallback(code, state);
                        break;
                    case isGoogleCallback:
                        await handleGoogleCallback(code, state);
                        break;
                }
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

    // 统一登录成功处理
    const handleLoginSuccess = (data: { user: ContextUser, token: string }) => {
        const { user, token } = data;
        setUser(user);
        setToken(token);
        navigate(from, { replace: true });
        Toast.success({ content: '登录成功' });
    };

    // 发送验证码
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
            console.error('Send verify code error:', error);
        } finally {
            setSendingVerifyCode(false);
        }
    };

    // 验证验证码
    const handleVerifyCode = async (values: { email: string, code: string }) => {
        setIsSubmitting(true);
        try {
            parseResponse(await api.authentication.authControllerLogin({ requestBody: values }), {
                onSuccess: (data) => handleLoginSuccess(data),
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

    // 获取 Github 登录配置
    const handleGithubLogin = async () => {
        try {
            parseResponse(await api.gitHubAuthentication.gitHubAuthControllerGetGithubConfig(), {
                onSuccess: (data) => window.location.href = data.oauthUrl,
                onError: (errorMsg) => Toast.error({ content: errorMsg, stack: true })
            });
        } catch (error) {
            console.error('GitHub login error:', error);
            Toast.error({ content: '获取 Github 登录配置失败', stack: true });
        }
    };

    // 处理 Github 回调
    const handleGithubCallback = async (code: string, state: string): Promise<void> => {
        parseResponse(await api.gitHubAuthentication.gitHubAuthControllerGithubLogin({ requestBody: { code, state } }), {
            onSuccess: (data) => handleLoginSuccess(data),
            onError: (errorMsg) => Toast.error({ content: errorMsg, stack: true })
        });
    };

    // 获取 Google 登录配置
    const handleGoogleLogin = async () => {
        try {
            parseResponse(await api.googleAuthentication.googleAuthControllerGetGoogleConfig(), {
                onSuccess: (data) => window.location.href = data.oauthUrl,
                onError: (errorMsg) => Toast.error({ content: errorMsg, stack: true })
            });
        } catch (error) {
            console.error('Google login error:', error);
            Toast.error({ content: '获取 Google 登录配置失败', stack: true });
        }
    };

    // 处理 Google 回调
    const handleGoogleCallback = async (code: string, state: string): Promise<void> => {
        parseResponse(await api.googleAuthentication.googleAuthControllerGoogleLogin({ requestBody: { code, state } }), {
            onSuccess: (data) => handleLoginSuccess(data),
            onError: (errorMsg) => Toast.error({ content: errorMsg, stack: true })
        });
    };


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


    const renderVerifyCodeInput = () => (
        <>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
                <Button
                    icon={<IconArrowLeft size="large" />}
                    theme="borderless"
                    onClick={backToEmailInput}
                    style={{ marginRight: '12px', color: 'var(--semi-color-primary)' }}
                />
                <Typography.Text
                    style={{ fontSize: '16px', fontWeight: 500 }}>{inputs.email}</Typography.Text>
            </div>
            <Typography.Text type="secondary"
                style={{ display: 'block', marginBottom: '20px', fontSize: '15px' }}>
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
    );

    const renderEmailInput = () => (
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
                onClick={handleGithubLogin}
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
                onClick={handleGoogleLogin}
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
                onClick={() => Toast.info({ content: 'Passkey 登录功能即将上线' })}
            >
                通过 Passkey 登录
            </Button>
        </Space>
    );

    const renderContent = () => (
        <Card
            style={{
                width: '100%',
                maxWidth: 480,
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                padding: '32px',
                borderRadius: '12px',
                transition: 'all 0.3s ease'
            }}>
            <Spin
                tip="正在登录中..."
                size="large"
                spinning={isProcessingCallback}
            >
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <Typography.Title heading={2}
                        style={{ fontSize: '28px', margin: '0 0 8px 0' }}>登录</Typography.Title>
                    <Typography.Text style={{ fontSize: '16px', color: 'var(--semi-color-text-2)' }}>欢迎使用World AI
                        Web</Typography.Text>
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
            padding: '16px'
        }}>
            {renderContent()}
        </div>
    );
};

export default Login; 