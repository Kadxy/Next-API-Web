import { FC } from 'react';
import { Button, Card, Typography, Modal, Avatar, Space, Row, Col } from '@douyinfe/semi-ui';
import { useLocation, useNavigate } from 'react-router-dom';
import { Path } from '../../lib/constants/paths';
import { useAuth } from '../../lib/context/hooks';
import { getDayjsEasyRead, getDayjsFormat } from '../../utils';

const { Title, Text } = Typography;

const ProfileCard: FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async (isLogoutAll = false) => {
        Modal.error({
            centered: true,
            title: `确定要${isLogoutAll ? '从所有设备' : ''}登出吗?`,
            content: `您在${isLogoutAll ? '所有已登录设备' : '当前设备'}上的登录将被登出，下次登录时需要重新登录`,
            onOk: async () => {
                await logout(isLogoutAll);
                navigate(Path.LOGIN, { state: { from: location } });
            },
            cancelButtonProps: { theme: 'borderless' }
        });
    };

    if (!user) {
        return null;
    }

    return (
        <Card
            title="个人信息"
            style={{ width: '100%' }}
        >
            <Row gutter={16}>
                {/* 基本信息 */}
                <Col span={16}>
                    <Space spacing='medium' align='start'>
                        {/* 头像 */}
                        {user.avatar ? (
                            <Avatar style={{ width: 48, height: 48 }} shape="circle" src={user?.avatar} />
                        ) : (
                            <Avatar style={{ width: 48, height: 48 }} shape="circle">
                                {user.displayName?.[0]?.toUpperCase()}
                            </Avatar>
                        )}
                        {/* 用户名 和 UID */}
                        <Space vertical align="start">
                            <Title heading={3}>
                                {user.displayName}
                            </Title>
                            <Text type="secondary" copyable>
                                {user.uid}
                            </Text>
                        </Space>
                    </Space>
                </Col>

                {/* 注册时间和登出按钮 */}
                <Col span={8}>
                    <Space vertical align="end" style={{ width: '100%' }}>
                        <Space vertical align='start'>
                            <Text type="tertiary" size="small">
                                注册时间: {getDayjsFormat(user.createdAt, 'YYYY年MM月DD日')}
                            </Text>
                            <Text type="tertiary" size="small">
                                上次登录: {getDayjsEasyRead(user.lastLoginAt)}
                            </Text>
                        </Space>
                        <Space>
                            <Button
                                type="danger"
                                onClick={() => handleLogout(false)}
                            >
                                退出登录
                            </Button>
                            <Button
                                type="danger"
                                onClick={() => handleLogout(true)}
                            >
                                从所有设备登出
                            </Button>
                        </Space>
                    </Space>
                </Col>
            </Row>
        </Card>
    );
};

export default ProfileCard; 