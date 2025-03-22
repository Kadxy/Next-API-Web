import { Layout, Nav } from '@douyinfe/semi-ui';
import { IconHome, IconHistogram, IconLive, IconSetting, IconSemiLogo } from '@douyinfe/semi-icons';
import { Path } from './lib/constants/paths';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

type PathKey = (typeof Path)[keyof typeof Path];

const App = () => {
    const { Sider: Sidebar, Content } = Layout;
    const navigate = useNavigate();
    const { pathname } = useLocation();

    const [currentPath, setCurrentPath] = useState<PathKey>(Path.HOME);

    useEffect(() => setCurrentPath(pathname as PathKey), [pathname]);

    return (
        <Layout style={{ border: '1px solid var(--semi-color-border)', height: '100vh' }}>
            <Sidebar style={{ backgroundColor: 'var(--semi-color-bg-1)' }}>
                <Nav
                    selectedKeys={[currentPath]}
                    style={{ height: '100%' }}
                    items={[
                        { itemKey: Path.HOME, text: '首页', icon: <IconHome size="large" /> },
                        { itemKey: Path.DATA, text: '基础数据', icon: <IconHistogram size="large" /> },
                        { itemKey: Path.TEST, text: '测试功能', icon: <IconLive size="large" /> },
                        { itemKey: Path.SETTINGS, text: '设置', icon: <IconSetting size="large" /> },
                    ]}
                    onSelect={(data) => navigate(data.itemKey as PathKey)}
                    header={{
                        logo: <IconSemiLogo />,
                        text: 'World AI Web',
                    }}
                    footer={{
                        collapseButton: false,
                    }}
                />
            </Sidebar>
            <Layout>
                <Content
                    style={{
                        padding: '24px',
                        backgroundColor: 'var(--semi-color-bg-0)',
                        overflow: 'auto',
                    }}
                >
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
};

export default App;
