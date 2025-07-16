import { CSSProperties, FC, useEffect, useRef, useState } from 'react';
import {
    Button,
    Card,
    Collapsible,
    Divider,
    Input,
    Modal,
    PinCode,
    Space,
    Spin,
    Toast,
    Typography
} from '@douyinfe/semi-ui';
import Icon, { IconGithubLogo, IconMail } from '@douyinfe/semi-icons';
import { Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../lib/context/hooks';
import { Path } from '../lib/constants/paths';
import { getServerApi, handleResponse } from '../api/utils';
// @ts-expect-error handle svg file
import GoogleIcon from '@/assets/icons/google.svg?react';
// @ts-expect-error handle svg file
import PasskeyIcon from '@/assets/icons/passkey.svg?react';
// @ts-expect-error handle svg file
import FeishuIcon from '@/assets/icons/feishu.svg?react';
// @ts-expect-error handle svg file
import MicrosoftIcon from '@/assets/icons/microsoft.svg?react';
import {
    browserSupportsWebAuthn,
    browserSupportsWebAuthnAutofill,
    PublicKeyCredentialRequestOptionsJSON,
    startAuthentication
} from '@simplewebauthn/browser';
import { UserResponseData } from '../api/generated';
import { getErrorMsg, isValidEmail } from '../utils';
import { AuthMethod, OAuthPlatform } from "../interface/auth.ts";
import { ButtonProps } from '@douyinfe/semi-ui/lib/es/button/Button';

const buttonProps: ButtonProps = {
    block: true,
    theme: 'outline',
    type: 'tertiary',
    style: {
        borderRadius: '12px',
        height: '42px',
    } as CSSProperties
}

const buttonTextWrapperStyle: CSSProperties = {
    minWidth: 160,
    textAlign: 'left',
    marginLeft: 8
}

const defaultLoadingState: Record<AuthMethod, boolean> = {
    [AuthMethod.Email]: false,
    [AuthMethod.Github]: false,
    [AuthMethod.Google]: false,
    [AuthMethod.Feishu]: false,
    [AuthMethod.Microsoft]: false,
    [AuthMethod.Passkey]: false,
}

const LOGIN_SUCCESS_KEY = 'login_success';

const Login: FC = () => {
    const api = getServerApi();
    const { user, setUser, token, setToken, initialized } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const from = location.state?.from?.pathname || Path.ROOT;
    const [inputs, setInputs] = useState({ email: '', code: '' });
    const [passkeyWaiting, setPasskeyWaiting] = useState(false);
    const [showMoreOptions, setShowMoreOptions] = useState(false);

    // email login
    const [showEmailCode, setShowEmailCode] = useState(false);
    const [resendTime, setResendTime] = useState(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // 登录准备状态（禁用按钮）
    const [preparing, setPreparing] = useState<Record<Exclude<AuthMethod, AuthMethod.Passkey>, boolean>>(defaultLoadingState);

    // 登录处理状态（Card 的 loading 状态）
    const [processing, setProcessing] = useState<Record<AuthMethod.Passkey | AuthMethod.Email, boolean>>(defaultLoadingState);

    // passkey auth json
    const [passkeyConfig, setPasskeyConfig] = useState<{
        optionsJSON: PublicKeyCredentialRequestOptionsJSON,
        state: string
    } | null>(null);

    // 监听其他标签页的登录事件
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            // 如果已登录或不是登录成功事件，不处理
            if (token || e.key !== LOGIN_SUCCESS_KEY) return;

            Modal.confirm({
                title: '登录状态改变',
                content: '登录状态已改变，即将刷新页面',
                onOk: () => window.location.reload(),
                cancelButtonProps: { theme: 'borderless' },
                centered: true,
            });
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [navigate, from, token]);

    // 倒计时
    useEffect(() => {
        // 清除之前的定时器
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }

        if (resendTime > 0) {
            timerRef.current = setTimeout(() => setResendTime(resendTime - 1), 1000);
        }

        // 清理函数
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, [resendTime]);

    // 加载 passkey auth config 并检查浏览器是否支持 passkey autofill 如果支持启动 passkey autofill
    useEffect(() => {
        const loadPasskeyConfig = async () => {
            if (!browserSupportsWebAuthn()) {
                return;
            }

            const passkeyApi = getServerApi().passkeyAuthentication.passkeyControllerGenerateAuthenticationOptions();
            await handleResponse(passkeyApi, {
                onSuccess: async (data) => {
                    const { options: optionsJSON, state } = data;
                    setPasskeyConfig({ optionsJSON, state });

                    if (await browserSupportsWebAuthnAutofill()) {
                        performPasskeyAuthentication({ optionsJSON, state }, true);
                    }
                }
            });
        }

        loadPasskeyConfig();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (initialized && token && user) {
        const to = searchParams.get('redirect') || from || Path.ROOT;
        return <Navigate to={to} replace />;
    }

    // 发送邮箱验证码
    const sendVerifyCode = async () => {
        if (!inputs.email) {
            return;
        }

        if (!isValidEmail(inputs.email)) {
            Toast.error({ content: 'Please enter a valid email address', stack: true });
            return;
        }

        setPreparing({ ...preparing, [AuthMethod.Email]: true });
        try {
            await handleResponse(api.authentication.authControllerSendEmailLoginCode({ requestBody: { email: inputs.email } }), {
                onSuccess: () => {
                    setResendTime(60);
                    setShowEmailCode(true);
                    Toast.success({ content: 'Verification code sent', stack: true });
                },
                onError: (errorMsg) => {
                    Toast.error({ content: errorMsg, stack: true });
                }
            });
        } catch (error) {
            Toast.error({ content: getErrorMsg(error, 'Failed to send verification code'), stack: true });
        } finally {
            setPreparing({ ...preparing, [AuthMethod.Email]: false });
        }
    };

    // 通用 OAuth 登录前处理
    const handleOauthLoginClick = async (platform: OAuthPlatform) => {
        if (Object.values(preparing).some(Boolean)) {
            return;
        }

        setPreparing({ ...preparing, [platform]: true });
        try {
            switch (platform) {
                case AuthMethod.Github:
                    await handleResponse(api.gitHubAuthentication.gitHubAuthControllerGetGithubConfig({ action: 'login' }), {
                        onSuccess: (data) => window.location.href = data.oauthUrl,
                        onError: (errorMsg) => {
                            Toast.error({ content: errorMsg, stack: true })
                        }
                    });
                    break;
                case AuthMethod.Google:
                    await handleResponse(api.googleAuthentication.googleAuthControllerGetGoogleConfig({ action: 'login' }), {
                        onSuccess: (data) => window.location.href = data.oauthUrl,
                        onError: (errorMsg) => {
                            Toast.error({ content: errorMsg, stack: true })
                        }
                    });
                    break;
                case AuthMethod.Microsoft:
                    await handleResponse(api.microsoftAuthentication.microsoftAuthControllerGetMicrosoftConfig({ action: 'login' }), {
                        onSuccess: (data) => window.location.href = data.oauthUrl,
                        onError: (errorMsg) => {
                            Toast.error({ content: errorMsg, stack: true })
                        }
                    });
                    break;
                case AuthMethod.Feishu:
                    await handleResponse(api.feishuAuthentication.feishuAuthControllerGetFeishuConfig({ action: 'login' }), {
                        onSuccess: (data) => window.location.href = data.oauthUrl,
                        onError: (errorMsg) => {
                            Toast.error({ content: errorMsg, stack: true })
                        }
                    });
                    break;
                default:
                    Toast.error({ content: '无效的登录方式', stack: true });
            }
        } catch (error) {
            Toast.error({ content: getErrorMsg(error, '登录失败'), stack: true });
            // 只在错误时重置状态，因为如果成功，就重定向走了，不需要重置
            // 如果在 finally 中重置，会导致还没有重定向完成就解除 loading 状态
            setPreparing({ ...preparing, [platform]: false });
        }
    };

    // Email 认证流程(先尝试 passkey 认证，如果失败或者拒绝，则使用邮箱验证码)
    const handleEmailAuth = async () => {
        if (Object.values(preparing).some(Boolean)) {
            return;
        }

        setPreparing({ ...preparing, [AuthMethod.Email]: true });

        const passkeyApi = getServerApi().passkeyAuthentication.passkeyControllerGenerateAuthenticationOptionsByEmail({ email: inputs.email });

        try {
            // 1. 从服务器获取认证选项
            await handleResponse(
                passkeyApi, {
                onSuccess: async (data) => {
                    if (!data) {
                        // 切换到邮箱验证码流程
                        await sendVerifyCode();
                        return;
                    }

                    const { options: optionsJSON, state } = data as {
                        options: PublicKeyCredentialRequestOptionsJSON,
                        state: string
                    };

                    // 2. 如果有 email 且有可用的 passkey，先询问用户
                    if ('allowCredentials' in optionsJSON && optionsJSON.allowCredentials && optionsJSON.allowCredentials.length > 0) {
                        return new Promise<void>((resolve) => {
                            Modal.confirm({
                                title: '使用通行密钥继续',
                                content: '检测到您有可用的通行密钥，是否使用通行密钥登录？',
                                maskClosable: false,
                                centered: true,
                                okText: '使用通行密钥',
                                cancelText: '使用邮箱验证码',
                                onOk: async () => {
                                    resolve();
                                    // 继续 passkey 认证流程
                                    await performPasskeyAuthentication({ optionsJSON, state });
                                },
                                onCancel: async () => {
                                    resolve();
                                    // 切换到邮箱验证码流程
                                    await sendVerifyCode();
                                },
                                closable: false,
                            });
                        });
                    }
                },
                onError: (errorMsg) => {
                    Toast.error({ content: errorMsg, stack: true });
                }
            });
        } catch (error) {
            Toast.error({ content: getErrorMsg(error, '认证失败'), stack: true });
        } finally {
            setPreparing({ ...preparing, [AuthMethod.Email]: false });
        }
    };

    // 执行 Passkey 认证
    const performPasskeyAuthentication = async (
        config: { optionsJSON: PublicKeyCredentialRequestOptionsJSON, state: string } = passkeyConfig as {
            optionsJSON: PublicKeyCredentialRequestOptionsJSON,
            state: string
        },
        browserAutofill = false
    ) => {
        // Cancel the pending WebAuthn request before starting a new one
        // WebAuthnAbortService.cancelCeremony();

        const { optionsJSON, state } = config;

        if (!optionsJSON || !state) {
            Toast.error({ content: 'Failed to get passkey config, please refresh the page and try again', stack: true });
            return;
        }

        try {
            if (!browserAutofill) {
                setPasskeyWaiting(true);
            }

            // 启动认证流程，让用户选择 passkey
            console.log('startAuthentication', optionsJSON, browserAutofill);
            const authResponse = await startAuthentication({
                optionsJSON: optionsJSON,
                useBrowserAutofill: browserAutofill,
            });

            if (!browserAutofill) {
                setPasskeyWaiting(false);
            }

            setProcessing({ ...processing, [AuthMethod.Passkey]: true });

            // 将认证响应发送到服务器进行验证
            await handleResponse(api.passkeyAuthentication.passkeyControllerVerifyAuthenticationResponse({
                state,
                requestBody: authResponse
            }), {
                onSuccess: (data) => {
                    setProcessing({ ...processing, [AuthMethod.Passkey]: false });
                    handleLoginResponse(data)
                },
                onError: (errorMsg) => {
                    Toast.error({ content: errorMsg, stack: true });
                }
            });
        } catch (error) {
            // 用户可能取消了认证
            if (error instanceof Error && error.name === 'NotAllowedError') {
                Toast.info({ content: '认证已取消', stack: true });
            } else if (error instanceof Error && error.name === 'AbortError') {
                return;
            } else {
                Toast.error({ content: getErrorMsg(error, '认证失败'), stack: true });
            }
        } finally {
            if (!browserAutofill) {
                setPasskeyWaiting(false);
            }
            setProcessing({ ...processing, [AuthMethod.Passkey]: false });
        }
    };

    // 验证邮箱验证码
    const verifyEmailCodeAndLogin = async (values: { email: string, code: string }) => {
        if (values.code.length !== 6) {
            Toast.error({ content: 'Please enter a valid verification code', stack: true });
            return;
        }

        setProcessing({ ...processing, [AuthMethod.Email]: true });
        try {
            await handleResponse(api.authentication.authControllerLogin({ requestBody: values }), {
                onSuccess: (data) => handleLoginResponse(data),
                onError: (errorMsg) => {
                    setInputs({ ...inputs, code: '' });
                    Toast.error({ content: errorMsg, stack: true });
                }
            });
        } catch (error) {
            Toast.error({ content: getErrorMsg(error, '登录失败'), stack: true });
        } finally {
            setProcessing({ ...processing, [AuthMethod.Email]: false });
        }
    };


    /* ------------------------------ auth step3 ------------------------------ */

    // 通用登录处理
    const handleLoginResponse = (data: { user: UserResponseData, token: string }) => {
        const { user, token } = data;
        setUser(user);
        setToken(token);

        // 通知其他标签页
        localStorage.setItem(LOGIN_SUCCESS_KEY, Date.now().toString());

        navigate(from, { replace: true });
        Toast.success({ content: '登录成功', stack: true });
    };

    /* ------------------------------ render components ------------------------------ */

    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                width: '100%',
            }}
        >
            <Card
                style={{
                    width: '100%',
                    maxWidth: 400,
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                    borderRadius: '24px',
                    border: 'none'
                }}
                bodyStyle={{
                    padding: '48px 42px',
                }}
            >
                <Spin
                    tip='Verifying...'
                    size='large'
                    spinning={Object.values(processing).some(Boolean)}
                >
                    <Space vertical spacing={'medium'} style={{ width: '100%' }}>
                        <Typography.Title
                            heading={3}
                            style={{ width: '100%', marginBottom: 12 }}
                        >
                            Sign in
                        </Typography.Title>

                        {showEmailCode && (
                            <>
                                <Typography.Text type="secondary">
                                    Enter the verification code sent to&nbsp;
                                    <Typography.Text strong>{inputs.email.slice(0, 1)}*****@******</Typography.Text>
                                </Typography.Text>

                                <div style={{
                                    width: '100%',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    flexDirection: 'column',
                                    alignItems: 'center'
                                }}>
                                    <PinCode
                                        autoFocus
                                        size="large"
                                        format={/[A-Z]|[0-9]|[a-z]/}
                                        onComplete={(value) => verifyEmailCodeAndLogin({
                                            email: inputs.email,
                                            code: value
                                        })}
                                        onChange={(value) => setInputs({ ...inputs, code: value.toUpperCase() })}
                                        value={inputs.code}
                                        style={{ borderRadius: '8px' }}
                                    />
                                </div>

                                <Button
                                    style={{ alignSelf: 'flex-end' }}
                                    onClick={() => resendTime > 0 ? null : sendVerifyCode()}
                                    loading={preparing[AuthMethod.Email]}
                                    disabled={resendTime > 0}
                                >
                                    {resendTime > 0 ? `Resend in ${resendTime}s` : 'Resend code'}
                                </Button>
                            </>
                        )}
                        {!showEmailCode && (
                            <Space vertical style={{ width: '100%' }}>
                                <Space spacing={'medium'} vertical style={{ width: '100%' }}>
                                    <Input
                                        size='large'
                                        autoComplete='email webauthn'
                                        type='email'
                                        placeholder='Enter your email address'
                                        value={inputs.email}
                                        onChange={(value) => setInputs({ ...inputs, email: value })}
                                        onEnterPress={() => sendVerifyCode()}
                                        style={buttonProps.style}
                                        autoFocus={false}
                                    />
                                    {inputs.email ? (
                                        <Button
                                            {...buttonProps}
                                            type="primary"
                                            theme='solid'
                                            onClick={handleEmailAuth}
                                            icon={<IconMail size='large' />}
                                            loading={preparing[AuthMethod.Email]}
                                        >
                                            Continue with Email
                                        </Button>
                                    ) : (
                                        <Button
                                            {...buttonProps}
                                            type="primary"
                                            theme='solid'
                                            onClick={() => performPasskeyAuthentication()}
                                            icon={<Icon svg={<PasskeyIcon />} />}
                                            loading={passkeyWaiting}
                                        >
                                            <div
                                                style={{
                                                    ...buttonTextWrapperStyle,
                                                    fontSize: passkeyWaiting ? 12 : undefined
                                                }}
                                            >
                                                {passkeyWaiting ?
                                                    'Waiting for input from browser interaction'
                                                    :
                                                    'Sign in with Passkey'
                                                }
                                            </div>
                                        </Button>
                                    )}
                                </Space>

                                <Divider
                                    style={{
                                        color: 'var(--semi-color-text-2)',
                                        margin: '12px 0 6px 0',
                                    }}
                                >
                                    OR
                                </Divider>
                                <Button
                                    {...buttonProps}
                                    icon={<Icon svg={<FeishuIcon />} />}
                                    onClick={() => handleOauthLoginClick(AuthMethod.Feishu)}
                                    loading={preparing[AuthMethod.Feishu]}
                                >
                                    <div style={buttonTextWrapperStyle} >
                                        Continue with Feishu
                                    </div>
                                </Button>
                                <Collapsible isOpen={showMoreOptions} style={{ width: '100%' }}>
                                    <Space vertical style={{ width: '100%' }}>
                                        <Button
                                            {...buttonProps}
                                            icon={<IconGithubLogo size='large' style={{ color: '#000' }} />}
                                            onClick={() => handleOauthLoginClick(AuthMethod.Github)}
                                            loading={preparing[AuthMethod.Github]}
                                        >
                                            <div style={buttonTextWrapperStyle} >
                                                Continue with GitHub
                                            </div>
                                        </Button>
                                        <Button
                                            {...buttonProps}
                                            icon={<Icon svg={<GoogleIcon />} />}
                                            onClick={() => handleOauthLoginClick(AuthMethod.Google)}
                                            loading={preparing[AuthMethod.Google]}
                                        >
                                            <div style={buttonTextWrapperStyle} >
                                                Continue with Google
                                            </div>
                                        </Button>
                                        <Button
                                            {...buttonProps}
                                            icon={<Icon svg={<MicrosoftIcon />} />}
                                            onClick={() => handleOauthLoginClick(AuthMethod.Microsoft)}
                                            loading={preparing[AuthMethod.Microsoft]}
                                        >
                                            <div style={buttonTextWrapperStyle} >
                                                Continue with Microsoft
                                            </div>
                                        </Button>
                                    </Space>
                                </Collapsible>
                                {!showMoreOptions && (
                                    <Typography.Text
                                        size='small'
                                        onClick={() => setShowMoreOptions(!showMoreOptions)}
                                        style={{
                                            color: 'var(--semi-color-text-2)',
                                            cursor: 'pointer'
                                        }}
                                        strong
                                    >
                                        More options
                                    </Typography.Text>
                                )}
                            </Space>
                        )}
                    </Space>
                </Spin>
            </Card>
        </div>
    );
};

export default Login; 