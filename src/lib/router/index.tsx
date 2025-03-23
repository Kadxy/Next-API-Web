import { Path } from '../constants/paths';
import Home from '../../pages/Home';
import Settings from '../../pages/Settings';
import Login from '../../pages/Login';
import Account from '../../pages/Account';
import App from '../../App';
import { createBrowserRouter } from 'react-router-dom';
import ProtectedRoute from '../../components/ProtectedRoute';
import ErrorPage from '../../components/ErrorPage';
import { Navigate } from 'react-router-dom';

// 定义路由配置
export const router = createBrowserRouter([
    {
        path: Path.ROOT,
        element: <App />,
        errorElement: <ErrorPage />,
        children: [
            {
                index: true,
                element: <Home />,
            },
            {
                path: Path.LOGIN,
                element: <Login />,
            },
            // 受保护的路由
            {
                element: <ProtectedRoute />,
                children: [
                    {
                        path: Path.ACCOUNT,
                        element: <Account />,
                    },
                    {
                        path: Path.SETTINGS,
                        element: <Settings />,
                    },
                ],
            },
            {
                path: '*',
                element: <Navigate to={Path.ROOT} />,
            },
        ],
    },
]);
