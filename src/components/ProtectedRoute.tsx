import {FC, ReactNode} from 'react';
import {Navigate, Outlet, useLocation} from 'react-router-dom';
import {Path} from '../lib/constants/paths';
import {useAuth} from '../lib/context/hooks';
import LoadingSpinner from './LoadingSpinner';

interface ProtectedRouteProps {
    children?: ReactNode;
}

const ProtectedRoute: FC<ProtectedRouteProps> = ({children}) => {
    const location = useLocation();
    const {initialized, user, token} = useAuth();

    if (!initialized) {
        return <LoadingSpinner />;
    }

    if (!user || !token) {
        return <Navigate to={Path.LOGIN} state={{from: location}} replace/>;
    }

    // 如果已登录，渲染子元素，或者如果没有子元素，渲染Outlet（子路由）
    return <>{children || <Outlet/>}</>;
};

export default ProtectedRoute; 