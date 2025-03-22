import { Path } from '../constants/paths';
import Home from '../../pages/Home';
import Data from '../../pages/Data';
import Test from '../../pages/Test';
import Settings from '../../pages/Settings';
import Login from '../../pages/Login';
import App from '../../App';
import { createBrowserRouter } from 'react-router-dom';
import ProtectedRoute from '../../components/ProtectedRoute';
import ErrorPage from '../../components/ErrorPage';

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
                path: Path.HOME,
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
                        path: Path.DATA,
                        element: <Data />,
                    },
                    {
                        path: Path.TEST,
                        element: <Test />,
                    },
                    {
                        path: Path.SETTINGS,
                        element: <Settings />,
                    },
                ],
            },
        ],
    },
]);
