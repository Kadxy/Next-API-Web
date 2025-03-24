import { FC, KeyboardEvent, useEffect, useRef, useState } from 'react';
import { Button, Card, Divider, Input, PinCode, Space, Toast, Typography, Spin } from '@douyinfe/semi-ui';
import Icon, { IconArrowLeft, IconGithubLogo, IconMail, IconLock } from '@douyinfe/semi-icons';
import { Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../lib/context/hooks';
import { Path } from '../lib/constants/paths';
import { getServerApi, parseResponse } from '../api/utils';
// @ts-expect-error handle svg file
import GoogleIcon from '@/assets/icons/google.svg?react';
import { startAuthentication } from '@simplewebauthn/browser';
import { UserResponseData } from '../api/generated';

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

enum LoginMethod {
    Email,
    Github,
    Google,
    Passkey
};

const Login: FC = () => {
    const { user, setUser, token, setToken, isLoading: isAuthLoading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();
    const from = location.state?.from?.pathname || Path.ROOT;
    const [inputs, setInputs] = useState({ email: '', code: '' });
    const [showVerifyCode, setShowVerifyCode] = useState(false);
    const [countdown, setCountdown] = useState(0);

    // 登录准备状态（禁用按钮）
    const [preparing, setPreparing] = useState<Record<LoginMethod, boolean>>({ [LoginMethod.Email]: false, [LoginMethod.Github]: false, [LoginMethod.Google]: false, [LoginMethod.Passkey]: false });

    // 登录处理状态（Card 的 loading 状态）
    const [processing, setProcessing] = useState<Record<LoginMethod, boolean>>({ [LoginMethod.Email]: false, [LoginMethod.Github]: false, [LoginMethod.Google]: false, [LoginMethod.Passkey]: false });

    // 处理过的 OAuth 回调验证码
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
            // 如果正在处理，不处理
            if (Object.values(processing).some(Boolean)) return;

            const isGithubCallback = searchParams.get('github_callback') === '1';
            const isGoogleCallback = searchParams.get('google_callback') === '1';

            // 如果既不是 Github 也不是 Google 回调，不处理
            if (!isGithubCallback && !isGoogleCallback) return;

            const code = searchParams.get('code');
            const state = searchParams.get('state');

            // 如果没有 code 或 state，不处理
            if (!code || !state) return;

            // 如果已经处理过，不处理
            if (processedCode.current === code) return;

            // 处理 Github 或 Google 回调
            const platform = isGithubCallback ? LoginMethod.Github : LoginMethod.Google;

            // 清空搜索参数
            setSearchParams({});

            // 记录处理过的 code，防止重复处理
            processedCode.current = code;

            // 处理回调
            await handleOauthCallback(platform, code, state);
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

        try {
            setPreparing({ ...preparing, [LoginMethod.Email]: true });
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
            setPreparing({ ...preparing, [LoginMethod.Email]: false });
        }
    };

    // 通用 OAuth 登录前处理
    const handleOauthLoginClick = async (platform: LoginMethod.Github | LoginMethod.Google) => {
        setPreparing({ ...preparing, [platform]: true });
        try {
            switch (platform) {
                case LoginMethod.Github:
                    parseResponse(await api.gitHubAuthentication.gitHubAuthControllerGetGithubConfig(), {
                        onSuccess: (data) => window.location.href = data.oauthUrl,
                        onError: (errorMsg) => Toast.error({ content: errorMsg, stack: true })
                    });
                    break;
                case LoginMethod.Google:
                    parseResponse(await api.googleAuthentication.googleAuthControllerGetGoogleConfig(), {
                        onSuccess: (data) => window.location.href = data.oauthUrl,
                        onError: (errorMsg) => Toast.error({ content: errorMsg, stack: true })
                    });
                    break;
                default:
                    Toast.error({ content: '无效的登录方式' });
            }
        } catch (error) {
            Toast.error({ content: '登录失败: ' + (error instanceof Error ? error.message : '未知错误') });
            console.error('Login error:', error);
            // 只在错误时重置状态，因为如果成功，就重定向走了，不需要重置
            // 如果在 finally 中重置，会导致还没有重定向完成就解除 loading 状态
            setPreparing({ ...preparing, [platform]: false });
        }
    };

    // Passkey 登录
    const handlePasskeyLogin = async () => {
        setPreparing({ ...preparing, [LoginMethod.Passkey]: true });
        const passkeyApi = getServerApi().passkeyAuthentication;
        try {
            // 1. 从服务器获取认证选项
            const optionsResponse = await passkeyApi.passkeyControllerGenerateAuthenticationOptions();
            const { success: optionsSuccess, data: optionsData, msg: optionsMsg } = optionsResponse;
            if (!optionsSuccess) {
                throw new Error(optionsMsg);
            }
            const { options: optionsJSON, state } = optionsData;

            // 2. 启动认证流程，让用户选择他们的 passkey
            const authResponse = await startAuthentication({ optionsJSON });

            // 3. 将认证响应发送到服务器进行验证
            setPreparing({ ...preparing, [LoginMethod.Passkey]: false });
            setProcessing({ ...processing, [LoginMethod.Passkey]: true });
            const response = await passkeyApi.passkeyControllerVerifyAuthenticationResponse({ state, requestBody: authResponse });

            // 4. 处理服务器响应
            const { success: responseSuccess, data: responseData, msg: responseMsg } = response;
            if (!responseSuccess) {
                throw new Error(responseMsg);
            } else {
                setProcessing({ ...processing, [LoginMethod.Passkey]: false });
                handleLoginResponse(responseData);
            }
        } catch (error) {
            Toast.error({ content: '认证失败: ' + (error instanceof Error ? error.message : '未知错误') });
        } finally {
            // 无论是否成功，都要重置状态
            setPreparing({ ...preparing, [LoginMethod.Passkey]: false });
            setProcessing({ ...processing, [LoginMethod.Passkey]: false });
        }
    };

    /* ------------------------------ auth step2 ------------------------------ */

    // 验证邮箱验证码
    const handleVerifyCodeLogin = async (values: { email: string, code: string }) => {
        setProcessing({ ...processing, [LoginMethod.Email]: true });
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
            setProcessing({ ...processing, [LoginMethod.Email]: false });
        }
    };

    // 通用 OAuth 登录回调
    const handleOauthCallback = async (platform: LoginMethod.Github | LoginMethod.Google, code: string, state: string) => {
        try {
            setProcessing({ ...processing, [platform]: true });
            switch (platform) {
                case LoginMethod.Github:
                    parseResponse(await api.gitHubAuthentication.gitHubAuthControllerGithubLogin({ requestBody: { code, state } }), {
                        onSuccess: (data) => handleLoginResponse(data),
                        onError: (errorMsg) => Toast.error({ content: errorMsg, stack: true })
                    });
                    break;
                case LoginMethod.Google:
                    parseResponse(await api.googleAuthentication.googleAuthControllerGoogleLogin({ requestBody: { code, state } }), {
                        onSuccess: (data) => handleLoginResponse(data),
                        onError: (errorMsg) => Toast.error({ content: errorMsg, stack: true })
                    });
                    break;
            }
        } catch (error) {
            Toast.error({ content: '登录失败: ' + (error instanceof Error ? error.message : '未知错误') });
        } finally {
            setProcessing({ ...processing, [platform]: false });
        }
    };

    /* ------------------------------ auth step3 ------------------------------ */

    // 通用登录处理
    const handleLoginResponse = (data: { user: UserResponseData, token: string }) => {
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
                    loading={processing[LoginMethod.Email]}
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
                loading={processing[LoginMethod.Email]}
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
                icon={<IconMail />}
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
                loading={preparing[LoginMethod.Email]}
                disabled={!preparing[LoginMethod.Email] && Object.values(preparing).some(Boolean)}
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
                icon={<IconLock />}
                loading={preparing[LoginMethod.Passkey]}
                disabled={!preparing[LoginMethod.Passkey] && Object.values(preparing).some(Boolean)}
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
                onClick={() => handleOauthLoginClick(LoginMethod.Github)}
                loading={preparing[LoginMethod.Github]}
                disabled={!preparing[LoginMethod.Github] && Object.values(preparing).some(Boolean)}
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
                onClick={() => handleOauthLoginClick(LoginMethod.Google)}
                loading={preparing[LoginMethod.Google]}
                disabled={!preparing[LoginMethod.Google] && Object.values(preparing).some(Boolean)}
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
                tip="正在登录..."
                size="large"
                spinning={Object.values(processing).some(Boolean)}
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