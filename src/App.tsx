import { Layout, Nav, Toast } from '@douyinfe/semi-ui';
import { IconHome, IconKey, IconSetting, IconUser } from '@douyinfe/semi-icons';
import { NO_SIDEBAR_PATHS, Path } from './lib/constants/paths';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

type PathKey = (typeof Path)[keyof typeof Path];

const Header = () => {
    return (
        <div style={{
            textAlign: 'center',
            width: '100%',
            fontSize: 32,
            fontWeight: 600,
            fontFamily: 'monospace',
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
    useEffect(() => setCurrentPath(pathname as PathKey), [pathname]);

    // Show sidebar if current path is not in NO_SIDEBAR_PATHS
    const showSidebar = !NO_SIDEBAR_PATHS.includes(currentPath);

    return (
        <Layout style={{ height: '100vh' }}>
            {showSidebar && (
                <Layout.Sider>
                    <Nav
                        selectedKeys={[currentPath]}
                        style={{ height: '100%' }}
                        items={[
                            { itemKey: Path.ROOT, text: '首页', icon: <IconHome /> },
                            { itemKey: Path.API_KEYS, text: 'API Keys', icon: <IconKey /> },
                            { itemKey: Path.ACCOUNT, text: '账户', icon: <IconUser /> },
                            { itemKey: Path.SETTINGS, text: '设置', icon: <IconSetting /> },
                        ]}
                        onSelect={(data) => navigate(data.itemKey as PathKey)}
                        header={<Header />}
                        footer={{ collapseButton: true }}
                    />
                </Layout.Sider>
            )}
            <Layout style={{ padding: 32, height: '100%', overflow: 'auto' }}>
                <Outlet />
            </Layout>
        </Layout>
    );
};

export default App;
