import { Path } from '../constants/paths';
import Home from '../../pages/Home';
import Login from '../../pages/Login';
import Account from '../../pages/Account/index';
import ApiKeys from '../../pages/ApiKeys';
import Recharge from '../../pages/Recharge';
import Access from '../../pages/Access';
import FAQ from '../../pages/FAQ';
import ModelList from '../../pages/ModelList';
import Wallets from '../../pages/Wallets';
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
                        path: Path.API_KEYS,
                        element: <ApiKeys />,
                    },
                    {
                        path: Path.RECHARGE,
                        element: <Recharge />,
                    },
                    {
                        path: Path.ACCESS,
                        element: <Access />,
                    },
                    {
                        path: Path.FAQ,
                        element: <FAQ />,
                    },
                    {
                        path: Path.MODEL_LIST,
                        element: <ModelList />,
                    },
                    {
                        path: Path.WALLETS,
                        element: <Wallets />,
                    },
                    {
                        path: `${Path.WALLETS}/:uid`,
                        element: <Wallets />,
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
