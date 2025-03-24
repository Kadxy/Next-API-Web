import { FC, ReactNode } from 'react';
import { useLocation, Outlet, Navigate } from 'react-router-dom';
import { Path } from '../lib/constants/paths';
import { useAuth } from '../lib/context/hooks';
import { Spin } from '@douyinfe/semi-ui';

interface ProtectedRouteProps {
    children?: ReactNode;
}

const ProtectedRoute: FC<ProtectedRouteProps> = ({ children }) => {
    const location = useLocation();
    const { isLoading, user, token } = useAuth();

    if (isLoading) {
        return (
            <Spin
                style={{ height: '100%', width: '100%' }}
                size='large'
                tip={
                    <div style={{ marginTop: 24 }}>
                        加载中...
                    </div>
                }
            />
        );
    }

    if (!user || !token) {
        return <Navigate to={Path.LOGIN} state={{ from: location }} replace />;
    }

    // 如果已登录，渲染子元素，或者如果没有子元素，渲染Outlet（子路由）
    return <>{children || <Outlet />}</>;
};

export default ProtectedRoute; 