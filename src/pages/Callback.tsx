import { FC, useEffect, useRef } from 'react';
import { Button, Card, Space, Spin, Toast, Typography } from '@douyinfe/semi-ui';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../lib/context/hooks';
import { Path } from '../lib/constants/paths';
import { getServerApi, handleResponse } from '../api/utils';
import { AuthMethod } from '../interface/auth';
import { getErrorMsg } from '../utils';
import { UserResponseData } from '../api/generated';

const LOGIN_SUCCESS_KEY = 'login_success';

const Callback: FC = () => {
    const { user, setUser, token, setToken, initialized } = useAuth();
    const navigate = useNavigate();
    const { platform, action } = useParams<{ platform: string; action: string }>();
    const processedRef = useRef<string | null>(null);
    const isProcessingRef = useRef(false);

    const api = getServerApi();

    useEffect(() => {
        // 如果没有必需的路径参数，跳过
        if (!platform || !action) {
            return;
        }

        // 如果正在处理，跳过
        if (isProcessingRef.current) {
            return;
        }

        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');

        // 如果没有必需的查询参数，跳过
        if (!code || !state) {
            return;
        }

        // 创建唯一标识符
        const callbackId = `${platform}-${action}-${code}`;

        // 防止重复处理
        if (processedRef.current === callbackId) {
            return;
        }

        const handleCallback = async () => {
            // 设置处理标志
            isProcessingRef.current = true;
            processedRef.current = callbackId;

            // 验证平台和操作
            if (!['github', 'google', 'feishu'].includes(platform)) {
                Toast.error({ content: '无效的登录平台', stack: true });
                navigate(Path.LOGIN, { replace: true });
                return;
            }

            if (!['login', 'bind'].includes(action)) {
                Toast.error({ content: '无效的操作类型', stack: true });
                navigate(Path.LOGIN, { replace: true });
                return;
            }

            // 对于绑定操作，需要等待认证状态加载完成并检查登录状态
            if (action === 'bind') {
                if (!initialized) {
                    // 重置处理标志，等待下次检查
                    isProcessingRef.current = false;
                    processedRef.current = null;
                    return;
                }

                if (!user || !token) {
                    Toast.error({ content: '请先登录后再进行账户绑定', stack: true });
                    navigate(Path.LOGIN, { replace: true });
                    return;
                }
            }

            try {
                // 根据平台和操作调用相应的API
                const platformMap = {
                    github: AuthMethod.Github,
                    google: AuthMethod.Google,
                    feishu: AuthMethod.Feishu,
                };

                const authMethod = platformMap[platform as keyof typeof platformMap];

                if (action === 'login') {
                    await handleOauthLogin(authMethod, code, state);
                } else {
                    await handleOauthBind(authMethod, code, state);
                }
            } catch (error) {
                Toast.error({ content: getErrorMsg(error, '处理回调失败'), stack: true });
                if (action === 'login') {
                    navigate(Path.LOGIN, { replace: true });
                } else {
                    navigate(Path.ACCOUNT, { replace: true });
                }
            }
        };

        handleCallback();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [platform, action, user, token, initialized, navigate]);

    // OAuth 登录处理
    const handleOauthLogin = async (platform: AuthMethod, code: string, state: string) => {
        try {
            switch (platform) {
                case AuthMethod.Github:
                    await handleResponse(api.gitHubAuthentication.gitHubAuthControllerGithubLogin({
                        requestBody: { code, state }
                    }), {
                        onSuccess: (data) => handleLoginResponse(data),
                        onError: (errorMsg) => {
                            Toast.error({ content: errorMsg, stack: true });
                            navigate(Path.LOGIN, { replace: true });
                        }
                    });
                    break;
                case AuthMethod.Google:
                    await handleResponse(api.googleAuthentication.googleAuthControllerGoogleLogin({
                        requestBody: { code, state }
                    }), {
                        onSuccess: (data) => handleLoginResponse(data),
                        onError: (errorMsg) => {
                            Toast.error({ content: errorMsg, stack: true });
                            navigate(Path.LOGIN, { replace: true });
                        }
                    });
                    break;
                case AuthMethod.Feishu:
                    await handleResponse(api.feishuAuthentication.feishuAuthControllerFeishuLogin({
                        requestBody: { code, state }
                    }), {
                        onSuccess: (data) => handleLoginResponse(data),
                        onError: (errorMsg) => {
                            Toast.error({ content: errorMsg, stack: true });
                            navigate(Path.LOGIN, { replace: true });
                        }
                    });
                    break;
            }
        } catch (error) {
            Toast.error({ content: getErrorMsg(error, '登录失败'), stack: true });
            navigate(Path.LOGIN, { replace: true });
        }
    };

    // OAuth 绑定处理
    const handleOauthBind = async (platform: AuthMethod, code: string, state: string) => {
        try {
            switch (platform) {
                case AuthMethod.Github:
                    await handleResponse(api.gitHubAuthentication.gitHubAuthControllerGithubBind({
                        requestBody: { code, state }
                    }), {
                        onSuccess: (data) => handleBindResponse(data, 'GitHub'),
                        onError: (errorMsg) => {
                            Toast.error({ content: errorMsg, stack: true });
                            navigate(Path.ACCOUNT, { replace: true });
                        }
                    });
                    break;
                case AuthMethod.Google:
                    await handleResponse(api.googleAuthentication.googleAuthControllerGoogleBind({
                        requestBody: { code, state }
                    }), {
                        onSuccess: (data) => handleBindResponse(data, 'Google'),
                        onError: (errorMsg) => {
                            Toast.error({ content: errorMsg, stack: true });
                            navigate(Path.ACCOUNT, { replace: true });
                        }
                    });
                    break;
                case AuthMethod.Feishu:
                    await handleResponse(api.feishuAuthentication.feishuAuthControllerFeishuBind({
                        requestBody: { code, state }
                    }), {
                        onSuccess: (data) => handleBindResponse(data, '飞书'),
                        onError: (errorMsg) => {
                            Toast.error({ content: errorMsg, stack: true });
                            navigate(Path.ACCOUNT, { replace: true });
                        }
                    });
                    break;
            }
        } catch (error) {
            Toast.error({ content: getErrorMsg(error, '绑定失败'), stack: true });
            navigate(Path.ACCOUNT, { replace: true });
        }
    };

    // 登录响应处理
    const handleLoginResponse = (data: { user: UserResponseData, token: string }) => {
        const { user, token } = data;
        setUser(user);
        setToken(token);

        // 通知其他标签页
        localStorage.setItem(LOGIN_SUCCESS_KEY, Date.now().toString());

        navigate(Path.ROOT, { replace: true });
        Toast.success({ content: '登录成功', stack: true });
    };

    // 绑定响应处理
    const handleBindResponse = (data: UserResponseData, platform: string) => {
        setUser(data);
        navigate(Path.ACCOUNT, { replace: true });
        Toast.success({ content: `${platform} 账户绑定成功`, stack: true });
    };

    // 渲染加载界面
    const renderLoadingView = (message: string) => (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            width: '100%',
            position: 'fixed',
            top: 0,
            left: 0,
            zIndex: 9999
        }}>
            <Card style={{
                width: '100%',
                maxWidth: 400,
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                padding: '48px',
                borderRadius: '16px',
                border: 'none',
                textAlign: 'center'
            }}>
                <Space vertical spacing={24} align="center" style={{ width: '100%' }}>
                    {/* 动画加载指示器 */}
                    <div style={{ position: 'relative', height: 80 }}>
                        <Spin size="large" />
                        <div style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            fontSize: '24px',
                            animation: 'pulse 2s ease-in-out infinite'
                        }}>
                            🔐
                        </div>
                    </div>

                    <Space vertical spacing={8}>
                        <Typography.Title heading={4} style={{ margin: 0 }}>
                            {message}
                        </Typography.Title>
                        <Typography.Text type="tertiary">
                            请稍候，正在安全地处理您的请求
                        </Typography.Text>
                    </Space>

                    {/* 进度提示 */}
                    <div style={{ width: '100%' }}>
                        <div style={{
                            width: '100%',
                            height: 4,
                            background: 'var(--semi-color-fill-2)',
                            borderRadius: 2,
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                height: '100%',
                                background: 'var(--semi-color-primary)',
                                borderRadius: 2,
                                animation: 'progress 2s ease-in-out infinite'
                            }} />
                        </div>
                    </div>

                    {/* 取消按钮 */}
                    <Button
                        type="tertiary"
                        size="small"
                        onClick={() => {
                            const destination = action === 'login' ? Path.LOGIN : Path.ACCOUNT;
                            navigate(destination, { replace: true });
                        }}
                        style={{ marginTop: 8 }}
                    >
                        取消并返回
                    </Button>
                </Space>

                <style>{`
                    @keyframes pulse {
                        0%, 100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                        50% { opacity: 0.8; transform: translate(-50%, -50%) scale(1.1); }
                    }
                    @keyframes progress {
                        0% { width: 0%; transform: translateX(0); }
                        50% { width: 100%; transform: translateX(0); }
                        100% { width: 100%; transform: translateX(100%); }
                    }
                `}</style>
            </Card>
        </div>
    );

    // 如果正在加载认证状态，显示加载界面
    if (!initialized) {
        return renderLoadingView('正在验证登录状态');
    }

    // 显示处理中界面
    return renderLoadingView(action === 'login' ? '正在处理登录' : '正在处理账户绑定');
};

export default Callback; 