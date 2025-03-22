import {FC, useState} from 'react';
import { Form, Button, Toast, Spin, Typography, Card } from '@douyinfe/semi-ui';
import { IconLock, IconUser } from '@douyinfe/semi-icons';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../lib/context/hooks';
import { Path } from '../lib/constants/paths';

const Login: FC = () => {
    const { login, isAuthenticated, isLoading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [formLoading, setFormLoading] = useState(false);

    // 如果已登录，重定向到首页或原来要访问的页面
    if (isAuthenticated) {
        const from = (location.state as { from?: { pathname: string } })?.from?.pathname || Path.HOME;
        return <Navigate to={from} replace />;
    }

    const handleSubmit = async (values: { username: string; password: string }) => {
        setFormLoading(true);
        try {
            const success = await login(values.username, values.password);
            if (success) {
                Toast.success('登录成功');
                const from = (location.state as { from?: { pathname: string } })?.from?.pathname || Path.HOME;
                navigate(from, { replace: true });
            } else {
                Toast.error('登录失败，请检查用户名和密码');
            }
        } catch (error) {
            Toast.error('登录过程中出现错误');
            console.error('Login error:', error);
        } finally {
            setFormLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Spin size="large" tip="加载中..." />
            </div>
        );
    }

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            background: 'var(--semi-color-bg-0)'
        }}>
            <Card style={{ width: 400, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <Typography.Title heading={3}>登录</Typography.Title>
                    <Typography.Text>欢迎使用World AI Web</Typography.Text>
                </div>

                <Form onSubmit={handleSubmit} disabled={formLoading}>
                    <Form.Input
                        field="username"
                        label="用户名"
                        placeholder="请输入用户名"
                        prefix={<IconUser />}
                        rules={[{ required: true, message: '请输入用户名' }]}
                    />

                    <Form.Input
                        field="password"
                        label="密码"
                        type="password"
                        placeholder="请输入密码"
                        prefix={<IconLock />}
                        rules={[
                            { required: true, message: '请输入密码' },
                            { min: 6, message: '密码至少6个字符' }
                        ]}
                    />

                    <div style={{ marginTop: '24px' }}>
                        <Button
                            theme="solid"
                            type="primary"
                            htmlType="submit"
                            loading={formLoading}
                            block
                        >
                            登录
                        </Button>
                    </div>

                    <div style={{ marginTop: '12px', textAlign: 'center' }}>
                        <Typography.Text type="tertiary">
                            提示：任意用户名 + 6位以上密码即可登录
                        </Typography.Text>
                    </div>
                </Form>
            </Card>
        </div>
    );
};

export default Login; 