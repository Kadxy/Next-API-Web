import { FC, useEffect, useRef, useState } from 'react';
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
import Icon, { IconArrowLeft, IconGithubLogo, IconMail } from '@douyinfe/semi-icons';
import { Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../lib/context/hooks';
import { Path } from '../lib/constants/paths';
import { getServerApi, handleResponse } from '../api/utils';
// @ts-expect-error handle svg file
import GoogleIcon from '@/assets/icons/google.svg?react';
// @ts-expect-error handle svg file
import PasskeyIcon from '@/assets/icons/passkey_white.svg?react';
// @ts-expect-error handle svg file
import FeishuIcon from '@/assets/icons/feishu.svg?react';
import { startAuthentication, PublicKeyCredentialRequestOptionsJSON } from '@simplewebauthn/browser';
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
    }
}

const defaultLoadingState = {
    [AuthMethod.Email]: false,
    [AuthMethod.Github]: false,
    [AuthMethod.Google]: false,
    [AuthMethod.Feishu]: false,
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
    const [emailSignInStep, setEmailSignInStep] = useState<'none' | 'email' | 'code'>('none');
    const [resendTime, setResendTime] = useState(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // 登录准备状态（禁用按钮）
    const [preparing, setPreparing] = useState<Record<AuthMethod, boolean>>(defaultLoadingState);

    // 登录处理状态（Card 的 loading 状态）
    const [processing, setProcessing] = useState<Record<AuthMethod, boolean>>(defaultLoadingState);

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

        try {
            setPreparing({ ...preparing, [AuthMethod.Email]: true });
            await handleResponse(api.authentication.authControllerSendEmailLoginCode({ requestBody: { email: inputs.email } }), {
                onSuccess: () => {
                    setResendTime(60);
                    setEmailSignInStep('code');
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

    // Passkey 认证流程
    const handlePasskeyAuth = async (email?: string, browserAutofill = false) => {
        if (Object.values(preparing).some(Boolean)) {
            return;
        }

        if (browserAutofill) {
            setPreparing({ ...preparing, [AuthMethod.Passkey]: true });
        }

        setPreparing({ ...preparing, [AuthMethod.Passkey]: true });
        const passkeyApi =
            email ? getServerApi().passkeyAuthentication.passkeyControllerGenerateAuthenticationOptionsByEmail({ email })
                : getServerApi().passkeyAuthentication.passkeyControllerGenerateAuthenticationOptions();

        try {
            // 1. 从服务器获取认证选项
            await handleResponse(
                passkeyApi, {
                onSuccess: async (data) => {
                    if (email && !data) {
                        await sendVerifyCode();
                        return;
                    } else if (!email && !data) {
                        Toast.error({ content: 'No passkey available', stack: true });
                        return;
                    }

                    const { options: optionsJSON, state } = data;

                    // 2. 如果有 email 且有可用的 passkey，先询问用户
                    if (email && optionsJSON) {
                        // 重置准备状态，因为用户需要先选择
                        setPreparing({ ...preparing, [AuthMethod.Passkey]: false });

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
                                    await performPasskeyAuthentication(optionsJSON, state);
                                },
                                onCancel: async () => {
                                    resolve();
                                    // 切换到邮箱验证码流程
                                    await sendVerifyCode();
                                }
                            });
                        });
                    }


                    // 3. 没有 email 或没有可用的 passkey，直接进行认证
                    await performPasskeyAuthentication(optionsJSON, state, browserAutofill);
                },
                onError: (errorMsg) => {
                    Toast.error({ content: errorMsg, stack: true });
                }
            });
        } catch (error) {
            Toast.error({ content: getErrorMsg(error, '认证失败'), stack: true });
        } finally {
            if (!browserAutofill) {
                setPreparing({ ...preparing, [AuthMethod.Passkey]: false });
                // 无论是否成功，都要重置状态
                setPreparing({ ...preparing, [AuthMethod.Passkey]: false });
                setProcessing({ ...processing, [AuthMethod.Passkey]: false });
                setPasskeyWaiting(false);
            }
        }
    };

    // 执行 Passkey 认证
    const performPasskeyAuthentication = async (optionsJSON: PublicKeyCredentialRequestOptionsJSON, state: string, browserAutofill = false) => {
        try {
            if (!browserAutofill) {
                setPasskeyWaiting(true);
            }

            // 启动认证流程，让用户选择他们的 passkey
            const authResponse = await startAuthentication({
                optionsJSON: optionsJSON,
                useBrowserAutofill: browserAutofill,
            });

            if (!browserAutofill) {
                setPasskeyWaiting(false);
                setProcessing({ ...processing, [AuthMethod.Passkey]: true });
            }

            // 将认证响应发送到服务器进行验证
            await handleResponse(api.passkeyAuthentication.passkeyControllerVerifyAuthenticationResponse({
                state,
                requestBody: authResponse
            }), {
                onSuccess: (data) => {
                    if (!browserAutofill) {
                        setProcessing({ ...processing, [AuthMethod.Passkey]: false });
                    }
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
            } else {
                Toast.error({ content: getErrorMsg(error, '认证失败'), stack: true });
            }
        } finally {
            if (!browserAutofill) {
                setPasskeyWaiting(false);
                setPreparing({ ...preparing, [AuthMethod.Passkey]: false });
                setProcessing({ ...processing, [AuthMethod.Passkey]: false });
            }
        }
    };

    /* ------------------------------ auth step2 ------------------------------ */

    // 验证邮箱验证码
    const handleVerifyCodeLogin = async (values: { email: string, code: string }) => {
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
                        {emailSignInStep !== 'none' && (
                            <Button
                                icon={<IconArrowLeft />}
                                onClick={() => {
                                    const prevStep = emailSignInStep === 'email' ? 'none' : 'email';
                                    setEmailSignInStep(prevStep);
                                    // 重置倒计时和验证码
                                    if (prevStep === 'none' || prevStep === 'email') {
                                        setResendTime(0);
                                        setInputs({ ...inputs, code: '' });
                                    }
                                }}
                                style={{
                                    backgroundColor: 'var(--semi-color-bg-1)',
                                    color: 'var(--semi-color-text-2)',
                                    alignSelf: 'flex-start',
                                    marginTop: -18
                                }}
                                noHorizontalPadding
                            >
                                Back
                            </Button>
                        )}

                        <Typography.Title
                            heading={3}
                            style={{ width: '100%', marginBottom: 12 }}
                        >
                            Sign in
                        </Typography.Title>

                        {emailSignInStep === 'email' && (
                            <>
                                <Input
                                    size='large'
                                    autoFocus
                                    autoComplete='email webauthn'
                                    prefix={<IconMail size='large' />}
                                    type='email'
                                    placeholder='Enter your email address'
                                    value={inputs.email}
                                    onChange={(value) => setInputs({ ...inputs, email: value })}
                                    onEnterPress={() => sendVerifyCode()}
                                    style={buttonProps.style}
                                />
                                <Button
                                    {...buttonProps}
                                    type="primary"
                                    theme='light'
                                    onClick={async () => {
                                        await handlePasskeyAuth(inputs.email)
                                    }}
                                    loading={preparing[AuthMethod.Email]}
                                    disabled={!inputs.email}
                                >
                                    Continue
                                </Button>
                            </>
                        )}
                        {emailSignInStep === 'code' && (
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
                                        onComplete={(value) => handleVerifyCodeLogin({
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
                        {emailSignInStep === 'none' && (
                            <Space vertical spacing={8} style={{ width: '100%' }}>
                                <Button
                                    {...buttonProps}
                                    type="primary"
                                    theme='solid'
                                    onClick={async () => await handlePasskeyAuth()}
                                    icon={<Icon svg={<PasskeyIcon />} />}
                                    loading={preparing[AuthMethod.Passkey]}
                                >
                                    {passkeyWaiting ?
                                        'Waiting for input...'
                                        // 'Waiting for input from browser interaction...'
                                        :
                                        'Sign in with Passkey'
                                    }
                                </Button>
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
                                    Continue with Feishu
                                </Button>
                                <Collapsible isOpen={showMoreOptions} style={{ width: '100%' }}>
                                    <Space vertical spacing={8} style={{ width: '100%' }}>
                                        <Button
                                            {...buttonProps}
                                            icon={<Icon svg={<GoogleIcon />} />}
                                            onClick={() => handleOauthLoginClick(AuthMethod.Google)}
                                            loading={preparing[AuthMethod.Google]}
                                        >
                                            Continue with Google
                                        </Button>
                                        <Button
                                            {...buttonProps}
                                            icon={<IconGithubLogo size='large' style={{ color: '#000' }} />}
                                            onClick={() => handleOauthLoginClick(AuthMethod.Github)}
                                            loading={preparing[AuthMethod.Github]}
                                        >
                                            Continue with GitHub
                                        </Button>
                                        <Button
                                            {...buttonProps}
                                            icon={<IconMail size='large' />}
                                            onClick={async () => {
                                                setEmailSignInStep('email');
                                                await handlePasskeyAuth();
                                            }}
                                            loading={preparing[AuthMethod.Email]}
                                        >
                                            Continue with Email&nbsp;&nbsp;
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