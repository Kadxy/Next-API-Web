import { FC } from 'react';
import { Button, Card, Modal, Space, Typography } from '@douyinfe/semi-ui';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/context/hooks';
import { Path } from '../../lib/constants/paths';
import { IconDelete, IconExit, IconStrikeThrough } from '@douyinfe/semi-icons';

const DangerArea: FC = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();


    const handleLogout = async (isLogoutAll = false) => {
        Modal.confirm({
            centered: true,
            title: isLogoutAll ? '从所有设备登出' : '退出登录',
            content: isLogoutAll ? '这将使所有已登录设备登录状态失效，下次访问时需要重新登录' : '退出登录后，你将无法收到该账号的通知',
            onOk: async () => {
                await logout(isLogoutAll);
                navigate(Path.LOGIN, { state: { from: location } });
            },
            cancelButtonProps: { theme: 'borderless' },
            okButtonProps: { theme: 'solid', type: 'danger' },
            okText: isLogoutAll ? '登出' : '退出',
            closable: false,
        });
    };

    return (
        <Card style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography.Title heading={6}>
                    账户选项
                </Typography.Title>
                <Space wrap>
                    <Button
                        type='danger'
                        icon={<IconDelete />}
                        onClick={() => Modal.info({
                            centered: true,
                            title: '注销账号',
                            content: '账户注销后该账户将无法访问，请备份重要数据后联系管理员注销',
                            closable: false,
                        })}
                    >
                        注销账号
                    </Button>
                    <Button
                        type='danger'
                        onClick={() => handleLogout(true)}
                        icon={<IconStrikeThrough />}
                    >
                        登出全部
                    </Button>
                    <Button
                        type='tertiary'
                        onClick={() => handleLogout(false)}
                        icon={<IconExit />}
                    >
                        退出登录
                    </Button>
                </Space>
            </div>
        </Card>
    );
};

export default DangerArea;