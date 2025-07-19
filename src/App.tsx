import { Layout, Nav, Toast } from '@douyinfe/semi-ui';
import {
    IconCode,
    IconCreditCard,
    IconHelpCircle,
    IconHistogram,
    IconHome,
    IconKey,
    IconLayers,
    IconList,
    IconUser
} from '@douyinfe/semi-icons';
import { NO_SIDEBAR_PATHS, Path } from './lib/constants/paths';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';

type PathKey = (typeof Path)[keyof typeof Path];

const Header = () => {
    return (
        <div style={{
            textAlign: 'center',
            width: '100%',
            fontSize: 24,
            fontWeight: 600,
            fontFamily: 'Arial, sans-serif',
            letterSpacing: 1,
        }}>
            {import.meta.env.VITE_APP_NAME}
        </div>
    );
};

const App = () => {
    const navigate = useNavigate();
    const { pathname } = useLocation();

    // Set toast config
    Toast.config({ theme: 'light' });

    // Current path
    const [currentPath, setCurrentPath] = useState<PathKey>(Path.ROOT);

    // Update current path when location changes
    useEffect(() => {
        // 核心思路：匹配第一个 "/xxx" 的路径部分作为 basePath
        const basePath = pathname.match(/^(\/[^/]+)/)?.[1] || Path.ROOT;
        setCurrentPath(basePath as PathKey);
    }, [pathname]);

    // Show sidebar if current path is not in NO_SIDEBAR_PATHS
    const showSidebar = !NO_SIDEBAR_PATHS.includes(currentPath);

    const items = useMemo(() => {
        return [
            { itemKey: Path.ROOT, text: '首页', icon: <IconHome /> },
            { itemKey: Path.USAGE, text: '用量信息', icon: <IconHistogram /> },
            { itemKey: Path.API_KEYS, text: 'API Keys', icon: <IconKey /> },
            { itemKey: Path.WALLETS, text: '钱包管理', icon: <IconCreditCard /> },
            { itemKey: Path.TRANSACTIONS, text: '交易记录', icon: <IconList /> },
            { itemKey: Path.ACCESS, text: '接入文档', icon: <IconCode /> },
            { itemKey: Path.MODEL_LIST, text: '模型列表', icon: <IconLayers /> },
            { itemKey: Path.FAQ, text: '常见问题', icon: <IconHelpCircle /> },
            { itemKey: Path.ACCOUNT, text: '个人中心', icon: <IconUser /> },
        ];
    }, []);

    return (
        <Layout style={{ height: '100vh' }}>
            {showSidebar && (
                <Layout.Sider>
                    <Nav
                        header={<Header />}
                        selectedKeys={[currentPath]}
                        style={{ height: '100%', maxWidth: '200px' }}
                        items={items}
                        onSelect={(data) => navigate(data.itemKey as PathKey)}
                        footer={{
                            collapseButton: true,
                        }}
                    />
                </Layout.Sider>
            )}
            <Layout style={{ padding: '32px 40px', height: '100%', overflow: 'auto' }}>
                <Outlet />
            </Layout>
        </Layout>
    );
};

export default App;
