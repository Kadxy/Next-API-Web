import {Layout, Nav, Toast, Typography} from '@douyinfe/semi-ui';
import {IconHome, IconSetting} from '@douyinfe/semi-icons';
import {Path} from './lib/constants/paths';
import {Outlet, useLocation, useNavigate} from 'react-router-dom';
import {useEffect, useState} from 'react';

type PathKey = (typeof Path)[keyof typeof Path];

const Header = () => {
    return (
        <div style={{textAlign: 'center'}}>
            <Typography.Title heading={2} >
                {import.meta.env.VITE_APP_NAME}
            </Typography.Title>
        </div>
    );
};

const App = () => {
    const navigate = useNavigate();
    const {pathname} = useLocation();

    // Set toast config
    Toast.config({theme: 'light'});

    // Current path
    const [currentPath, setCurrentPath] = useState<PathKey>(Path.ROOT);

    // Update current path when location changes
    useEffect(() => setCurrentPath(pathname as PathKey), [pathname]);

    return (
        <Layout style={{height: '100vh'}}>
            <Layout.Sider>
                <Nav
                    selectedKeys={[currentPath]}
                    style={{height: '100%'}}
                    items={[
                        {itemKey: Path.ROOT, text: '首页', icon: <IconHome size="large"/>},
                        {itemKey: Path.SETTINGS, text: '设置', icon: <IconSetting size="large"/>},
                    ]}
                    onSelect={(data) => navigate(data.itemKey as PathKey)}
                    header={<Header/>}
                />
            </Layout.Sider>
            <Layout style={{padding: '24px', height: '100%', overflow: 'auto'}}>
                <Outlet/>
            </Layout>
        </Layout>
    );
};

export default App;
