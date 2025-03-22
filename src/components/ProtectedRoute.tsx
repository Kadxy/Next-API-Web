import React, { ReactNode } from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../lib/context/hooks';
import { Path } from '../lib/constants/paths';
import { Spin } from '@douyinfe/semi-ui';

interface ProtectedRouteProps {
    children?: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Spin size="large" tip="加载中..." />
            </div>
        );
    }

    if (!isAuthenticated) {
        // 未登录时重定向到登录页，并保存当前位置
        return <Navigate to={Path.LOGIN} state={{ from: location }} replace />;
    }

    // 如果已登录，渲染子元素，或者如果没有子元素，渲染Outlet（子路由）
    return <>{children || <Outlet />}</>;
};

export default ProtectedRoute; 