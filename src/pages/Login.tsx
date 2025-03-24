import { FC, useEffect, useRef, useState } from 'react';
import { Button, Card, Divider, Input, PinCode, Space, Toast, Typography, Spin } from '@douyinfe/semi-ui';
import Icon, { IconArrowLeft, IconGithubLogo, IconMail, IconSend } from '@douyinfe/semi-icons';
import { Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../lib/context/hooks';
import { Path } from '../lib/constants/paths';
import { getServerApi, parseResponse } from '../api/utils';
// @ts-expect-error handle svg file
import GoogleIcon from '@/assets/icons/google.svg?react';
// @ts-expect-error handle svg file
import PasskeyIcon from '@/assets/icons/passkey_16.svg?react';
import { startAuthentication } from '@simplewebauthn/browser';
import { UserResponseData } from '../api/generated';
import { ValidateStatus as InputValidateStatus } from '@douyinfe/semi-ui/lib/es/input';
import { getErrorMsg } from '../utils';

const borderRadius = '10px';

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
    const [validateStatus, setValidateStatus] = useState<InputValidateStatus>('default');
    const [showVerifyCode, setShowVerifyCode] = useState(false);

    // 登录准备状态（禁用按钮）
    const [preparing, setPreparing] = useState<Record<LoginMethod, boolean>>({ [LoginMethod.Email]: false, [LoginMethod.Github]: false, [LoginMethod.Google]: false, [LoginMethod.Passkey]: false });

    // 登录处理状态（Card 的 loading 状态）
    const [processing, setProcessing] = useState<Record<LoginMethod, boolean>>({ [LoginMethod.Email]: false, [LoginMethod.Github]: false, [LoginMethod.Google]: false, [LoginMethod.Passkey]: false });

    // 处理过的 OAuth 回调验证码
    const processedCode = useRef<string | null>(null);

    const api = getServerApi();

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
        if (!inputs.email) {
            setValidateStatus('error');
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inputs.email)) {
            Toast.error({ content: '请输入有效的邮箱地址', stack: true });
            setValidateStatus('error');
            return;
        }

        try {
            setPreparing({ ...preparing, [LoginMethod.Email]: true });
            parseResponse(await api.authentication.authControllerSendEmailLoginCode({ requestBody: { email: inputs.email } }), {
                onSuccess: () => {
                    setShowVerifyCode(true);
                    Toast.success({ content: '验证码已发送', stack: true });
                },
                onError: (errorMsg) => Toast.error({ content: errorMsg, stack: true })
            });
        } catch (error) {
            Toast.error({ content: getErrorMsg(error, '发送验证码失败') });
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
            Toast.error({ content: getErrorMsg(error, '登录失败') });
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
            Toast.error({ content: getErrorMsg(error, '认证失败') });
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
                    Toast.error({ content: errorMsg, stack: true });
                }
            });
        } catch (error) {
            Toast.error({ content: getErrorMsg(error, '登录失败') });
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
            Toast.error({ content: getErrorMsg(error, '登录失败') });
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

    // 返回邮箱输入
    const backToEmailInput = () => {
        setShowVerifyCode(false);
        setInputs({ ...inputs, code: '' });
    };

    /* ------------------------------ render components ------------------------------ */

    // 渲染验证码输入
    const renderVerifyCodeInput = () => (
        <Space
            vertical
            spacing='medium'
            align='start'
            style={{ width: '100%' }}
        >
            <Space spacing={2}>
                <Button
                    icon={<IconArrowLeft />}
                    theme="borderless"
                    onClick={backToEmailInput}
                />
                <Typography.Text strong>
                    {inputs.email}
                </Typography.Text>
            </Space>
            <Typography.Text type="secondary">
                请输入邮箱验证码（10分钟内有效）
            </Typography.Text>
            <PinCode
                size="large"
                autoFocus
                format={/[A-Z]|[0-9]|[a-z]/}
                onComplete={(value) => handleVerifyCodeLogin({ email: inputs.email, code: value })}
                onChange={(value) => setInputs({ ...inputs, code: value.toUpperCase() })}
                value={inputs.code}
            />
        </Space>
    );

    // 渲染邮箱输入
    const renderEmailInput = () => (
        <Space vertical spacing='medium' style={{ width: '100%' }}>
            <Input
                size="large"
                placeholder="邮箱地址"
                prefix={<IconMail style={{ color: 'var(--semi-color-text-2)' }} />}
                style={{ borderRadius }}
                value={inputs.email}
                validateStatus={validateStatus}
                onChange={(value) => setInputs({ ...inputs, email: value })}
                autoFocus
                autoComplete="email"
            />
            {inputs.email ? (
                <Button
                    size="large"
                    block
                    icon={<IconSend />}
                    style={{ borderRadius }}
                    onClick={sendVerifyCode}
                    loading={preparing[LoginMethod.Email]}
                    disabled={!preparing[LoginMethod.Email] && Object.values(preparing).some(Boolean)}
                >
                    发送验证码
                </Button>
            ) : (
                <Button
                    size="large"
                    block
                    style={{ borderRadius }}
                    onClick={handlePasskeyLogin}
                    icon={<Icon svg={<PasskeyIcon />} />}
                    loading={preparing[LoginMethod.Passkey]}
                    disabled={!preparing[LoginMethod.Passkey] && Object.values(preparing).some(Boolean)}
                >
                    使用通行密钥登录
                </Button>
            )}
            <Divider>或</Divider>
            <Button
                size="large"
                type="tertiary"
                block

                style={{ borderRadius }}
                icon={<IconGithubLogo style={{ color: '#000000' }} />}
                onClick={() => handleOauthLoginClick(LoginMethod.Github)}
                loading={preparing[LoginMethod.Github]}
                disabled={!preparing[LoginMethod.Github] && Object.values(preparing).some(Boolean)}
            >
                使用 GitHub 继续
            </Button>
            <Button
                size="large"
                type="tertiary"
                block
                style={{ borderRadius }}
                icon={<Icon svg={<GoogleIcon />} />}
                onClick={() => handleOauthLoginClick(LoginMethod.Google)}
                loading={preparing[LoginMethod.Google]}
                disabled={!preparing[LoginMethod.Google] && Object.values(preparing).some(Boolean)}
            >
                使用 Google 继续
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
                <Space vertical spacing='loose' style={{ width: '100%' }}>
                    <Typography.Title heading={2}>登录/注册</Typography.Title>
                    {showVerifyCode ? renderVerifyCodeInput() : renderEmailInput()}
                </Space>
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