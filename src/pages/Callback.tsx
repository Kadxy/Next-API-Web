import { FC, useEffect, useRef, useState } from 'react';
import { Button, Card, Space, Toast, Typography } from '@douyinfe/semi-ui';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../lib/context/hooks';
import { Path } from '../lib/constants/paths';
import { getServerApi, handleResponse } from '../api/utils';
import { AuthMethod } from '../interface/auth';
import { getErrorMsg } from '../utils';
import { UserResponseData } from '../api/generated';

// @ts-expect-error ignore svg import error
import CheckIcon from '../assets/icons/check.svg?react';
// @ts-expect-error ignore svg import error
import LinkIcon from '../assets/icons/link.svg?react';
// @ts-expect-error ignore svg import error
import LockIcon from '../assets/icons/lock.svg?react';

const LOGIN_SUCCESS_KEY = 'login_success';

const availablePlatforms = ['github', 'google', 'feishu', 'email'];
const availableActions = ['login', 'bind'];

const Callback: FC = () => {
    const { user, setUser, token, setToken, initialized } = useAuth();
    const navigate = useNavigate();
    const { platform, action } = useParams<{ platform: string; action: string }>();
    const processedRef = useRef<string | null>(null);
    const isProcessingRef = useRef(false);
    const [processedDuration, setProcessedDuration] = useState(0);

    const api = getServerApi();

    useEffect(() => {
        const interval = setInterval(() => {
            setProcessedDuration(processedDuration + 1000);
        }, 1000);

        return () => clearInterval(interval);
    }, [processedDuration]);

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
        const email = urlParams.get('email') || undefined;

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
            if (!availablePlatforms.includes(platform)) {
                Toast.error({ content: 'Invalid login platform', stack: true });
                navigate(Path.LOGIN, { replace: true });
                return;
            }

            if (!availableActions.includes(action)) {
                Toast.error({ content: 'Invalid action type', stack: true });
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
                    Toast.error({ content: 'Please log in first before binding your account', stack: true });
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
                    email: AuthMethod.Email,
                };

                const authMethod = platformMap[platform as keyof typeof platformMap];

                if (action === 'login') {
                    await handleAuthLogin(authMethod, { code, state, email });
                } else {
                    await handleAuthBind(authMethod, { code, state, email });
                }
            } catch (error) {
                Toast.error({ content: getErrorMsg(error, 'Failed to process callback'), stack: true });
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

    // 认证登录处理（包括OAuth和Email）
    const handleAuthLogin = async (platform: AuthMethod, query: { code: string, state: string, email?: string }) => {

        const { code, state, email } = query;
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
                case AuthMethod.Email:
                    if (!email) {
                        Toast.error({ content: 'Email verification failed', stack: true });
                        navigate(Path.LOGIN, { replace: true });
                        return;
                    }
                    await handleResponse(api.authentication.authControllerLogin({
                        requestBody: { code, email }
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
            Toast.error({ content: getErrorMsg(error, 'Login failed'), stack: true });
            navigate(Path.LOGIN, { replace: true });
        }
    };

    // 认证绑定处理（包括OAuth和Email）
    const handleAuthBind = async (platform: AuthMethod, query: { code: string, state: string, email?: string }) => {
        const { code, state } = query;
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
                        onSuccess: (data) => handleBindResponse(data, 'Feishu'),
                        onError: (errorMsg) => {
                            Toast.error({ content: errorMsg, stack: true });
                            navigate(Path.ACCOUNT, { replace: true });
                        }
                    });
                    break;
                case AuthMethod.Email:
                    // 邮箱绑定不需要处理
                    break;
            }
        } catch (error) {
            Toast.error({ content: getErrorMsg(error, 'Binding failed'), stack: true });
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
        Toast.success({ content: 'Login successful', stack: true });
    };

    // 绑定响应处理
    const handleBindResponse = (data: UserResponseData, platform: string) => {
        setUser(data);
        navigate(Path.ACCOUNT, { replace: true });
        Toast.success({ content: `${platform} account bound successfully`, stack: true });
    };

    // 渲染加载界面
    const renderLoadingView = () => (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            width: '100%',
            position: 'fixed',
            top: 0,
            left: 0,
            zIndex: 9999,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #667eea 100%)',
            backgroundSize: '400% 400%',
            animation: 'gradientShift 15s ease infinite',
            overflow: 'hidden'
        }}>
            {/* 背景装饰元素 */}
            <div style={{
                position: 'absolute',
                inset: 0,
                overflow: 'hidden',
                pointerEvents: 'none'
            }}>
                {/* 流动的光效 */}
                <div style={{
                    position: 'absolute',
                    top: '-50%',
                    left: '-50%',
                    width: '200%',
                    height: '200%',
                    background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
                    animation: 'floatLight 20s linear infinite'
                }} />

                {/* 漂浮的气泡 */}
                {[...Array(6)].map((_, i) => (
                    <div key={i} style={{
                        position: 'absolute',
                        bottom: `-${50 + i * 30}px`,
                        left: `${10 + i * 15}%`,
                        width: `${60 + i * 20}px`,
                        height: `${60 + i * 20}px`,
                        borderRadius: '50%',
                        background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.3), rgba(255,255,255,0.05))`,
                        boxShadow: '0 0 20px rgba(255,255,255,0.2)',
                        animation: `floatBubble ${15 + i * 3}s ease-in-out infinite`,
                        animationDelay: `${i * 2}s`
                    }} />
                ))}
            </div>

            {/* 主卡片 - 玻璃态效果 */}
            <Card style={{
                width: '100%',
                maxWidth: 420,
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1), 0 0 100px rgba(255, 255, 255, 0.1) inset',
                padding: '64px 48px',
                borderRadius: '32px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* 卡片内部光效 */}
                <div style={{
                    position: 'absolute',
                    top: '-100%',
                    left: '-100%',
                    width: '300%',
                    height: '300%',
                    background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)',
                    animation: 'shimmer 3s infinite'
                }} />

                <Space vertical spacing={24} align="center" style={{ width: '100%', position: 'relative' }}>
                    {/* 3D 动画加载指示器 */}
                    <div style={{
                        position: 'relative',
                        height: 120,
                        width: 120,
                        margin: '0 auto',
                        perspective: '1000px'
                    }}>
                        {/* 外环 */}
                        <div style={{
                            position: 'absolute',
                            inset: 0,
                            borderRadius: '50%',
                            border: '3px solid transparent',
                            borderTopColor: 'rgba(255,255,255,0.8)',
                            borderRightColor: 'rgba(255,255,255,0.6)',
                            animation: 'rotate3d 2s linear infinite',
                            boxShadow: '0 0 40px rgba(255,255,255,0.5)'
                        }} />

                        {/* 中环 */}
                        <div style={{
                            position: 'absolute',
                            inset: '15px',
                            borderRadius: '50%',
                            border: '2px solid transparent',
                            borderBottomColor: 'rgba(255,255,255,0.7)',
                            borderLeftColor: 'rgba(255,255,255,0.5)',
                            animation: 'rotate3dReverse 1.5s linear infinite',
                            boxShadow: '0 0 30px rgba(255,255,255,0.4)'
                        }} />

                        {/* 内核 */}
                        <div style={{
                            position: 'absolute',
                            inset: '30px',
                            borderRadius: '50%',
                            background: 'radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.2) 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '24px',
                            animation: 'pulse3d 2s ease-in-out infinite',
                            boxShadow: '0 0 40px rgba(255,255,255,0.8), 0 0 80px rgba(255,255,255,0.4)',
                            transform: 'translateZ(20px)'
                        }}>
                            {/* Professional CSS Icon */}
                            <div style={{
                                animation: 'iconFloat 3s ease-in-out infinite',
                                filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.8))',
                                position: 'relative'
                            }}>
                                {action === 'login' ? (
                                    platform === 'email' ? (
                                        // Check icon for email verification
                                        <div style={{
                                            width: '32px',
                                            height: '32px',
                                            color: 'rgba(255,255,255,0.9)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <CheckIcon style={{ width: '100%', height: '100%' }} />
                                        </div>
                                    ) : (
                                        // Lock icon for OAuth login
                                        <div style={{
                                            width: '32px',
                                            height: '32px',
                                            color: 'rgba(255,255,255,0.9)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <LockIcon style={{ width: '100%', height: '100%' }} />
                                        </div>
                                    )
                                ) : (
                                    // Link icon for binding
                                    <div style={{
                                        width: '32px',
                                        height: '32px',
                                        color: 'rgba(255,255,255,0.9)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <LinkIcon style={{ width: '100%', height: '100%' }} />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 粒子效果 */}
                        {[...Array(8)].map((_, i) => (
                            <div key={i} style={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                width: '4px',
                                height: '4px',
                                background: 'rgba(255,255,255,0.9)',
                                borderRadius: '50%',
                                boxShadow: '0 0 10px rgba(255,255,255,0.8)',
                                transform: `rotate(${i * 45}deg) translateX(60px)`,
                                animation: `particleOrbit ${3 + i * 0.1}s linear infinite`
                            }} />
                        ))}
                    </div>

                    <Space vertical spacing={12}>
                        <Typography.Title
                            heading={3}
                            style={{
                                margin: 0,
                                color: '#fff',
                                fontWeight: 600,
                                textShadow: '0 2px 20px rgba(0,0,0,0.1)',
                                letterSpacing: '0.5px'
                            }}
                        >
                            {action === 'login' ? (
                                platform === 'email'
                                    ? 'Verifying your email'
                                    : `Connecting to ${platform?.charAt(0).toUpperCase()}${platform?.slice(1)}`
                            ) : (
                                `Linking ${platform?.charAt(0).toUpperCase()}${platform?.slice(1)} Account`
                            )}
                        </Typography.Title>
                        <Typography.Text
                            style={{
                                color: 'rgba(255,255,255,0.9)',
                                textShadow: '0 1px 10px rgba(0,0,0,0.1)'
                            }}
                        >
                            {processedDuration > 8000 ?
                                'There may be a problem with the request' :
                                processedDuration > 3000 ?
                                    'Just a moment, it will be ready soon' :
                                    'Please wait while we verify your account...'
                            }
                        </Typography.Text>
                    </Space>

                    {/* 优雅的取消按钮 - 延迟显示 */}
                    {processedDuration > 8000 && (
                        <Button
                            size="large"
                            onClick={() => {
                                const destination = action === 'login' ? Path.LOGIN : Path.ACCOUNT;
                                navigate(destination, { replace: true });
                            }}
                            style={{
                                marginTop: 12,
                                background: 'rgba(255,255,255,0.1)',
                                border: '1px solid rgba(255,255,255,0.3)',
                                color: '#fff',
                                padding: '10px 32px',
                                borderRadius: '24px',
                                backdropFilter: 'blur(10px)',
                                WebkitBackdropFilter: 'blur(10px)',
                                transition: 'all 0.3s ease',
                                fontWeight: 500,
                                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                                position: 'relative',
                                overflow: 'hidden',
                                animation: 'fadeInButton 0.5s ease-in-out'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 6px 30px rgba(0,0,0,0.15)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)';
                            }}
                        >
                            <span style={{ position: 'relative', zIndex: 1 }}>
                                Cancel and Return
                            </span>
                        </Button>
                    )}
                </Space>

                <style>{`
                    @keyframes gradientShift {
                        0% { background-position: 0% 50%; }
                        50% { background-position: 100% 50%; }
                        100% { background-position: 0% 50%; }
                    }
                    
                    @keyframes floatLight {
                        0% { transform: rotate(0deg) translate(100px) rotate(0deg); }
                        100% { transform: rotate(360deg) translate(100px) rotate(-360deg); }
                    }
                    
                    @keyframes floatBubble {
                        0% { 
                            transform: translateY(0) translateX(0) scale(0.8);
                            opacity: 0;
                        }
                        10% { opacity: 0.6; }
                        90% { opacity: 0.6; }
                        100% { 
                            transform: translateY(-120vh) translateX(50px) scale(1.2);
                            opacity: 0;
                        }
                    }
                    
                    @keyframes shimmer {
                        0% { transform: translate(-100%, -100%) rotate(45deg); }
                        100% { transform: translate(100%, 100%) rotate(45deg); }
                    }
                    
                    @keyframes rotate3d {
                        0% { transform: rotateX(0deg) rotateY(0deg) rotateZ(0deg); }
                        100% { transform: rotateX(360deg) rotateY(360deg) rotateZ(360deg); }
                    }
                    
                    @keyframes rotate3dReverse {
                        0% { transform: rotateX(0deg) rotateY(0deg) rotateZ(0deg); }
                        100% { transform: rotateX(-360deg) rotateY(-360deg) rotateZ(-360deg); }
                    }
                    
                    @keyframes pulse3d {
                        0%, 100% { 
                            transform: translateZ(20px) scale(1);
                            box-shadow: 0 0 40px rgba(255,255,255,0.8), 0 0 80px rgba(255,255,255,0.4);
                        }
                        50% { 
                            transform: translateZ(30px) scale(1.1);
                            box-shadow: 0 0 60px rgba(255,255,255,1), 0 0 120px rgba(255,255,255,0.6);
                        }
                    }
                    
                    @keyframes iconFloat {
                        0%, 100% { transform: translateY(0) rotate(0deg); }
                        25% { transform: translateY(-5px) rotate(5deg); }
                        75% { transform: translateY(5px) rotate(-5deg); }
                    }
                    
                    @keyframes particleOrbit {
                        0% { 
                            transform: rotate(0deg) translateX(60px) scale(1);
                            opacity: 0;
                        }
                        10% { opacity: 1; }
                        90% { opacity: 1; }
                        100% { 
                            transform: rotate(360deg) translateX(60px) scale(0);
                            opacity: 0;
                        }
                    }
                    
                    @keyframes fadeInOut {
                        0%, 100% { opacity: 0.5; }
                        50% { opacity: 1; }
                    }
                    
                    @keyframes fadeInButton {
                        0% { 
                            opacity: 0; 
                            transform: translateY(20px); 
                        }
                        100% { 
                            opacity: 1; 
                            transform: translateY(0); 
                        }
                    }
                    
                    /* 响应式优化 */
                    @media (max-width: 640px) {
                        .loading-card {
                            max-width: 90%;
                            padding: 48px 32px;
                        }
                    }
                    
                    /* 深色模式支持 */
                    @media (prefers-color-scheme: dark) {
                        .loading-card {
                            background: rgba(0, 0, 0, 0.3);
                            border: 1px solid rgba(255, 255, 255, 0.1);
                        }
                    }
                `}</style>
            </Card>
        </div>
    );

    // 如果正在加载认证状态，显示加载界面
    if (!initialized) {
        return renderLoadingView();
    }

    // 显示处理中界面
    return renderLoadingView();
};

export default Callback; 