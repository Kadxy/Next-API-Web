import { Path } from '../constants/paths';
import { lazy } from 'react';
import App from '../../App';
import { createBrowserRouter } from 'react-router-dom';
import ProtectedRoute from '../../components/ProtectedRoute';
import ErrorPage from '../../components/ErrorPage';
import { Navigate } from 'react-router-dom';
import SuspenseWrapper from '../../components/SuspenseWrapper';

// 懒加载页面组件
const Home = lazy(() => import('../../pages/Home'));
const Login = lazy(() => import('../../pages/Login'));
const Callback = lazy(() => import('../../pages/Callback'));
const Account = lazy(() => import('../../pages/Account/index'));
const ApiKeys = lazy(() => import('../../pages/ApiKeys'));
const Recharge = lazy(() => import('../../pages/Recharge'));
const Access = lazy(() => import('../../pages/Access'));
const FAQ = lazy(() => import('../../pages/FAQ'));
const ModelList = lazy(() => import('../../pages/ModelList'));
const Wallets = lazy(() => import('../../pages/Wallets'));
const Transactions = lazy(() => import('../../pages/Transactions'));



// 定义路由配置
export const router = createBrowserRouter([
    {
        path: Path.ROOT,
        element: <App />,
        errorElement: <ErrorPage />,
        children: [
            {
                index: true,
                element: <SuspenseWrapper><Home /></SuspenseWrapper>,
            },
            {
                path: Path.LOGIN,
                element: <SuspenseWrapper><Login /></SuspenseWrapper>,
            },
            {
                path: Path.CALLBACK_DYNAMIC,
                element: <SuspenseWrapper><Callback /></SuspenseWrapper>,
            },
            // 受保护的路由
            {
                element: <ProtectedRoute />,
                children: [
                    {
                        path: Path.ACCOUNT,
                        element: <SuspenseWrapper><Account /></SuspenseWrapper>,
                    },
                    {
                        path: Path.API_KEYS,
                        element: <SuspenseWrapper><ApiKeys /></SuspenseWrapper>,
                    },
                    {
                        path: Path.RECHARGE,
                        element: <SuspenseWrapper><Recharge /></SuspenseWrapper>,
                    },
                    {
                        path: Path.ACCESS,
                        element: <SuspenseWrapper><Access /></SuspenseWrapper>,
                    },
                    {
                        path: Path.FAQ,
                        element: <SuspenseWrapper><FAQ /></SuspenseWrapper>,
                    },
                    {
                        path: Path.MODEL_LIST,
                        element: <SuspenseWrapper><ModelList /></SuspenseWrapper>,
                    },
                    {
                        path: Path.WALLETS,
                        element: <SuspenseWrapper><Wallets /></SuspenseWrapper>,
                    },
                    {
                        path: Path.WALLETS_DETAIL,
                        element: <SuspenseWrapper><Wallets /></SuspenseWrapper>,
                    },
                    {
                        path: Path.TRANSACTIONS,
                        element: <SuspenseWrapper><Transactions /></SuspenseWrapper>,
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
