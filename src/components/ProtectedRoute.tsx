import { FC, ReactNode } from 'react';
import { useLocation, Outlet, Navigate } from 'react-router-dom';
import { Path } from '../lib/constants/paths';
import { STORE_KEYS } from '../lib/constants/store';

interface ProtectedRouteProps {
    children?: ReactNode;
}

const ProtectedRoute: FC<ProtectedRouteProps> = ({ children }) => {
    const location = useLocation();
    const token = localStorage.getItem(STORE_KEYS.TOKEN);

    if (!token) {
        return <Navigate to={Path.LOGIN} state={{ from: location }} replace />;
    }

    // 如果已登录，渲染子元素，或者如果没有子元素，渲染Outlet（子路由）
    return <>{children || <Outlet />}</>;
};

export default ProtectedRoute; 